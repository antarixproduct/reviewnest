const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getProfile, updateProfile, testEmail, getAnalytics } = require('../controllers/businessController');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/test-email', protect, testEmail);
router.get('/analytics', protect, getAnalytics);

module.exports = router;
