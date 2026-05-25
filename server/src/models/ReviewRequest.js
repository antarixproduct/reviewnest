const mongoose = require('mongoose');

const reviewRequestSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  sentAt: { type: Date, default: Date.now },
  clickedAt: { type: Date, default: null },
  outcome: { type: String, enum: ['pending', 'google', 'feedback'], default: 'pending' },
  starRating: { type: Number, default: null },
  resendCount: { type: Number, default: 0 },
  isResend: { type: Boolean, default: false },
  needsResend: { type: Boolean, default: false },
  whatsappMessage: { type: String, default: '' },
  emailMessage: { type: String, default: '' },
  emailSentAt: { type: Date, default: null },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
}, { timestamps: true });

reviewRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
reviewRequestSchema.index({ businessId: 1, outcome: 1, clickedAt: 1, sentAt: 1 });

module.exports = mongoose.model('ReviewRequest', reviewRequestSchema);
