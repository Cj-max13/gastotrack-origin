const { GoogleGenerativeAI } = require('@google/generative-ai');
const { PrismaClient }       = require('@prisma/client');
const { PrismaPg }           = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma  = new PrismaClient({ adapter });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ── Build financial context from user's real data ─────────────────────────────
async function buildFinancialContext(userId) {
  const now        = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekAgo    = new Date(now);
  weekAgo.setDate(now.getDate() - 7);

  // Last 30 transactions
  const transactions = await prisma.transaction.findMany({
    where:   { userId },
    orderBy: { date: 'desc' },
    take:    30,
  });

  // This month's transactions
  const monthTx = await prisma.transaction.findMany({
    where: { userId, date: { gte: monthStart } },
  });

  // Budgets
  const budgets = await prisma.budget.findMany({ where: { userId } });

  // Category totals this month
  const categoryTotals = {};
  monthTx.filter(t => t.amount < 0).forEach(t => {
    const cat = t.category || 'Uncategorized';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + Math.abs(t.amount);
  });

  // Total spend this month
  const totalSpent = monthTx
    .filter(t => t.amount < 0)
    .reduce((s, t) => s + Math.abs(t.amount), 0);

  // Total income this month
  const totalIncome = monthTx
    .filter(t => t.amount > 0)
    .reduce((s, t) => s + t.amount, 0);

  // Budget status
  const budgetStatus = budgets.map(b => ({
    category: b.category,
    limit:    b.limitAmt,
    spent:    categoryTotals[b.category.toLowerCase()] || categoryTotals[b.category] || 0,
  }));

  // Recent transactions summary
  const recentSummary = transactions.slice(0, 10).map(t =>
    `${new Date(t.date).toLocaleDateString()} | ${t.merchant} | ${t.category} | ₱${Math.abs(t.amount).toFixed(2)} | ${t.amount < 0 ? 'expense' : 'income'}`
  ).join('\n');

  return `
FINANCIAL CONTEXT FOR THIS USER (Philippine Peso ₱):
Current Date: ${now.toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}

THIS MONTH SUMMARY:
- Total Spent: ₱${totalSpent.toFixed(2)}
- Total Income: ₱${totalIncome.toFixed(2)}
- Net: ₱${(totalIncome - totalSpent).toFixed(2)}

SPENDING BY CATEGORY THIS MONTH:
${Object.entries(categoryTotals).map(([cat, amt]) => `- ${cat}: ₱${amt.toFixed(2)}`).join('\n') || '- No spending data yet'}

BUDGET STATUS:
${budgetStatus.length > 0
  ? budgetStatus.map(b => {
      const pct  = b.limit > 0 ? ((b.spent / b.limit) * 100).toFixed(0) : 0;
      const stat = b.spent > b.limit ? 'OVER BUDGET' : b.spent / b.limit >= 0.8 ? 'NEAR LIMIT' : 'ON TRACK';
      return `- ${b.category}: ₱${b.spent.toFixed(2)} / ₱${b.limit.toFixed(2)} (${pct}%) — ${stat}`;
    }).join('\n')
  : '- No budgets set'}

RECENT TRANSACTIONS (last 10):
${recentSummary || '- No transactions yet'}
`.trim();
}

// POST /api/ai/chat
const chat = async (req, res) => {
  const { message, history = [] } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const financialContext = await buildFinancialContext(req.userId);

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // System instruction — makes it a financial AI agent
    const systemPrompt = `You are GastoTrack AI, an intelligent personal finance assistant for Filipino users. 
You have access to the user's real financial data shown below. Use it to give specific, personalized advice.

RULES:
- Always respond in a friendly, concise, helpful tone
- Use Philippine Peso (₱) for all amounts
- Give specific numbers from the user's data when relevant
- If asked about something not in the data, say so honestly
- Keep responses under 200 words unless a detailed breakdown is requested
- You can suggest budgets, flag overspending, identify trends, and give savings tips
- Never make up transaction data — only use what's provided

${financialContext}`;

    // Build chat history for multi-turn conversation
    const chatHistory = history.map(msg => ({
      role:  msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const chatSession = model.startChat({
      history: [
        { role: 'user',  parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'Understood. I have access to your financial data and I\'m ready to help you manage your finances.' }] },
        ...chatHistory,
      ],
    });

    const result   = await chatSession.sendMessage(message);
    const response = result.response.text();

    res.json({ reply: response });
  } catch (err) {
    console.error('[AI chat error]', err.message);

    // Graceful fallback if Gemini key not set
    if (err.message?.includes('API_KEY') || err.message?.includes('API key')) {
      return res.status(503).json({
        error: 'AI service not configured. Please set GEMINI_API_KEY in backend/.env',
      });
    }

    res.status(500).json({ error: 'AI service temporarily unavailable. Please try again.' });
  }
};

module.exports = { chat };
