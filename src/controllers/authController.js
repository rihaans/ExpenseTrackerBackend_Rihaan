/**
 * Authentication Controller
 * Handles user registration, login, and logout operations using Firebase
 */

const admin = require('../firebase/firebaseConfig');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

/**
 * Register a new user with Firebase Authentication
 * @route POST /api/register
 * @access Public
 */
const register = async (req, res, next) => {
  try {
    const { email, password, displayName } = req.body;

    // Create user in Firebase Authentication
    let firebaseUser;
    try {
      firebaseUser = await admin.auth().createUser({
        email,
        password,
        displayName: displayName || email.split('@')[0],
        emailVerified: false
      });
    } catch (firebaseError) {
      // Handle Firebase-specific errors
      if (firebaseError.code === 'auth/email-already-exists') {
        return next(new AppError('Email already registered', 400));
      }
      if (firebaseError.code === 'auth/invalid-email') {
        return next(new AppError('Invalid email address', 400));
      }
      if (firebaseError.code === 'auth/invalid-password') {
        return next(new AppError('Password must be at least 6 characters', 400));
      }
      throw firebaseError;
    }

    // Create user in MongoDB
    const user = await User.create({
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName
    });

    // Generate custom token for immediate login
    const customToken = await admin.auth().createCustomToken(firebaseUser.uid);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        uid: user.firebaseUid,
        email: user.email,
        displayName: user.displayName,
        customToken
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    next(new AppError(error.message || 'Registration failed', 500));
  }
};

/**
 * Login user with Firebase Authentication
 * Note: Actual authentication happens on the client side with Firebase SDK
 * This endpoint verifies the token and updates user's last login
 * @route POST /api/login
 * @access Public
 */
const login = async (req, res, next) => {
  try {
    const { email, idToken } = req.body;

    if (!idToken) {
      return next(new AppError('ID token is required for login', 400));
    }

    // Verify the Firebase ID token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (firebaseError) {
      if (firebaseError.code === 'auth/id-token-expired') {
        return next(new AppError('Token has expired', 401));
      }
      if (firebaseError.code === 'auth/argument-error') {
        return next(new AppError('Invalid token format', 401));
      }
      return next(new AppError('Token verification failed', 401));
    }

    // Verify email matches
    if (decodedToken.email !== email) {
      return next(new AppError('Email does not match token', 401));
    }

    // Find or create user in MongoDB
    const user = await User.findOrCreateByFirebaseUid(
      decodedToken.uid,
      decodedToken.email
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        uid: user.firebaseUid,
        email: user.email,
        displayName: user.displayName,
        lastLogin: user.lastLogin,
        token: idToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    next(new AppError(error.message || 'Login failed', 500));
  }
};

/**
 * Logout user by revoking refresh tokens
 * @route POST /api/logout
 * @access Private (requires authentication)
 */
const logout = async (req, res, next) => {
  try {
    const { uid } = req.user;

    // Revoke all refresh tokens for the user
    await admin.auth().revokeRefreshTokens(uid);

    // Get the user to check tokens valid after time
    const userRecord = await admin.auth().getUser(uid);
    const timestamp = new Date(userRecord.tokensValidAfterTime).getTime() / 1000;

    res.status(200).json({
      success: true,
      message: 'Logout successful. All refresh tokens have been revoked.',
      data: {
        uid,
        tokensValidAfterTime: timestamp
      }
    });
  } catch (error) {
    console.error('Logout error:', error);
    next(new AppError(error.message || 'Logout failed', 500));
  }
};

/**
 * Get current user profile
 * @route GET /api/profile
 * @access Private (requires authentication)
 */
const getProfile = async (req, res, next) => {
  try {
    const { uid } = req.user;

    // Get user from MongoDB
    const user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Get additional info from Firebase
    const firebaseUser = await admin.auth().getUser(uid);

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        uid: user.firebaseUid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: firebaseUser.emailVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    next(new AppError(error.message || 'Failed to retrieve profile', 500));
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile
};
