const express = require('express');
const router  = express.Router();
const { body, validationResult } = require('express-validator');
const { getBudgets, createBudget, updateBudget, deleteBudget } = require('../controllers/budgetController');
const { protect } = require('../middleware/autMiddleware');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  next();
};

const validateBudget = [
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('limitAmt').isFloat({ gt: 0 }).withMessage('Limit must be a positive number'),
];

const validateUpdate = [
  body('limitAmt').isFloat({ gt: 0 }).withMessage('Limit must be a positive number'),
];

router.get('/',       protect, getBudgets);
router.post('/',      protect, validateBudget, validate, createBudget);
router.put('/:id',    protect, validateUpdate,  validate, updateBudget);
router.delete('/:id', protect, deleteBudget);

module.exports = router;
