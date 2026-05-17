const prisma = require('../lib/prisma');

// GET /api/budgets — get all budgets with current spend calculated
const getBudgets = async (req, res) => {
  try {
    const budgets = await prisma.budget.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'asc' },
    });

    // Calculate spent amount per category from transactions this month
    const now        = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.userId,
        date:   { gte: monthStart, lte: monthEnd },
        amount: { lt: 0 }, // expenses only
      },
    });

    const spentByCategory = {};
    transactions.forEach(tx => {
      const cat = tx.category.toLowerCase();
      spentByCategory[cat] = (spentByCategory[cat] || 0) + Math.abs(tx.amount);
    });

    const result = budgets.map(b => ({
      ...b,
      spent: spentByCategory[b.category.toLowerCase()] || 0,
    }));

    res.json(result);
  } catch (err) {
    console.error('[getBudgets error]', err.message);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
};

// POST /api/budgets — create a new budget
const createBudget = async (req, res) => {
  const { category, limitAmt, period } = req.body;

  if (!category || !limitAmt) {
    return res.status(400).json({ error: 'Category and limit amount are required' });
  }

  try {
    // Prevent duplicate category budgets for same user
    const existing = await prisma.budget.findFirst({
      where: { userId: req.userId, category },
    });
    if (existing) {
      return res.status(400).json({ error: `Budget for "${category}" already exists` });
    }

    const budget = await prisma.budget.create({
      data: {
        userId:   req.userId,
        category,
        limitAmt: parseFloat(limitAmt),
        period:   period || 'monthly',
      },
    });
    res.status(201).json(budget);
  } catch (err) {
    console.error('[createBudget error]', err.message);
    res.status(500).json({ error: 'Failed to create budget' });
  }
};

// PUT /api/budgets/:id — update a budget limit
const updateBudget = async (req, res) => {
  const id = parseInt(req.params.id);
  const { limitAmt, period } = req.body;

  if (!limitAmt) {
    return res.status(400).json({ error: 'Limit amount is required' });
  }

  try {
    const budget = await prisma.budget.findUnique({ where: { id } });

    if (!budget || budget.userId !== req.userId) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    const updated = await prisma.budget.update({
      where: { id },
      data: {
        limitAmt: parseFloat(limitAmt),
        ...(period && { period }),
      },
    });
    res.json(updated);
  } catch (err) {
    console.error('[updateBudget error]', err.message);
    res.status(500).json({ error: 'Failed to update budget' });
  }
};

// DELETE /api/budgets/:id — delete a budget
const deleteBudget = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const budget = await prisma.budget.findUnique({ where: { id } });

    if (!budget || budget.userId !== req.userId) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    await prisma.budget.delete({ where: { id } });
    res.json({ message: 'Budget deleted' });
  } catch (err) {
    console.error('[deleteBudget error]', err.message);
    res.status(500).json({ error: 'Failed to delete budget' });
  }
};

module.exports = { getBudgets, createBudget, updateBudget, deleteBudget };
