const express = require('express');
const router  = express.Router();
const { syncProfile, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Create / link MongoDB profile after Supabase signup (no protect — verifies JWT internally)
router.post('/profile', syncProfile);

// Authenticated profile endpoints
router.get('/me',  protect, getMe);
router.put('/me',  protect, updateProfile);

module.exports = router;
