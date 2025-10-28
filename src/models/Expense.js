/**
 * Expense Model
 * MongoDB schema for storing expense records
 */

const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    // Reference to the user who owns this expense
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true,
      ref: 'User'
    },
    // Expense title/description
    title: {
      type: String,
      required: [true, 'Expense title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    // Expense amount
    amount: {
      type: Number,
      required: [true, 'Expense amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
      validate: {
        validator: function(value) {
          return Number.isFinite(value) && value > 0;
        },
        message: 'Amount must be a valid positive number'
      }
    },
    // Expense category
    category: {
      type: String,
      required: [true, 'Expense category is required'],
      enum: {
        values: [
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
        ],
        message: '{VALUE} is not a valid category'
      },
      index: true
    },
    // Date of the expense
    date: {
      type: Date,
      required: [true, 'Expense date is required'],
      default: Date.now,
      index: true
    },
    // Optional notes/description
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: ''
    },
    // Payment method (optional)
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Other'],
      default: 'Other'
    }
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
    // Customize JSON output
    toJSON: {
      transform: function(doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Compound indexes for efficient queries
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1 });
expenseSchema.index({ userId: 1, createdAt: -1 });

/**
 * Static method to get monthly summary for a user
 * @param {String} userId - User's Firebase UID
 * @param {Number} month - Month (1-12)
 * @param {Number} year - Year
 * @returns {Object} Monthly summary with category breakdown
 */
expenseSchema.statics.getMonthlySummary = async function(userId, month, year) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const summary = await this.aggregate([
    {
      $match: {
        userId: userId,
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$category',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { totalAmount: -1 }
    }
  ]);

  // Calculate total expenses
  const totalExpenses = summary.reduce((sum, item) => sum + item.totalAmount, 0);
  const totalTransactions = summary.reduce((sum, item) => sum + item.count, 0);

  return {
    month,
    year,
    totalExpenses: parseFloat(totalExpenses.toFixed(2)),
    totalTransactions,
    categoryBreakdown: summary.map(item => ({
      category: item._id,
      amount: parseFloat(item.totalAmount.toFixed(2)),
      count: item.count,
      percentage: parseFloat(((item.totalAmount / totalExpenses) * 100).toFixed(2))
    }))
  };
};

/**
 * Static method to get expenses by category
 * @param {String} userId - User's Firebase UID
 * @param {String} category - Category name
 * @returns {Array} Array of expenses
 */
expenseSchema.statics.getExpensesByCategory = async function(userId, category) {
  return await this.find({ userId, category })
    .sort({ date: -1 })
    .lean();
};

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
