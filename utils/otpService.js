const OTP = require('../models/otp');

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const saveOTP = async (email) => {
    await OTP.deleteMany({ email });
    const otp = generateOTP();
    await OTP.create({ email, otp });
    return otp;
};

const verifyOTP = async (email, otp) => {
    const otpRecord = await OTP.findOne({ email, otp });
    if (otpRecord) {
        await OTP.deleteMany({ email });
        return true;
    }
    return false;
};

module.exports = { generateOTP, saveOTP, verifyOTP };