const Business = require('../models/Business');
const Customer = require('../models/Customer');
const ReviewRequest = require('../models/ReviewRequest');
const { sendTestEmail } = require('../utils/email');

const isValidReviewLink = (url = '') => (
  /^https:\/\/g\.page\/r\/[A-Za-z0-9_-]+\/review$/.test(url.trim())
);

const serializeBusiness = (business) => {
  const data = business.toObject ? business.toObject() : { ...business };
  delete data.passwordHash;
  delete data.smtpPass;
  return {
    ...data,
    emailAutomationConfigured: Boolean(data.smtpUser || process.env.EMAIL_SMTP_USER),
  };
};

const percentChange = (current, previous) => {
  if (!previous && !current) return 0;
  if (!previous) return 100;
  return Math.round(((current - previous) / previous) * 100);
};

const countPeriod = async (businessId, start, end) => {
  const base = { businessId, sentAt: { $gte: start, $lt: end }, isResend: false };
  const [requests, clicks, positiveRatings] = await Promise.all([
    ReviewRequest.countDocuments(base),
    ReviewRequest.countDocuments({ ...base, clickedAt: { $ne: null } }),
    ReviewRequest.countDocuments({ ...base, starRating: { $gte: 4 } }),
  ]);
  return { requests, clicks, positiveRatings };
};

const buildGrowthAnalytics = async (businessId) => {
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = startOfThisMonth;

  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(now.getDate() - now.getDay() + 1);
  startOfThisWeek.setHours(0, 0, 0, 0);
  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);
  const startOfWeekBeforeLast = new Date(startOfLastWeek);
  startOfWeekBeforeLast.setDate(startOfLastWeek.getDate() - 7);

  const [thisMonth, lastMonth, thisWeek, lastWeek, weekBeforeLast] = await Promise.all([
    countPeriod(businessId, startOfThisMonth, now),
    countPeriod(businessId, startOfLastMonth, endOfLastMonth),
    countPeriod(businessId, startOfThisWeek, now),
    countPeriod(businessId, startOfLastWeek, startOfThisWeek),
    countPeriod(businessId, startOfWeekBeforeLast, startOfLastWeek),
  ]);

  const weeklyVolume = [];
  for (let i = 7; i >= 0; i -= 1) {
    const start = new Date(startOfThisWeek);
    start.setDate(startOfThisWeek.getDate() - i * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    weeklyVolume.push({
      label: start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      requests: await ReviewRequest.countDocuments({ businessId, sentAt: { $gte: start, $lt: end }, isResend: false }),
    });
  }

  return {
    cards: {
      requests: { current: thisMonth.requests, previous: lastMonth.requests, change: percentChange(thisMonth.requests, lastMonth.requests) },
      clicks: { current: thisMonth.clicks, previous: lastMonth.clicks, change: percentChange(thisMonth.clicks, lastMonth.clicks) },
      positiveRatings: { current: thisMonth.positiveRatings, previous: lastMonth.positiveRatings, change: percentChange(thisMonth.positiveRatings, lastMonth.positiveRatings) },
    },
    weeklyVolume,
    table: [
      { period: 'This week', ...thisWeek, growth: percentChange(thisWeek.requests, lastWeek.requests) },
      { period: 'Last week', ...lastWeek, growth: null },
      { period: 'This month', ...thisMonth, growth: percentChange(thisMonth.requests, lastMonth.requests) },
      { period: 'Last month', ...lastMonth, growth: null },
    ],
    weeklySummary: `Last week you sent ${lastWeek.requests} requests and received ${lastWeek.positiveRatings} positive ratings - ${percentChange(lastWeek.requests, weekBeforeLast.requests) >= 0 ? 'up' : 'down'} ${Math.abs(percentChange(lastWeek.requests, weekBeforeLast.requests))}% from the week before.`,
  };
};

