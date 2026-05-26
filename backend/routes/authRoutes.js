const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
    getMe,
    updateProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register',        registerUser);
router.post('/login',           loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/me',               protect, getMe);
router.put('/me',               protect, updateProfile);

module.exports = router;
