const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Business = require('../models/Business');
const { generateSubdomain, isReserved } = require('../utils/tokenGenerator');

const getJwtRefreshSecret = () => process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

const generateAccessToken = (business) => jwt.sign(
  { id: business._id, subdomain: business.subdomain, email: business.email },
  process.env.JWT_SECRET,
  { expiresIn: '15m' }
);

const generateRefreshToken = (business) => jwt.sign(
  { id: business._id },
  getJwtRefreshSecret(),
  { expiresIn: '30d' }
);

const isProduction = process.env.NODE_ENV === 'production';

const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/',
  });
};

const normalizePhone = (phone = '') => String(phone).replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');

const serializeBusiness = (business) => ({
  id: business._id,
  businessName: business.businessName,
  ownerName: business.ownerName || '',
  email: business.email,
  subdomain: business.subdomain,
  onboardingComplete: business.onboardingComplete || false,
});

const validatePassword = (password = '') => (
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)
);

const setupStatus = async (req, res) => {
  try {
    const business = await Business.findOne({}).select('_id onboardingComplete');
    res.json({
      isSetupComplete: Boolean(business?.onboardingComplete),
      hasBusiness: Boolean(business),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to check setup status', error: error.message });
  }
};

const register = async (req, res) => {
  try {
    const { email, businessName, ownerName, phone, businessType, googleReviewUrl, password } = req.body;

    const existingBusiness = await Business.findOne({});
    if (existingBusiness) {
      return res.status(403).json({ message: 'ReviewNest setup is already complete. Please sign in.' });
    }

    if (!email || !businessName || !ownerName || !phone || !businessType || !googleReviewUrl || !password) {
      return res.status(400).json({ message: 'All setup fields are required' });
    }

    const normalizedPhone = normalizePhone(phone);
    if (normalizedPhone.length !== 10) {
      return res.status(400).json({ message: 'Please enter a valid 10-digit WhatsApp number.' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters with uppercase, lowercase, number and special character.' });
    }

    const reviewUrl = googleReviewUrl.trim();
    if (!/^https:\/\/g\.page\/r\/[A-Za-z0-9_-]+\/review$/.test(reviewUrl)) {
      return res.status(400).json({ message: 'Please enter a valid Google review link. It should look like: https://g.page/r/.../review' });
    }

    let subdomain = generateSubdomain(businessName);
    if (isReserved(subdomain)) subdomain = `${subdomain}-biz`;

    const passwordHash = await bcrypt.hash(password, 12);
    const business = await Business.create({
      businessName: businessName.trim(),
      ownerName: ownerName.trim(),
      phone: normalizedPhone,
      subdomain,
      email: email.toLowerCase().trim(),
      passwordHash,
      googleReviewUrl: reviewUrl,
      businessType: businessType.trim(),
      isVerified: true,
      isActive: true,
      onboardingComplete: true,
    });

    const accessToken = generateAccessToken(business);
    const refreshToken = generateRefreshToken(business);
    setRefreshCookie(res, refreshToken);

    res.status(201).json({
      message: 'ReviewNest setup complete.',
      accessToken,
      business: serializeBusiness(business),
    });
  } catch (error) {
    res.status(500).json({ message: 'Setup failed', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const business = await Business.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!business) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, business.passwordHash);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    if (!business.isActive) {
      return res.status(403).json({ message: 'Your account is inactive.' });
    }

    const accessToken = generateAccessToken(business);
    const refreshToken = generateRefreshToken(business);
    setRefreshCookie(res, refreshToken);

    res.json({ accessToken, business: serializeBusiness(business) });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

const refresh = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: 'No refresh token' });

    const decoded = jwt.verify(token, getJwtRefreshSecret());
    const business = await Business.findById(decoded.id);
    if (!business) return res.status(401).json({ message: 'Business not found' });

    const accessToken = generateAccessToken(business);
    const newRefreshToken = generateRefreshToken(business);
    setRefreshCookie(res, newRefreshToken);

    res.json({ accessToken, business: serializeBusiness(business) });
  } catch {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

const logout = (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  });
  res.json({ message: 'Logged out successfully' });
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }
    if (!validatePassword(newPassword)) {
      return res.status(400).json({ message: 'New password must be at least 8 characters with uppercase, lowercase, number and special character.' });
    }

    const business = await Business.findById(req.business.id).select('+passwordHash');
    if (!business) return res.status(404).json({ message: 'Business not found' });

    const isMatch = await bcrypt.compare(currentPassword, business.passwordHash);
    if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect' });

    business.passwordHash = await bcrypt.hash(newPassword, 12);
    await business.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to change password', error: error.message });
  }
};

module.exports = { setupStatus, register, login, refresh, logout, changePassword };
