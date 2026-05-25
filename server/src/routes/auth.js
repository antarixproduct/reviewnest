const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { setupStatus, register, login, refresh, logout, changePassword } = require('../controllers/authController');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

router.get('/setup-status', setupStatus);
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/change-password', protect, authLimiter, changePassword);

module.exports = router;
