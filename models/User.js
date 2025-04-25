// CardioCompanionAPI/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: false, // Not required for Apple Sign-In users
  },
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    trim: true,
  },
  dateOfBirth: {
    type: String,
    trim: true,
  },
  subscriptionStatus: {
    type: String,
    enum: ['free', 'premium'],
    default: 'free',
  },
  appleUserId: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple users without appleUserId
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);