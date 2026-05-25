const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  submitFeedback,
  getFeedback,
  updateFeedbackStatus,
} = require('../controllers/feedbackController');

// Public route — no auth needed
router.post('/submit', submitFeedback);

// Protected routes
router.get('/', protect, getFeedback);
router.patch('/:id/status', protect, updateFeedbackStatus);

module.exports = router;
