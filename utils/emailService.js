// CardioCompanionAPI/utils/emailService.js
const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Create email template for OTP
const createOTPEmailTemplate = (otp) => {
  return {
    text: `Your OTP for password reset is: ${otp}\nThis OTP will expire in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #333; margin-bottom: 20px;">Password Reset OTP</h2>
          <p style="color: #555; margin-bottom: 15px;">You have requested to reset your password for CardioCompanion.</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #e9ecef; 
                        padding: 15px; 
                        border-radius: 5px; 
                        font-size: 24px; 
                        font-weight: bold; 
                        letter-spacing: 5px;
                        color: #007bff;
                        display: inline-block;">
              ${otp}
            </div>
          </div>
          <p style="color: #666; font-size: 14px; margin-top: 20px;">This OTP will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this password reset, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            This is an automated message from CardioCompanion. Please do not reply to this email.
          </p>
        </div>
      </div>
    `
  };
};

// Generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTPEmail = async (to) => {
  const transporter = createTransporter();
  const otp = generateOTP();
  
  try {
    // Verify transporter configuration
    await transporter.verify();
    console.log('SMTP connection verified successfully');

    const emailContent = createOTPEmailTemplate(otp);
    const mailOptions = {
      from: {
        name: 'CardioCompanion',
        address: process.env.EMAIL_USER
      },
      to,
      subject: 'CardioCompanion Password Reset OTP',
      ...emailContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { 
      success: true, 
      messageId: info.messageId,
      otp: otp // Return the OTP so it can be stored/verified later
    };
  } catch (error) {
    console.error('Email error:', {
      message: error.message,
      code: error.code,
      command: error.command
    });
    throw new Error(`Failed to send OTP email: ${error.message}`);
  } finally {
    transporter.close();
  }
};

module.exports = { sendOTPEmail };