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
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  subscriptionStatus: {
    type: String,
    enum: ['free', 'premium'],
    default: 'free',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);