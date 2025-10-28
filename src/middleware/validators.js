/**
 * Validation Middleware
 * Input validation using express-validator
 */

const { body, query, param, validationResult } = require('express-validator');

/**
 * Middleware to handle validation errors
 * Must be called after validation rules
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }

  next();
};

/**
 * Validation rules for user registration
 */
const validateRegister = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  handleValidationErrors
];

/**
 * Validation rules for user login
 */
const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

/**
 * Validation rules for creating an expense
 */
const validateCreateExpense = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Expense title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number greater than 0')
    .toFloat(),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn([
      'Food',
      'Transportation',
      'Entertainment',
      'Healthcare',
      'Shopping',
      'Bills',
      'Education',
      'Travel',
      'Personal',
      'Other'
    ])
    .withMessage('Invalid category'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date')
    .toDate(),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  body('paymentMethod')
    .optional()
    .isIn(['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Other'])
    .withMessage('Invalid payment method'),
  handleValidationErrors
];

/**
 * Validation rules for updating an expense
 */
const validateUpdateExpense = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number greater than 0')
    .toFloat(),
  body('category')
    .optional()
    .isIn([
      'Food',
      'Transportation',
      'Entertainment',
      'Healthcare',
      'Shopping',
      'Bills',
      'Education',
      'Travel',
      'Personal',
      'Other'
    ])
    .withMessage('Invalid category'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date')
    .toDate(),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  body('paymentMethod')
    .optional()
    .isIn(['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Other'])
    .withMessage('Invalid payment method'),
  handleValidationErrors
];

/**
 * Validation rules for MongoDB ObjectId parameters
 */
const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid expense ID'),
  handleValidationErrors
];

/**
 * Validation rules for monthly report query parameters
 */
const validateMonthlyReport = [
  query('month')
    .notEmpty()
    .withMessage('Month is required')
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be a number between 1 and 12')
    .toInt(),
  query('year')
    .notEmpty()
    .withMessage('Year is required')
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Year must be a valid year between 2000 and 2100')
    .toInt(),
  handleValidationErrors
];

/**
 * Validation rules for category filter query parameter
 */
const validateCategoryFilter = [
  query('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn([
      'Food',
      'Transportation',
      'Entertainment',
      'Healthcare',
      'Shopping',
      'Bills',
      'Education',
      'Travel',
      'Personal',
      'Other'
    ])
    .withMessage('Invalid category'),
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateCreateExpense,
  validateUpdateExpense,
  validateObjectId,
  validateMonthlyReport,
  validateCategoryFilter,
  handleValidationErrors
};
