/**
 * Report Controller
 * Handles expense reports and analytics
 */

const Expense = require('../models/Expense');
const { AppError } = require('../middleware/errorHandler');

/**
 * Get monthly expense summary with category breakdown
 * Uses MongoDB aggregation for efficient calculations
 * @route GET /api/reports/monthly?month=MM&year=YYYY
 * @access Private
 */
const getMonthlyReport = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { month, year } = req.query;

    // Get monthly summary using Expense model's static method
    const summary = await Expense.getMonthlySummary(uid, parseInt(month), parseInt(year));

    // Get all expenses for the month for additional details
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const expenses = await Expense.find({
      userId: uid,
      date: { $gte: startDate, $lte: endDate }
    })
      .sort({ date: -1 })
      .select('title amount category date paymentMethod')
      .lean();

    // Calculate daily average
    const daysInMonth = new Date(year, month, 0).getDate();
    const dailyAverage = summary.totalExpenses / daysInMonth;

    res.status(200).json({
      success: true,
      message: 'Monthly report generated successfully',
      data: {
        summary: {
          ...summary,
          dailyAverage: parseFloat(dailyAverage.toFixed(2)),
          daysInMonth
        },
        expenses
      }
    });
  } catch (error) {
    console.error('Get monthly report error:', error);
    next(new AppError(error.message || 'Failed to generate monthly report', 500));
  }
};

/**
 * Get expenses filtered by category
 * @route GET /api/reports/category?category=Food
 * @access Private
 */
const getCategoryReport = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { category } = req.query;
    const { startDate, endDate } = req.query;

    // Build filter
    const filter = { userId: uid, category };

    // Add date range if provided
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate);
      }
    }

    // Get expenses by category
    const expenses = await Expense.find(filter)
      .sort({ date: -1 })
      .lean();

    // Calculate statistics
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const averageAmount = expenses.length > 0 ? totalAmount / expenses.length : 0;
    const maxExpense = expenses.length > 0 ? Math.max(...expenses.map(e => e.amount)) : 0;
    const minExpense = expenses.length > 0 ? Math.min(...expenses.map(e => e.amount)) : 0;

    // Group by month for trend analysis
    const monthlyTrend = expenses.reduce((acc, expense) => {
      const monthKey = new Date(expense.date).toISOString().slice(0, 7); // YYYY-MM
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          total: 0,
          count: 0
        };
      }
      acc[monthKey].total += expense.amount;
      acc[monthKey].count += 1;
      return acc;
    }, {});

    const trendData = Object.values(monthlyTrend)
      .sort((a, b) => a.month.localeCompare(b.month))
      .map(item => ({
        month: item.month,
        total: parseFloat(item.total.toFixed(2)),
        count: item.count,
        average: parseFloat((item.total / item.count).toFixed(2))
      }));

    res.status(200).json({
      success: true,
      message: `Category report for ${category} generated successfully`,
      data: {
        category,
        statistics: {
          totalExpenses: expenses.length,
          totalAmount: parseFloat(totalAmount.toFixed(2)),
          averageAmount: parseFloat(averageAmount.toFixed(2)),
          maxExpense: parseFloat(maxExpense.toFixed(2)),
          minExpense: parseFloat(minExpense.toFixed(2))
        },
        monthlyTrend: trendData,
        expenses
      }
    });
  } catch (error) {
    console.error('Get category report error:', error);
    next(new AppError(error.message || 'Failed to generate category report', 500));
  }
};

/**
 * Get overall expense statistics
 * @route GET /api/reports/stats
 * @access Private
 */
const getOverallStats = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { startDate, endDate } = req.query;

    // Build filter
    const filter = { userId: uid };

    // Add date range if provided
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate);
      }
    }

    // Aggregate statistics
    const stats = await Expense.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' },
          maxAmount: { $max: '$amount' },
          minAmount: { $min: '$amount' }
        }
      }
    ]);

    // Category breakdown
    const categoryStats = await Expense.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Payment method breakdown
    const paymentMethodStats = await Expense.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    const overallStats = stats.length > 0 ? stats[0] : {
      totalExpenses: 0,
      totalAmount: 0,
      avgAmount: 0,
      maxAmount: 0,
      minAmount: 0
    };

    res.status(200).json({
      success: true,
      message: 'Overall statistics generated successfully',
      data: {
        overall: {
          totalExpenses: overallStats.totalExpenses,
          totalAmount: parseFloat((overallStats.totalAmount || 0).toFixed(2)),
          averageAmount: parseFloat((overallStats.avgAmount || 0).toFixed(2)),
          maxAmount: parseFloat((overallStats.maxAmount || 0).toFixed(2)),
          minAmount: parseFloat((overallStats.minAmount || 0).toFixed(2))
        },
        categoryBreakdown: categoryStats.map(item => ({
          category: item._id,
          total: parseFloat(item.total.toFixed(2)),
          count: item.count,
          percentage: parseFloat(((item.total / overallStats.totalAmount) * 100).toFixed(2))
        })),
        paymentMethodBreakdown: paymentMethodStats.map(item => ({
          paymentMethod: item._id,
          total: parseFloat(item.total.toFixed(2)),
          count: item.count,
          percentage: parseFloat(((item.total / overallStats.totalAmount) * 100).toFixed(2))
        }))
      }
    });
  } catch (error) {
    console.error('Get overall stats error:', error);
    next(new AppError(error.message || 'Failed to generate statistics', 500));
  }
};

module.exports = {
  getMonthlyReport,
  getCategoryReport,
  getOverallStats
};
