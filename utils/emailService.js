const nodemailer = require('nodemailer');

// Enhanced transporter configuration for Render deployment
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  // Add timeout and connection settings for production
  connectionTimeout: 60000,
  greetingTimeout: 30000,
  socketTimeout: 60000,
  // Add debug logging for production
  debug: process.env.NODE_ENV === 'development',
  logger: process.env.NODE_ENV === 'development'
});

// Verify transporter connection on startup
const verifyTransporter = async () => {
  try {
    await transporter.verify();
    console.log('Email transporter is ready to send messages');
    return true;
  } catch (error) {
    console.error('Email transporter verification failed:', error);
    return false;
  }
};

const sendWelcomeEmail = async (userEmail, username) => {
  try {
    console.log('Attempting to send welcome email to:', userEmail);
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Welcome to Wanderlust!',
      html: `<h1>Welcome ${username}!</h1><p>Thank you for signing up for Wanderlust. We're excited to have you join our community!</p>`
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw new Error(`Failed to send welcome email: ${error.message}`);
  }
};

const sendOTPEmail = async (userEmail, otp) => {
  try {
    console.log('Attempting to send OTP email to:', userEmail);
    console.log('OTP generated:', otp);
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Verify Your Email - OTP',
      html: `<h1>Your OTP is: ${otp}</h1><p>This OTP will expire in 5 minutes.</p><p>If you didn't request this, please ignore this email.</p>`
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }
};

module.exports = { 
  sendWelcomeEmail, 
  sendOTPEmail, 
  verifyTransporter 
};