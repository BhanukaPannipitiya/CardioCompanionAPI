// CardioCompanionAPI/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');

router.post('/login', UserController.login);
router.post('/register', UserController.register);
router.post('/register-apple', UserController.registerWithApple);
router.post('/request-password-reset', UserController.requestPasswordReset);
router.post('/verify-otp', UserController.verifyOTP);
router.post('/reset-password', UserController.resetPassword);

module.exports = router;