const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendEmail, resetTemplate } = require('../utils/sendEmail');

/* ── Register ── */
const registerUser = async (req, res, next) => {
    try {
        const { name, email, phone, password } = req.body;

        if (!name?.trim() || !email?.trim() || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const exists = await User.findOne({ email: email.toLowerCase().trim() });
        if (exists) {
            return res.status(400).json({ message: 'An account with that email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            phone: phone?.trim() || '',
            password: await bcrypt.hash(password, salt),
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        next(error);
    }
};

/* ── Login: validate credentials → return JWT ── */
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email?.trim() || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        next(error);
    }
};

/* ── Forgot Password ── */
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email?.trim()) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });

        // Always respond the same way to avoid user enumeration
        if (!user) {
            return res.json({ message: 'If that email is registered, a reset link has been sent' });
        }

        // Generate raw token → hash for storage
        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min
        await user.save();

        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;

        await sendEmail({
            to: user.email,
            subject: 'Reset your AjoFlow password',
            html: resetTemplate(resetUrl),
        });

        res.json({ message: 'If that email is registered, a reset link has been sent' });
    } catch (error) {
        next(error);
    }
};

/* ── Reset Password ── */
const resetPassword = async (req, res, next) => {
    try {
        const { password } = req.body;
        const rawToken = req.params.token;

        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Reset link is invalid or has expired' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successfully. You can now sign in.' });
    } catch (error) {
        next(error);
    }
};

/* ── Get current user ── */
const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('-password -otp -otpExpires -resetPasswordToken -resetPasswordExpires');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        next(error);
    }
};

/* ── Update profile ── */
const updateProfile = async (req, res, next) => {
    try {
        const { name, phone } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name?.trim()) user.name = name.trim();
        if (phone !== undefined) user.phone = phone.trim();

        const updated = await user.save();
        res.json({ _id: updated._id, name: updated.name, email: updated.email, phone: updated.phone, role: updated.role });
    } catch (error) {
        next(error);
    }
};

module.exports = { registerUser, loginUser, forgotPassword, resetPassword, getMe, updateProfile };
