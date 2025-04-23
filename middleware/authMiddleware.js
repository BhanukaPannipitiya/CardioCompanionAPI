// CardioCompanionBackend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    console.log('🔐 Auth middleware - Headers:', req.headers);
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('🔐 Auth middleware - Token:', token ? 'Present' : 'Missing');

    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ message: 'No token provided' });
    }

    console.log('🔐 Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔐 Decoded token:', decoded);
    
    // Get the user ID from either userId or id field
    const userId = decoded.userId || decoded.id;
    console.log('🔐 Using user ID:', userId);
    
    if (!userId) {
      console.log('❌ No user ID found in token');
      return res.status(401).json({ message: 'Invalid token: No user ID found' });
    }
    
    // Find the user by ID from the decoded token
    console.log('🔐 Looking for user with ID:', userId);
    const user = await User.findById(userId);
    
    if (!user) {
      console.log('❌ User not found for ID:', userId);
      return res.status(401).json({ message: 'User not found' });
    }

    console.log('✅ User found:', user._id);
    // Set the user object on the request
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token', details: error.message });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired', details: error.message });
    }
    res.status(401).json({ message: 'Authentication failed', details: error.message });
  }
};

module.exports = authMiddleware;