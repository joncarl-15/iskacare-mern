const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');

// Temporary storage for verification codes (in production, use Redis or database)
const verificationCodes = new Map();

// Helper function to generate 6-digit code
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// SEND VERIFICATION CODE
router.post('/send-verification', async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Check if email already exists
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Generate verification code
        const code = generateVerificationCode();
        const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Store code temporarily
        verificationCodes.set(email, { code, expiry });

        // Send email
        const emailResult = await sendVerificationEmail(email, code);

        if (!emailResult.success) {
            return res.status(500).json({ message: 'Failed to send verification email. Please try again.' });
        }

        res.status(200).json({
            message: 'Verification code sent to your email',
            expiresIn: 600 // seconds
        });
    } catch (err) {
        console.error('Send verification error:', err);
        res.status(500).json({ message: 'Server error. Please try again.' });
    }
});

// VERIFY CODE
router.post('/verify-code', async (req, res) => {
    try {
        const { email, code } = req.body;

        // Check if code exists
        const storedData = verificationCodes.get(email);
        if (!storedData) {
            return res.status(400).json({ message: 'No verification code found. Please request a new code.' });
        }

        // Check if code expired
        if (new Date() > storedData.expiry) {
            verificationCodes.delete(email);
            return res.status(400).json({ message: 'Verification code expired. Please request a new code.' });
        }

        // Verify code
        if (storedData.code !== code) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        res.status(200).json({ message: 'Code verified successfully' });
    } catch (err) {
        console.error('Verify code error:', err);
        res.status(500).json({ message: 'Server error. Please try again.' });
    }
});

// REGISTER
router.post('/register', async (req, res) => {
    try {
        const { email, username, password, role, verificationCode } = req.body;

        // Verify the code one more time
        const storedData = verificationCodes.get(email);
        if (!storedData || storedData.code !== verificationCode) {
            return res.status(400).json({ message: 'Invalid or expired verification code' });
        }

        // Check if code expired
        if (new Date() > storedData.expiry) {
            verificationCodes.delete(email);
            return res.status(400).json({ message: 'Verification code expired' });
        }

        // Check if username exists
        const usernameExists = await User.findOne({ username });
        if (usernameExists) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Check if email exists (double check)
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            email,
            username,
            password: hashedPassword,
            role: role || 'user',
            isVerified: true
        });

        const user = await newUser.save();

        // Clear verification code
        verificationCodes.delete(email);

        res.status(201).json({
            message: 'Registration successful',
            user: { id: user._id, username: user.username, email: user.email, role: user.role }
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ message: 'Server error. Please try again.' });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if user is verified
        if (!user.isVerified) {
            return res.status(400).json({ message: 'Please verify your email before logging in' });
        }

        // Validate password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'secretkey',
            { expiresIn: '1d' }
        );

        res.status(200).json({ token, user: { id: user._id, username: user.username, email: user.email, role: user.role } });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error. Please try again.' });
    }
});

// FORGOT PASSWORD
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found with this email' });
        }

        // Generate verification code
        const code = generateVerificationCode();
        const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Save code to user document
        user.verificationCode = code;
        user.verificationCodeExpiry = expiry;
        await user.save();

        // Send email
        const emailResult = await sendPasswordResetEmail(email, code);

        if (!emailResult.success) {
            return res.status(500).json({ message: 'Failed to send password reset email. Please try again.' });
        }

        res.status(200).json({
            message: 'Password reset code sent to your email',
            expiresIn: 600 // seconds
        });
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ message: 'Server error. Please try again.' });
    }
});

// RESET PASSWORD
router.post('/reset-password', async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify code
        if (user.verificationCode !== code) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        // Check expiry
        if (new Date() > user.verificationCodeExpiry) {
            return res.status(400).json({ message: 'Verification code expired' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password and clear code
        user.password = hashedPassword;
        user.verificationCode = undefined;
        user.verificationCodeExpiry = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully. You can now login with your new password.' });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ message: 'Server error. Please try again.' });
    }
});

module.exports = router;
