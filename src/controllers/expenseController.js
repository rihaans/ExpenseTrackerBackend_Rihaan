/**
 * Expense Controller
 * Handles CRUD operations for expense management
 */

const Expense = require('../models/Expense');
const { AppError } = require('../middleware/errorHandler');

/**
 * Get all expenses for the logged-in user
 * Supports optional filtering and sorting
 * @route GET /api/expenses
 * @access Private
 */
const getAllExpenses = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const {
      category,
      startDate,
      endDate,
      sortBy = 'date',
      order = 'desc',
      limit,
      page = 1
    } = req.query;

    // Build query filter
    const filter = { userId: uid };

    // Add category filter if provided
    if (category) {
      filter.category = category;
    }

    // Add date range filter if provided
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate);
      }
    }

    // Build sort object
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sortBy]: sortOrder };

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = limit ? parseInt(limit) : null;
    const skip = limitNum ? (pageNum - 1) * limitNum : 0;

    // Execute query
    let query = Expense.find(filter).sort(sortObj);

    if (limitNum) {
      query = query.skip(skip).limit(limitNum);
    }

    const expenses = await query.lean();

    // Get total count for pagination
    const totalExpenses = await Expense.countDocuments(filter);
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    res.status(200).json({
      success: true,
      message: 'Expenses retrieved successfully',
      data: {
        expenses,
        pagination: limitNum ? {
          currentPage: pageNum,
          totalPages: Math.ceil(totalExpenses / limitNum),
          totalExpenses,
          expensesPerPage: limitNum
        } : null,
        summary: {
          totalExpenses,
          totalAmount: parseFloat(totalAmount.toFixed(2))
        }
      }
    });
  } catch (error) {
    console.error('Get all expenses error:', error);
    next(new AppError(error.message || 'Failed to retrieve expenses', 500));
  }
};

/**
 * Get a single expense by ID
 * @route GET /api/expenses/:id
 * @access Private
 */
const getExpenseById = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;

    const expense = await Expense.findOne({ _id: id, userId: uid });

    if (!expense) {
      return next(new AppError('Expense not found or unauthorized', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Expense retrieved successfully',
      data: expense
    });
  } catch (error) {
    console.error('Get expense by ID error:', error);
    next(new AppError(error.message || 'Failed to retrieve expense', 500));
  }
};

/**
 * Create a new expense
 * @route POST /api/expenses
 * @access Private
 */
const createExpense = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { title, amount, category, date, notes, paymentMethod } = req.body;

    const expense = await Expense.create({
      userId: uid,
      title,
      amount,
      category,
      date: date || new Date(),
      notes: notes || '',
      paymentMethod: paymentMethod || 'Other'
    });

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: expense
    });
  } catch (error) {
    console.error('Create expense error:', error);
    next(new AppError(error.message || 'Failed to create expense', 500));
  }
};

/**
 * Update an existing expense
 * @route PUT /api/expenses/:id
 * @access Private
 */
const updateExpense = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;
    const updates = req.body;

    // Find expense and verify ownership
    const expense = await Expense.findOne({ _id: id, userId: uid });

    if (!expense) {
      return next(new AppError('Expense not found or unauthorized', 404));
    }

    // Update allowed fields
    const allowedUpdates = ['title', 'amount', 'category', 'date', 'notes', 'paymentMethod'];
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        expense[key] = updates[key];
      }
    });

    await expense.save();

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: expense
    });
  } catch (error) {
    console.error('Update expense error:', error);
    next(new AppError(error.message || 'Failed to update expense', 500));
  }
};

/**
 * Delete an expense
 * @route DELETE /api/expenses/:id
 * @access Private
 */
const deleteExpense = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;

    const expense = await Expense.findOneAndDelete({ _id: id, userId: uid });

    if (!expense) {
      return next(new AppError('Expense not found or unauthorized', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
      data: {
        deletedExpense: expense
      }
    });
  } catch (error) {
    console.error('Delete expense error:', error);
    next(new AppError(error.message || 'Failed to delete expense', 500));
  }
};

module.exports = {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense
};
