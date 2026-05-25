const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  sendReviewRequest,
  getReviewRequests,
  resendReviewRequest,
  trackClick,
  submitRating,
} = require('../controllers/reviewController');

// Protected routes
router.get('/', protect, getReviewRequests);
router.post('/send', protect, sendReviewRequest);
router.post('/resend/:id', protect, resendReviewRequest);

// Public routes — no auth needed
router.get('/r/:token', trackClick);
router.post('/r/:token/rate', submitRating);

module.exports = router;
