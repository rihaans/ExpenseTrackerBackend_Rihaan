/**
 * User Model
 * MongoDB schema for storing user information
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    // Firebase UID - unique identifier from Firebase Authentication
    firebaseUid: {
      type: String,
      required: [true, 'Firebase UID is required'],
      unique: true,
      index: true
    },
    // User's email address
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function(email) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: 'Please provide a valid email address'
      }
    },
    // User's display name (optional)
    displayName: {
      type: String,
      trim: true,
      default: null
    },
    // Account status
    isActive: {
      type: Boolean,
      default: true
    },
    // Last login timestamp
    lastLogin: {
      type: Date,
      default: null
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

// Indexes are already defined in the schema above with unique: true and index: true

/**
 * Static method to find or create user by Firebase UID
 * @param {String} firebaseUid - Firebase UID
 * @param {String} email - User's email
 * @returns {Object} User document
 */
userSchema.statics.findOrCreateByFirebaseUid = async function(firebaseUid, email) {
  let user = await this.findOne({ firebaseUid });

  if (!user) {
    user = await this.create({
      firebaseUid,
      email,
      lastLogin: new Date()
    });
  } else {
    user.lastLogin = new Date();
    await user.save();
  }

  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
