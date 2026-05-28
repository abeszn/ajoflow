const bcrypt       = require('bcryptjs');
const User         = require('../models/User');
const generateToken = require('../utils/generateToken');

/* ── Register ── */
const registerUser = async (req, res, next) => {
    try {
        const { name, email, phone, password, role } = req.body;

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
            name:     name.trim(),
            email:    email.toLowerCase().trim(),
            phone:    phone?.trim() || '',
            password: await bcrypt.hash(password, salt),
            role:     ['admin', 'member'].includes(role) ? role : 'member',
        });

        res.status(201).json({
            _id:   user._id,
            name:  user.name,
            email: user.email,
            phone: user.phone,
            role:  user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        next(error);
    }
};

/* ── Login ── */
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
            _id:   user._id,
            name:  user.name,
            email: user.email,
            phone: user.phone,
            role:  user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        next(error);
    }
};

/* ── Forgot password — no email, just update directly ── */
const forgotPassword = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email?.trim() || !password) {
            return res.status(400).json({ message: 'Email and new password are required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(404).json({ message: 'No account found with that email address.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        res.json({ message: 'Password updated successfully.' });
    } catch (error) {
        next(error);
    }
};

/* ── Get current user ── */
const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        next(error);
    }
};

/* ── Update profile name / phone ── */
const updateProfile = async (req, res, next) => {
    try {
        const { name, phone } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name?.trim())        user.name  = name.trim();
        if (phone !== undefined) user.phone = phone.trim();

        const updated = await user.save();
        res.json({ _id: updated._id, name: updated.name, email: updated.email, phone: updated.phone, role: updated.role });
    } catch (error) {
        next(error);
    }
};

/* ── Change password (logged-in user) ── */
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current password and new password are required' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters' });
        }

        const user = await User.findById(req.user._id);
        if (!(await user.matchPassword(currentPassword))) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }
        if (currentPassword === newPassword) {
            return res.status(400).json({ message: 'New password must be different from current password' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = { registerUser, loginUser, forgotPassword, getMe, updateProfile, changePassword };
