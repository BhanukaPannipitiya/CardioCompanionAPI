// CardioCompanionAPI/controllers/UserController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const { promisify } = require('util');
const { sendOTPEmail } = require('../utils/emailService');

// Store OTPs with their creation time and email
const otpStore = new Map();

const verifyAsync = promisify(jwt.verify);

const client = jwksClient({
  jwksUri: 'https://appleid.apple.com/auth/keys',
});

const getAppleSigningKey = async (kid) => {
  const keys = await client.getKeys();
  const signingKey = keys.keys.find(key => key.kid === kid);
  if (!signingKey) {
    throw new Error('Apple signing key not found');
  }
  return signingKey;
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      subscriptionStatus: user.subscriptionStatus,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const register = async (req, res) => {
    const { email, password, name } = req.body;
  
    try {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      user = new User({
        email,
        password: hashedPassword,
        name,
      });
  
      await user.save();
  
      // Generate a JWT token for the new user
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      // Return the user data in the same format as login and registerWithApple
      res.status(201).json({
        id: user._id,
        email: user.email,
        name: user.name,
        subscriptionStatus: user.subscriptionStatus,
        token,
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

const registerWithApple = async (req, res) => {
  const { identityToken, user } = req.body;

  try {
    const decodedToken = jwt.decode(identityToken, { complete: true });
    if (!decodedToken) {
      return res.status(400).json({ message: 'Invalid Apple identity token' });
    }

    const { header, payload } = decodedToken;
    const { kid } = header;
    const { sub: appleUserId, email } = payload;

    const signingKey = await getAppleSigningKey(kid);
    const publicKey = signingKey.getPublicKey();
    const verifiedToken = await verifyAsync(identityToken, publicKey, {
      issuer: 'https://appleid.apple.com',
      audience: 'bhanuka.CardioCompanionApp',
    });

    if (!verifiedToken) {
      return res.status(400).json({ message: 'Apple token verification failed' });
    }

    let existingUser = await User.findOne({ appleUserId });
    if (existingUser) {
      const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      return res.json({
        id: existingUser._id,
        email: existingUser.email,
        name: existingUser.name,
        subscriptionStatus: existingUser.subscriptionStatus,
        token,
      });
    }

    const newUser = new User({
      appleUserId,
      email: email || user?.email,
      name: user?.name || 'Apple User',
      password: '',
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({
      id: newUser._id,
      email: newUser.email,
      name: newUser.name,
      subscriptionStatus: newUser.subscriptionStatus,
      token,
    });
  } catch (error) {
    console.error('Apple Sign-In error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send OTP email
    const { otp } = await sendOTPEmail(email);
    
    // Store OTP with creation time and email
    otpStore.set(email, {
      otp,
      createdAt: new Date(),
      attempts: 0
    });

    res.json({ message: 'OTP sent successfully to your email' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpData = otpStore.get(email);
    
    if (!otpData) {
      return res.status(400).json({ message: 'OTP expired or not found. Please request a new one.' });
    }

    // Check if OTP is expired (10 minutes)
    const now = new Date();
    const otpAge = now - otpData.createdAt;
    if (otpAge > 10 * 60 * 1000) { // 10 minutes in milliseconds
      otpStore.delete(email);
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    }

    // Increment attempts
    otpData.attempts += 1;

    // Check max attempts (3)
    if (otpData.attempts >= 3) {
      otpStore.delete(email);
      return res.status(400).json({ message: 'Too many attempts. Please request a new OTP.' });
    }

    // Verify OTP
    if (otpData.otp !== otp) {
      return res.status(400).json({ 
        message: 'Invalid OTP',
        remainingAttempts: 3 - otpData.attempts
      });
    }

    // OTP is valid
    otpStore.delete(email);

    // Generate a token for password reset
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'OTP verified successfully', token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(400).json({ message: 'Invalid or expired token', error: error.message });
  }
};

module.exports = { 
  login, 
  register, 
  registerWithApple, 
  requestPasswordReset, 
  verifyOTP, 
  resetPassword 
};