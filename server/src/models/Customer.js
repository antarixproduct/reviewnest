const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, default: '', lowercase: true, trim: true },
  notes: { type: String, default: '' },
  isOptedOut: { type: Boolean, default: false },
  totalRequests: { type: Number, default: 0 },
}, { timestamps: true });

customerSchema.index({ businessId: 1, phone: 1 }, { unique: true });

module.exports = mongoose.model('Customer', customerSchema);
