/**
 * Authentication Middleware
 * Verifies Firebase ID tokens for protected routes
 */

const admin = require('../firebase/firebaseConfig');

/**
 * Middleware to verify Firebase authentication token
 * Extracts token from Authorization header and verifies it with Firebase Admin SDK
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const verifyFirebaseToken = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No token provided',
        error: 'Missing or invalid Authorization header'
      });
    }

    // Extract the token (remove 'Bearer ' prefix)
    const idToken = authHeader.split('Bearer ')[1];

    if (!idToken) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid token format',
        error: 'Token is empty or malformed'
      });
    }

    // Verify the token with Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Attach user information to request object for use in controllers
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified
    };

    // Continue to next middleware or route handler
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);

    // Handle specific Firebase authentication errors
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Token has expired',
        error: 'Please login again to get a new token'
      });
    }

    if (error.code === 'auth/id-token-revoked') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Token has been revoked',
        error: 'Please login again'
      });
    }

    if (error.code === 'auth/argument-error') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid token',
        error: 'Token format is invalid'
      });
    }

    // Generic authentication error
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Authentication failed',
      error: error.message
    });
  }
};

module.exports = { verifyFirebaseToken };
