const prisma = require('../lib/prisma');

// GET /api/analytics/summary?period=day|week|month
const getSummary = async (req, res) => {
  const { period = 'week' } = req.query;
  const now = new Date();

  let startDate;
  let prevStartDate;
  let prevEndDate;

  if (period === 'day') {
    startDate     = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    prevEndDate   = new Date(startDate.getTime() - 1);
    prevStartDate = new Date(prevEndDate.getFullYear(), prevEndDate.getMonth(), prevEndDate.getDate());
  } else if (period === 'week') {
    const day     = now.getDay();
    startDate     = new Date(now);
    startDate.setDate(now.getDate() - day);
    startDate.setHours(0, 0, 0, 0);
    prevEndDate   = new Date(startDate.getTime() - 1);
    prevStartDate = new Date(prevEndDate);
    prevStartDate.setDate(prevEndDate.getDate() - 6);
    prevStartDate.setHours(0, 0, 0, 0);
  } else {
    // month
    startDate     = new Date(now.getFullYear(), now.getMonth(), 1);
    prevEndDate   = new Date(startDate.getTime() - 1);
    prevStartDate = new Date(prevEndDate.getFullYear(), prevEndDate.getMonth(), 1);
  }

  try {
    // Current period transactions (expenses only)
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.userId,
        date:   { gte: startDate, lte: now },
        amount: { lt: 0 },
      },
      orderBy: { date: 'asc' },
    });

    // Previous period transactions
    const prevTransactions = await prisma.transaction.findMany({
      where: {
        userId: req.userId,
        date:   { gte: prevStartDate, lte: prevEndDate },
        amount: { lt: 0 },
      },
    });

    // Total spend
    const total     = transactions.reduce((s, t) => s + Math.abs(t.amount), 0);
    const prevTotal = prevTransactions.reduce((s, t) => s + Math.abs(t.amount), 0);
    const vsLast    = prevTotal > 0 ? Math.round(((total - prevTotal) / prevTotal) * 100) : 0;

    // Category breakdown
    const categoryMap = {};
    transactions.forEach(tx => {
      const cat = tx.category || 'Uncategorized';
      categoryMap[cat] = (categoryMap[cat] || 0) + Math.abs(tx.amount);
    });
    const categories = Object.entries(categoryMap)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);

    // Daily trends (last 7 days always)
    const dailyTrends = [];
    for (let i = 6; i >= 0; i--) {
      const d     = new Date(now);
      d.setDate(now.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd   = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

      const dayTotal = transactions
        .filter(tx => new Date(tx.date) >= dayStart && new Date(tx.date) <= dayEnd)
        .reduce((s, t) => s + Math.abs(t.amount), 0);

      dailyTrends.push(dayTotal);
    }

    const avgPerDay = dailyTrends.filter(v => v > 0).length > 0
      ? total / dailyTrends.filter(v => v > 0).length
      : 0;

    // Top merchants (highest expenditure)
    const merchantMap = {};
    transactions.forEach(tx => {
      merchantMap[tx.merchant] = (merchantMap[tx.merchant] || 0) + Math.abs(tx.amount);
    });
    const highest = Object.entries(merchantMap)
      .map(([name, amount]) => ({ name, amount, category: transactions.find(t => t.merchant === name)?.category || 'Other' }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);

    res.json({ total, prevTotal, vsLast, categories, dailyTrends, avgPerDay, highest });
  } catch (err) {
    console.error('[getSummary error]', err.message);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

// GET /api/analytics/dashboard — dashboard summary (monthly spend + recent)
const getDashboard = async (req, res) => {
  try {
    const now        = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Monthly spend for last 9 months
    const monthlySpend = [];
    for (let i = 8; i >= 0; i--) {
      const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mEnd   = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const total = await prisma.transaction.aggregate({
        where: {
          userId: req.userId,
          date:   { gte: mStart, lte: mEnd },
          amount: { lt: 0 },
        },
        _sum: { amount: true },
      });
      monthlySpend.push(Math.abs(total._sum.amount || 0));
    }

    // Current month total
    const currentMonthTotal = monthlySpend[monthlySpend.length - 1];
    const lastMonthTotal    = monthlySpend[monthlySpend.length - 2] || 0;

    // Active budget total
    const budgets = await prisma.budget.findMany({ where: { userId: req.userId } });
    const activeBudget = budgets.reduce((s, b) => s + b.limitAmt, 0);

    // Recent 5 transactions
    const recent = await prisma.transaction.findMany({
      where:   { userId: req.userId },
      orderBy: { date: 'desc' },
      take:    5,
    });

    res.json({ monthlySpend, currentMonthTotal, lastMonthTotal, activeBudget, recent });
  } catch (err) {
    console.error('[getDashboard error]', err.message);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

module.exports = { getSummary, getDashboard };
