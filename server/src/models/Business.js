const mongoose = require('mongoose');

const defaultTemplate = 'Hi *{{name}}*,\n\nThank you for choosing *{{business_name}}*. We would really appreciate it if you could take a moment to share your experience with us.\n\n{{link}}';

const businessSchema = new mongoose.Schema({
  businessName: { type: String, required: true, trim: true },
  ownerName: { type: String, default: '', trim: true },
  subdomain: { type: String, required: true, unique: true, lowercase: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true, select: false },
  googleReviewUrl: { type: String, default: '' },
  starThreshold: { type: Number, default: 4, enum: [4, 5] },
  msgTemplate: { type: String, default: defaultTemplate },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: true },
  phone: { type: String, default: '' },
  businessType: { type: String, default: '' },
  onboardingComplete: { type: Boolean, default: false },
  emailAutomationEnabled: { type: Boolean, default: false },
  smtpUser: { type: String, default: '', trim: true },
  smtpPass: { type: String, default: '', select: false },
  emailFromAddress: { type: String, default: '', trim: true },
}, { timestamps: true });

businessSchema.index(
  { phone: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { phone: { $type: 'string', $gt: '' } },
  }
);

module.exports = mongoose.model('Business', businessSchema);
