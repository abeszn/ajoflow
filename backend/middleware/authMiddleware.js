const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Not authorized — no token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verify against the Supabase JWT secret (HS256)
        const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
        const supabaseId = decoded.sub;
        const email      = decoded.email;

        // 1. Fast path: look up by supabaseId
        req.user = await User.findOne({ supabaseId }).select('-password');

        // 2. Migration path: existing users without supabaseId — match by email and link
        if (!req.user && email) {
            const byEmail = await User.findOne({ email }).select('-password');
            if (byEmail) {
                byEmail.supabaseId = supabaseId;
                await byEmail.save();
                req.user = byEmail;
            }
        }

        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized — user profile not found' });
        }

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Not authorized — token invalid or expired' });
    }
};

module.exports = { protect };
