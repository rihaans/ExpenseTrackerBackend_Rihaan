/**
 * Report Routes
 * Defines routes for expense reports and analytics
 */

const express = require('express');
const router = express.Router();
const {
  getMonthlyReport,
  getCategoryReport,
  getOverallStats
} = require('../controllers/reportController');
const { verifyFirebaseToken } = require('../middleware/authMiddleware');
const {
  validateMonthlyReport,
  validateCategoryFilter
} = require('../middleware/validators');

// All report routes require authentication
router.use(verifyFirebaseToken);

/**
 * @route   GET /api/reports/monthly?month=MM&year=YYYY
 * @desc    Get monthly expense summary with category breakdown
 * @access  Private
 */
router.get('/monthly', validateMonthlyReport, getMonthlyReport);

/**
 * @route   GET /api/reports/category?category=Food
 * @desc    Get expenses filtered by category with statistics
 * @access  Private
 * @query   category (required), startDate (optional), endDate (optional)
 */
router.get('/category', validateCategoryFilter, getCategoryReport);

/**
 * @route   GET /api/reports/stats
 * @desc    Get overall expense statistics
 * @access  Private
 * @query   startDate (optional), endDate (optional)
 */
router.get('/stats', getOverallStats);

module.exports = router;
