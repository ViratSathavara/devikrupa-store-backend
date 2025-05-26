require('dotenv').config();
const otpGenerator = require('otp-generator');
const sgMail = require('@sendgrid/mail');

const otpStorage = new Map();
sgMail.setApiKey(process.env.EMAIL_API);

exports.sendOTP = async(email) => {
    const otp = otpGenerator.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false
    });

    const msg = {
        to: email,
        from: process.env.EMAIL_USER, // Must be verified in SendGrid
        subject: 'Your Verification OTP',
        text: `Your OTP code is: ${otp}`,
        html: `<strong>Your OTP code is: ${otp}</strong>`
    };

    try {
        await sgMail.send(msg);
        otpStorage.set(email, {
            otp,
            expiresAt: Date.now() + 30000
        });
        return { success: true, message: 'OTP sent successfully', status: 200 };
    } catch (error) {
        console.error('Full SendGrid Error:', error);
        if (error.response) {
            console.error('SendGrid Response Body:', error.response.body);
            console.error('SendGrid Response Headers:', error.response.headers);
        }
        return {
            success: false,
            error: 'Failed to send OTP',
            details: error.response ? error.response.body : error.message
        };
    }
};

exports.verifyOTP = (email, userOtp) => {
    const storedOtp = otpStorage.get(email);
    console.log(storedOtp)

    if (!storedOtp) {
        return { success: false, error: 'OTP expired or not generated' };
    }

    if (Date.now() > storedOtp.expiresAt) {
        otpStorage.delete(email);
        return { success: false, error: 'OTP expired' };
    }

    if (storedOtp.otp !== userOtp) {
        return { success: false, error: 'Invalid OTP' };
    }

    otpStorage.delete(email);
    return { success: true };
};