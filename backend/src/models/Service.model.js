const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  businessId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  name:        { type: String, required: true, trim: true },
  description: { type: String },
  duration:    { type: Number, required: true }, // minutes
  price:       { type: Number, required: true },
  currency:    { type: String, default: 'USD' },
  category:    { type: String },
  image:       { type: String },
  isActive:    { type: Boolean, default: true },

  // Which staff members can perform this service
  staffIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Buffer time after service (cleanup, etc.)
  bufferTime: { type: Number, default: 0 }, // minutes

  // Max simultaneous bookings for this service
  maxConcurrent: { type: Number, default: 1 },

}, { timestamps: true });

serviceSchema.index({ businessId: 1, isActive: 1 });

module.exports = mongoose.model('Service', serviceSchema);
