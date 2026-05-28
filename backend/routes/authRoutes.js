const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    forgotPassword,
    verifyResetCode,
    resetPassword,
    getMe,
    updateProfile,
    changePassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register',           registerUser);
router.post('/login',              loginUser);
router.post('/forgot-password',    forgotPassword);
router.post('/verify-reset-code',  verifyResetCode);
router.post('/reset-password/:token', resetPassword);   // kept for backward compat
router.get('/me',                  protect, getMe);
router.put('/me',                  protect, updateProfile);
router.put('/change-password',     protect, changePassword);

module.exports = router;
