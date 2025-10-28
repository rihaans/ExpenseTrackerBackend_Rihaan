/**
 * Expense Routes
 * Defines routes for expense management operations
 */

const express = require('express');
const router = express.Router();
const {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense
} = require('../controllers/expenseController');
const { verifyFirebaseToken } = require('../middleware/authMiddleware');
const {
  validateCreateExpense,
  validateUpdateExpense,
  validateObjectId
} = require('../middleware/validators');

// All expense routes require authentication
router.use(verifyFirebaseToken);

/**
 * @route   GET /api/expenses
 * @desc    Get all expenses for logged-in user
 * @access  Private
 * @query   category, startDate, endDate, sortBy, order, limit, page
 */
router.get('/', getAllExpenses);

/**
 * @route   POST /api/expenses
 * @desc    Create a new expense
 * @access  Private
 */
router.post('/', validateCreateExpense, createExpense);

/**
 * @route   GET /api/expenses/:id
 * @desc    Get a single expense by ID
 * @access  Private
 */
router.get('/:id', validateObjectId, getExpenseById);

/**
 * @route   PUT /api/expenses/:id
 * @desc    Update an expense
 * @access  Private
 */
router.put('/:id', validateObjectId, validateUpdateExpense, updateExpense);

/**
 * @route   DELETE /api/expenses/:id
 * @desc    Delete an expense
 * @access  Private
 */
router.delete('/:id', validateObjectId, deleteExpense);

module.exports = router;
