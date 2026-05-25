const Feedback = require('../models/Feedback');
const ReviewRequest = require('../models/ReviewRequest');

const submitFeedback = async (req, res) => {
  try {
    const { token, message, allowContact } = req.body;

    if (!token || !message) {
      return res.status(400).json({ message: 'Token and message are required' });
    }

    const reviewRequest = await ReviewRequest.findOne({ token }).populate('customerId', 'name');
    if (!reviewRequest) return res.status(404).json({ message: 'Invalid review link' });
    if (reviewRequest.outcome !== 'feedback') {
      return res.status(400).json({ message: 'This link is not eligible for feedback' });
    }

    const existing = await Feedback.findOne({ requestId: reviewRequest._id });
    if (existing) return res.status(400).json({ message: 'Feedback already submitted for this request' });

    const feedback = await Feedback.create({
      requestId: reviewRequest._id,
      businessId: reviewRequest.businessId,
      customerId: reviewRequest.customerId,
      starRating: reviewRequest.starRating,
      message: message.trim(),
      allowContact: allowContact || false,
    });

    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit feedback', error: error.message });
  }
};

const getFeedback = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { businessId: req.business.id };
    if (status) filter.status = status;

    const feedbacks = await Feedback.find(filter)
      .populate('customerId', 'name phone email')
      .sort({ createdAt: -1 });

    res.json({ feedbacks });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch feedback', error: error.message });
  }
};

const updateFeedbackStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['new', 'seen', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const feedback = await Feedback.findOneAndUpdate(
      { _id: req.params.id, businessId: req.business.id },
      { status },
      { new: true }
    );

    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
    res.json({ message: 'Feedback status updated', feedback });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update feedback status', error: error.message });
  }
};

module.exports = { submitFeedback, getFeedback, updateFeedbackStatus };
