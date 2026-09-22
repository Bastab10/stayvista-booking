const { verifyOTP } = require('../utils/otpService');
const User = require('../models/user');
const passport = require('passport');

module.exports.renderOTPForm = (req, res) => {
    res.render('users/verify');
};

module.exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const isValid = await verifyOTP(email, otp);
        
        if (isValid) {
            await User.updateOne({ email }, { isVerified: true });
            
            const user = await User.findOne({ email });
            req.login(user, (err) => {
                if (err) {
                    req.flash('error', 'Email verified but login failed. Please try logging in manually.');
                    return res.redirect('/login');
                }
                req.flash('success', 'Email verified successfully! Welcome to Wanderlust!');
                res.redirect('/listings');
            });
        } else {
            req.flash('error', 'Invalid OTP. Please try again.');
            res.redirect('/verify');
        }
    } catch (error) {
        req.flash('error', 'Verification failed. Please try again.');
        res.redirect('/verify');
    }
};