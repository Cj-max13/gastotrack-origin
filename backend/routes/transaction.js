const express = require('express');
const router  = express.Router();
const { body, validationResult } = require('express-validator');
const { getTransactions, createTransaction, deleteTransaction } = require('../controllers/transactionController');
const { protect } = require('../middleware/autMiddleware');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  next();
};

const validateTransaction = [
  body('merchant').trim().notEmpty().withMessage('Merchant name is required'),
  body('amount').isFloat().withMessage('Amount must be a number'),
  body('category').optional().trim(),
  body('source').optional().trim(),
  body('notes').optional().trim(),
];

router.get('/',       protect, getTransactions);
router.post('/',      protect, validateTransaction, validate, createTransaction);
router.delete('/:id', protect, deleteTransaction);

module.exports = router;
