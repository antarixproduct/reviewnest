const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  requestId:   { type: mongoose.Schema.Types.ObjectId, ref: 'ReviewRequest', required: true },
  businessId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  customerId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  starRating:  { type: Number, required: true, min: 1, max: 5 },
  message:     { type: String, required: true, maxlength: 1000 },
  allowContact:{ type: Boolean, default: false },
  status:      { type: String, enum: ['new', 'seen', 'resolved'], default: 'new' },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
