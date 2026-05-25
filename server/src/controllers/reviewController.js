const ReviewRequest = require('../models/ReviewRequest');
const Customer = require('../models/Customer');
const Business = require('../models/Business');
const { createReviewToken } = require('../utils/tokenGenerator');

const getPublicBaseUrl = (req) => {
  if (process.env.SERVER_URL) {
    return process.env.SERVER_URL.replace(/\/$/, '');
  }

  const protocol = (req.get('x-forwarded-proto') || req.protocol).split(',')[0].trim();
  const host = (req.get('x-forwarded-host') || req.get('host')).split(',')[0].trim();
  return `${protocol}://${host}`;
};

const getReviewPageBaseUrl = (req) => (
  process.env.PUBLIC_REVIEW_URL ||
  process.env.FRONTEND_URL ||
  process.env.CLIENT_URL ||
  process.env.APP_URL ||
  (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5173') ||
  getPublicBaseUrl(req)
).replace(/\/$/, '');

const buildMessage = ({ business, customer, trackingUrl }) => (
  business.msgTemplate
    .replaceAll('{{name}}', customer.name)
    .replaceAll('{{business_name}}', business.businessName)
    .replaceAll('{{link}}', trackingUrl)
);

const sendReviewRequest = async (req, res) => {
  try {
    const { customerId } = req.body;
    if (!customerId) {
      return res.status(400).json({ message: 'Customer ID is required' });
    }

    const customer = await Customer.findOne({ _id: customerId, businessId: req.business.id });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    if (customer.isOptedOut) return res.status(400).json({ message: 'Customer has opted out of review requests' });

    const business = await Business.findById(req.business.id);
    if (!business) return res.status(404).json({ message: 'Business not found' });

    const token = createReviewToken();
    const trackingUrl = `${getReviewPageBaseUrl(req)}/r/${token}`;
    const message = buildMessage({ business, customer, trackingUrl });
    const whatsappUrl = `https://wa.me/91${customer.phone}?text=${encodeURIComponent(message)}`;

    const reviewRequest = await ReviewRequest.create({
      token,
      businessId: business._id,
      customerId: customer._id,
      whatsappMessage: message,
      sentAt: new Date(),
    });

    await Customer.findByIdAndUpdate(customer._id, { $inc: { totalRequests: 1 } });

    res.status(201).json({
      message: 'Review request created successfully',
      whatsappUrl,
      trackingUrl,
      reviewRequest,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send review request', error: error.message });
  }
};

const getReviewRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';

    const query = { businessId: req.business.id };

    if (status) {
      if (status === 'google') query.outcome = 'google';
      else if (status === 'feedback') query.outcome = 'feedback';
      else if (status === 'clicked') { query.clickedAt = { $ne: null }; query.outcome = { $ne: 'google' }; }
      else if (status === 'pending') { query.outcome = 'pending'; query.clickedAt = null; }
      else if (status === 'followup') { query.needsResend = true; }
    }

    if (search) {
      const matchingCustomers = await Customer.find({
        businessId: req.business.id,
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');

      query.customerId = { $in: matchingCustomers.map((c) => c._id) };
    }

    const total = await ReviewRequest.countDocuments(query);
    const requests = await ReviewRequest.find(query)
      .populate('customerId', 'name phone email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ requests, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch review requests', error: error.message });
  }
};

const resendReviewRequest = async (req, res) => {
  try {
    const reviewRequest = await ReviewRequest.findOne({ _id: req.params.id, businessId: req.business.id }).populate('customerId');
    if (!reviewRequest) return res.status(404).json({ message: 'Review request not found' });
    if (reviewRequest.customerId.isOptedOut) return res.status(400).json({ message: 'Customer has opted out' });

    const business = await Business.findById(req.business.id);
    const token = createReviewToken();
    const trackingUrl = `${getReviewPageBaseUrl(req)}/r/${token}`;
    const message = buildMessage({ business, customer: reviewRequest.customerId, trackingUrl });
    const whatsappUrl = `https://wa.me/91${reviewRequest.customerId.phone}?text=${encodeURIComponent(message)}`;

    await ReviewRequest.findByIdAndUpdate(reviewRequest._id, {
      token,
      whatsappMessage: message,
      sentAt: new Date(),
      isResend: true,
      needsResend: false,
      $inc: { resendCount: 1 },
      outcome: 'pending',
      clickedAt: null,
      starRating: null,
    });

    res.json({ message: 'Review request resent successfully', whatsappUrl, trackingUrl });
  } catch (error) {
    res.status(500).json({ message: 'Failed to resend review request', error: error.message });
  }
};

const trackClick = async (req, res) => {
  try {
    const { token } = req.params;
    const now = new Date();

    const reviewRequest = await ReviewRequest.findOneAndUpdate(
      { token, clickedAt: null, expiresAt: { $gte: now } },
      { clickedAt: now },
      { new: true }
    ).populate('businessId').populate('customerId', 'name');

    if (!reviewRequest) {
      const existingRequest = await ReviewRequest.findOne({ token }).select('clickedAt expiresAt');
      if (!existingRequest) return res.status(404).json({ message: 'Invalid or expired review link' });
      if (existingRequest.expiresAt < now) return res.status(410).json({ message: 'This review link has expired' });
      if (existingRequest.clickedAt) return res.status(410).json({ message: 'This review link has already been used' });
      return res.status(404).json({ message: 'Invalid or expired review link' });
    }

    res.json({
      token,
      businessName: reviewRequest.businessId.businessName,
      businessType: reviewRequest.businessId.businessType || '',
      starThreshold: reviewRequest.businessId.starThreshold,
      googleReviewUrl: reviewRequest.businessId.googleReviewUrl,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to process review link', error: error.message });
  }
};

const submitRating = async (req, res) => {
  try {
    const { token } = req.params;
    const { starRating } = req.body;

    if (!starRating || starRating < 1 || starRating > 5) {
      return res.status(400).json({ message: 'Invalid star rating' });
    }

    const reviewRequest = await ReviewRequest.findOne({ token }).populate('businessId').populate('customerId', 'name');
    if (!reviewRequest) return res.status(404).json({ message: 'Invalid or expired review link' });

    const threshold = reviewRequest.businessId.starThreshold || 4;
    const outcome = starRating >= threshold ? 'google' : 'feedback';

    await ReviewRequest.findByIdAndUpdate(reviewRequest._id, { starRating, outcome });

    if (outcome === 'google') {
      return res.json({ outcome: 'google', googleReviewUrl: reviewRequest.businessId.googleReviewUrl });
    }
    return res.json({ outcome: 'feedback', token });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit rating', error: error.message });
  }
};

module.exports = { sendReviewRequest, getReviewRequests, resendReviewRequest, trackClick, submitRating };