const getProfile = async (req, res) => {
  try {
    const business = await Business.findById(req.business.id).select('-passwordHash -smtpPass');
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    res.json({ business: serializeBusiness(business) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const {
      businessName,
      ownerName,
      googleReviewUrl,
      msgTemplate,
      starThreshold,
      phone,
      businessType,
      emailAutomationEnabled,
      smtpUser,
      smtpPass,
      emailFromAddress,
    } = req.body;

    const business = await Business.findById(req.business.id).select('+smtpPass');
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    if (!businessName?.trim()) return res.status(400).json({ message: 'Business name is required' });
    if (!ownerName?.trim()) return res.status(400).json({ message: 'Owner name is required' });
    if (!businessType?.trim()) return res.status(400).json({ message: 'Business type is required' });

    const trimmedGoogleReviewUrl = googleReviewUrl?.trim() || '';
    if (!isValidReviewLink(trimmedGoogleReviewUrl)) {
      return res.status(400).json({ message: 'Please enter a valid Google review link. It should look like: https://g.page/r/.../review' });
    }

    const threshold = Number(starThreshold);
    if (![4, 5].includes(threshold)) {
      return res.status(400).json({ message: 'Rating threshold must be 4 or 5 stars' });
    }

    business.businessName = businessName.trim();
    business.ownerName = ownerName.trim();
    business.phone = String(phone || '').replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
    business.businessType = businessType.trim();
    business.googleReviewUrl = trimmedGoogleReviewUrl;
    business.starThreshold = threshold;
    if (msgTemplate?.trim()) business.msgTemplate = msgTemplate;
    business.emailAutomationEnabled = Boolean(emailAutomationEnabled);
    business.smtpUser = smtpUser?.trim() || '';
    business.emailFromAddress = emailFromAddress?.trim() || business.smtpUser;
    if (smtpPass) business.smtpPass = smtpPass;

    if (business.emailAutomationEnabled && (!business.smtpUser || !business.smtpPass)) {
      return res.status(400).json({ message: 'Gmail address and app password are required to enable email automation' });
    }

    await business.save();

    res.json({ message: 'Settings saved successfully', business: serializeBusiness(business) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};

const testEmail = async (req, res) => {
  try {
    const { to, smtpUser, smtpPass, emailFromAddress } = req.body;
    const business = await Business.findById(req.business.id).select('+smtpPass');
    if (!business) return res.status(404).json({ message: 'Business not found' });

    const testBusiness = {
      ...business.toObject(),
      smtpUser: smtpUser?.trim() || business.smtpUser,
      smtpPass: smtpPass || business.smtpPass,
      emailFromAddress: emailFromAddress?.trim() || business.emailFromAddress,
    };

    await sendTestEmail({ business: testBusiness, to: to || testBusiness.smtpUser });
    res.json({ message: 'Test email sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send test email', error: error.message });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const businessId = req.business.id;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [totalCustomers, totalRequests, clickedRequests, googleRedirects, feedbackReceived, pendingRequests, recentRequests, monthlyRequests, monthlyRespondedRequests, growth] = await Promise.all([
      Customer.countDocuments({ businessId }),
      ReviewRequest.countDocuments({ businessId }),
      ReviewRequest.countDocuments({ businessId, clickedAt: { $ne: null } }),
      ReviewRequest.countDocuments({ businessId, outcome: 'google' }),
      ReviewRequest.countDocuments({ businessId, outcome: 'feedback' }),
      ReviewRequest.countDocuments({ businessId, outcome: 'pending', clickedAt: null }),
      ReviewRequest.find({ businessId })
        .sort({ sentAt: -1 })
        .limit(5)
        .populate('customerId', 'name phone email'),
      ReviewRequest.countDocuments({ businessId, sentAt: { $gte: startOfMonth }, isResend: false }),
      ReviewRequest.countDocuments({
        businessId,
        sentAt: { $gte: startOfMonth },
        isResend: false,
        $or: [
          { clickedAt: { $ne: null } },
          { outcome: { $in: ['google', 'feedback'] } },
        ],
      }),
      buildGrowthAnalytics(businessId),
    ]);

    res.json({
      totalCustomers,
      totalRequests,
      clickedRequests,
      googleRedirects,
      feedbackReceived,
      pendingRequests,
      recentRequests,
      monthlyRequests,
      monthlyRespondedRequests,
      monthlyResponseRate: monthlyRequests > 0 ? Math.round((monthlyRespondedRequests / monthlyRequests) * 100) : 0,
      googleScore: null,
      growth,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
  }
};

module.exports = { getProfile, updateProfile, testEmail, getAnalytics };
