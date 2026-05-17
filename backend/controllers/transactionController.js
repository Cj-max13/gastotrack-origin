const prisma = require('../lib/prisma');

// GET /api/transactions — get all transactions for logged-in user
const getTransactions = async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.userId },
      orderBy: { date: 'desc' },
    });
    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

// POST /api/transactions — create a new transaction
const createTransaction = async (req, res) => {
  const { amount, merchant, category, source, notes, date } = req.body;

  if (!amount || !merchant) {
    return res.status(400).json({ error: 'Amount and merchant are required' });
  }

  try {
    const transaction = await prisma.transaction.create({
      data: {
        userId:   req.userId,
        amount:   parseFloat(amount),
        merchant,
        category: category || 'Uncategorized',
        source:   source   || 'manual',
        notes:    notes    || null,
        date:     date ? new Date(date) : new Date(),
      },
    });
    res.status(201).json(transaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
};

// DELETE /api/transactions/:id — delete a transaction
const deleteTransaction = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const tx = await prisma.transaction.findUnique({ where: { id } });

    if (!tx || tx.userId !== req.userId) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    await prisma.transaction.delete({ where: { id } });
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
};

// PUT /api/transactions/:id — update a transaction
const updateTransaction = async (req, res) => {
  const id = parseInt(req.params.id);
  const { amount, merchant, category, source, notes, date } = req.body;

  try {
    const tx = await prisma.transaction.findUnique({ where: { id } });

    if (!tx || tx.userId !== req.userId) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        amount:   amount !== undefined ? parseFloat(amount) : tx.amount,
        merchant: merchant || tx.merchant,
        category: category || tx.category,
        source:   source || tx.source,
        notes:    notes !== undefined ? notes : tx.notes,
        date:     date ? new Date(date) : tx.date,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
};

module.exports = { getTransactions, createTransaction, deleteTransaction, updateTransaction };
