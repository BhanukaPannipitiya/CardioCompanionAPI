// CardioCompanionAPI/controllers/UserController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const { promisify } = require('util');
const { sendOTPEmail } = require('../utils/emailService');
const Medication = require('../models/Medication');
const SymptomLog = require('../models/SymptomLog');

// Store OTPs with their creation time and email
const otpStore = new Map();

const verifyAsync = promisify(jwt.verify);

const client = jwksClient({
  jwksUri: 'https://appleid.apple.com/auth/keys',
});

const getAppleSigningKey = async (kid) => {
  try {
    const key = await client.getSigningKey(kid);
    console.log('🔑 Got signing key for kid:', kid);
    return key;
  } catch (error) {
    console.error('❌ Error getting Apple signing key:', error);
    throw error;
  }
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
    console.log('📱 Starting Apple Sign-In process');
    console.log('📱 User data:', JSON.stringify(user, null, 2));

    const decodedToken = jwt.decode(identityToken, { complete: true });
    if (!decodedToken) {
      console.error('❌ Invalid Apple identity token');
      return res.status(400).json({ message: 'Invalid Apple identity token' });
    }

    const { header, payload } = decodedToken;
    const { kid } = header;
    const { sub: appleUserId, email } = payload;

    console.log('📱 Decoded token - kid:', kid);
    console.log('📱 Decoded token - appleUserId:', appleUserId);
    console.log('📱 Decoded token - email:', email);

    const signingKey = await getAppleSigningKey(kid);
    const publicKey = signingKey.getPublicKey();
    
    console.log('🔑 Got signing key for kid:', kid);

    const verifiedToken = await verifyAsync(identityToken, publicKey, {
      issuer: 'https://appleid.apple.com',
      audience: 'bhanuka.CardioCompanionApp',
    });

    if (!verifiedToken) {
      console.error('❌ Apple token verification failed');
      return res.status(400).json({ message: 'Apple token verification failed' });
    }

    console.log('✅ Token verified successfully');

    let existingUser = await User.findOne({ appleUserId });
    if (existingUser) {
      console.log('📱 Found existing user with Apple ID:', appleUserId);
      const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      return res.json({
        id: existingUser._id,
        email: existingUser.email,
        name: existingUser.name,
        subscriptionStatus: existingUser.subscriptionStatus,
        token,
      });
    }

    console.log('📱 Creating new user with Apple ID:', appleUserId);
    const newUser = new User({
      appleUserId,
      email: email || user?.email,
      name: user?.name || 'Apple User',
      password: '',
    });

    await newUser.save();
    console.log('✅ New user created successfully');

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({
      id: newUser._id,
      email: newUser.email,
      name: newUser.name,
      subscriptionStatus: newUser.subscriptionStatus,
      token,
    });
  } catch (error) {
    console.error('❌ Apple Sign-In error:', error);
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

const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const user = await User.findById(userId).select('-password -refreshToken');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Calculate user statistics
        const streak = await calculateStreak(userId);
        const points = await calculatePoints(userId);

        // Get user's medication adherence rate
        const medications = await Medication.find({ userId });
        const totalSchedules = medications.reduce((acc, med) => acc + med.schedule.length, 0);
        const takenSchedules = medications.reduce((acc, med) => 
            acc + med.schedule.filter(s => s.isTaken).length, 0);
        const adherenceRate = totalSchedules > 0 ? (takenSchedules / totalSchedules) * 100 : 0;

        // Get recent symptom logs
        const recentSymptoms = await SymptomLog.find({ userId })
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            id: user._id,
            email: user.email,
            name: user.name,
            address: user.address || "",
            dateOfBirth: user.dateOfBirth || "",
            subscriptionStatus: user.subscriptionStatus,
            streak,
            points,
            adherenceRate: Math.round(adherenceRate),
            recentSymptoms,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, email, address, dateOfBirth } = req.body;

        console.log('📝 Updating profile for user:', userId);
        console.log('📝 Request body:', req.body);

        const user = await User.findById(userId);
        if (!user) {
            console.log('❌ User not found:', userId);
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields if provided
        if (name) user.name = name;
        if (email) user.email = email;
        if (address !== undefined) user.address = address;
        if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;

        await user.save();
        console.log('✅ User profile updated successfully');

        // Get updated user profile with all fields
        const updatedUser = await User.findById(userId).select('-password -refreshToken');
        
        // Calculate user statistics
        const streak = await calculateStreak(userId);
        const points = await calculatePoints(userId);
        const medications = await Medication.find({ userId });
        const totalSchedules = medications.reduce((acc, med) => acc + med.schedule.length, 0);
        const takenSchedules = medications.reduce((acc, med) => 
            acc + med.schedule.filter(s => s.isTaken).length, 0);
        const adherenceRate = totalSchedules > 0 ? (takenSchedules / totalSchedules) * 100 : 0;
        const recentSymptoms = await SymptomLog.find({ userId })
            .sort({ createdAt: -1 })
            .limit(5);

        const responseData = {
            id: updatedUser._id,
            email: updatedUser.email,
            name: updatedUser.name,
            address: updatedUser.address,
            dateOfBirth: updatedUser.dateOfBirth,
            subscriptionStatus: updatedUser.subscriptionStatus,
            streak,
            points,
            adherenceRate: Math.round(adherenceRate),
            recentSymptoms,
            createdAt: updatedUser.createdAt,
            lastLogin: updatedUser.lastLogin,
            message: 'Profile updated successfully'
        };

        console.log('📤 Sending response data:', JSON.stringify(responseData, null, 2));
        res.json(responseData);
    } catch (error) {
        console.error('❌ Error updating profile:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Helper functions
async function calculateStreak(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const medications = await Medication.find({ userId });
    let streak = 0;
    let currentDate = new Date(today);
    
    while (true) {
        const hasTakenMedication = medications.some(med => 
            med.schedule.some(s => {
                const scheduleDate = new Date(s.time);
                scheduleDate.setHours(0, 0, 0, 0);
                return scheduleDate.getTime() === currentDate.getTime() && s.isTaken;
            })
        );
        
        if (!hasTakenMedication) break;
        
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return streak;
}

async function calculatePoints(userId) {
    const medications = await Medication.find({ userId });
    const symptomLogs = await SymptomLog.find({ userId });
    
    // Points for medication adherence
    const medicationPoints = medications.reduce((acc, med) => 
        acc + med.schedule.filter(s => s.isTaken).length * 10, 0);
    
    // Points for symptom logging
    const symptomPoints = symptomLogs.length * 5;
    
    return medicationPoints + symptomPoints;
}

module.exports = { 
  login, 
  register, 
  registerWithApple, 
  requestPasswordReset, 
  verifyOTP, 
  resetPassword,
  getUserProfile,
  updateUserProfile
};