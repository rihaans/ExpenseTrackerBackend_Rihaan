/**
 * Authentication Routes
 * Defines routes for user authentication operations
 */

const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getProfile
} = require('../controllers/authController');
const { verifyFirebaseToken } = require('../middleware/authMiddleware');
const { validateRegister, validateLogin } = require('../middleware/validators');

/**
 * @route   POST /api/register
 * @desc    Register a new user with Firebase Authentication
 * @access  Public
 */
router.post('/register', validateRegister, register);

/**
 * @route   POST /api/login
 * @desc    Login user and verify Firebase token
 * @access  Public
 */
router.post('/login', validateLogin, login);

/**
 * @route   POST /api/logout
 * @desc    Logout user and revoke refresh tokens
 * @access  Private
 */
router.post('/logout', verifyFirebaseToken, logout);

/**
 * @route   GET /api/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', verifyFirebaseToken, getProfile);

module.exports = router;
