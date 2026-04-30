const mongoose = require('mongoose');

const blockedSlotSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  staffId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null = whole business blocked
  date:       { type: String, required: true }, // YYYY-MM-DD
  startTime:  { type: String, required: true }, // HH:MM
  endTime:    { type: String, required: true }, // HH:MM
  reason:     { type: String },
  type:       { type: String, enum: ['blocked', 'break', 'holiday', 'vacation'], default: 'blocked' },
  createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

blockedSlotSchema.index({ businessId: 1, date: 1 });
blockedSlotSchema.index({ staffId: 1, date: 1 });

module.exports = mongoose.model('BlockedSlot', blockedSlotSchema);
