const jwt  = require('jsonwebtoken');
const User = require('../models/User');

/* ─────────────────────────────────────────────────────────
   syncProfile
   Called by the frontend right after Supabase signUp to
   create (or re-link) the MongoDB user profile.
   No protect middleware — JWT is verified here directly.
──────────────────────────────────────────────────────────── */
const syncProfile = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
        if (!token) return res.status(401).json({ message: 'No token provided' });

        const decoded    = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
        const supabaseId = decoded.sub;
        const email      = decoded.email;

        const { name, phone, role } = req.body;

        // Try to find existing profile by supabaseId or email
        let user = await User.findOne({ $or: [{ supabaseId }, { email }] });

        if (user) {
            // Link supabaseId if it wasn't stored yet
            if (!user.supabaseId) {
                user.supabaseId = supabaseId;
                await user.save();
            }
        } else {
            // First time — create the MongoDB record
            user = await User.create({
                supabaseId,
                name:  (name || email.split('@')[0]).trim(),
                email,
                phone: phone?.trim()  || '',
                role:  ['admin', 'member'].includes(role) ? role : 'member',
            });
        }

        res.status(201).json({
            _id:   user._id,
            name:  user.name,
            email: user.email,
            phone: user.phone,
            role:  user.role,
        });
    } catch (error) {
        next(error);
    }
};

/* ── Get current user (protected) ── */
const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        next(error);
    }
};

/* ── Update profile name / phone (protected) ── */
const updateProfile = async (req, res, next) => {
    try {
        const { name, phone } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name?.trim())    user.name  = name.trim();
        if (phone !== undefined) user.phone = phone.trim();

        const updated = await user.save();
        res.json({ _id: updated._id, name: updated.name, email: updated.email, phone: updated.phone, role: updated.role });
    } catch (error) {
        next(error);
    }
};

module.exports = { syncProfile, getMe, updateProfile };
