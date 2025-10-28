/**
 * Firebase Admin SDK Configuration
 * This file initializes Firebase Admin SDK for server-side authentication
 */

const admin = require('firebase-admin');

/**
 * Initialize Firebase Admin SDK
 * Requires service account credentials to be set in environment variables
 */
const initializeFirebase = () => {
  try {
    // Check if Firebase is already initialized
    if (admin.apps.length === 0) {
      // Parse service account from environment variable
      const serviceAccount = JSON.parse(
        process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
      );

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      console.log('Firebase Admin SDK initialized successfully');
    }

    return admin;
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error.message);
    throw new Error('Failed to initialize Firebase Admin SDK');
  }
};

// Initialize Firebase on module load
const firebaseAdmin = initializeFirebase();

module.exports = firebaseAdmin;
