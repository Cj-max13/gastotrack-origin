const express = require('express');
const router = express.Router();
const { getTransactions, createTransaction, deleteTransaction } = require('../controllers/transactionController');
const { protect } = require('../middleware/autMiddleware');

router.get('/',     protect, getTransactions);
router.post('/',    protect, createTransaction);
router.delete('/:id', protect, deleteTransaction);

module.exports = router;
