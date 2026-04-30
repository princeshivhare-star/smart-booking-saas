const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const bookingSchema = new mongoose.Schema({
  bookingRef:  { type: String, unique: true, default: () => uuidv4().split('-')[0].toUpperCase() },
  businessId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  serviceId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  staffId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  date:      { type: String, required: true }, // YYYY-MM-DD
  startTime: { type: String, required: true }, // HH:MM
  endTime:   { type: String, required: true }, // HH:MM

  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
    default: 'pending',
  },

  payment: {
    method:        { type: String, enum: ['online', 'at_location', 'free'], default: 'at_location' },
    status:        { type: String, enum: ['pending', 'paid', 'refunded', 'failed'], default: 'pending' },
    amount:        { type: Number },
    currency:      { type: String, default: 'USD' },
    stripePaymentIntentId: { type: String },
    paidAt:        { type: Date },
  },

  notes:           { type: String },       // customer notes
  internalNotes:   { type: String },       // staff/admin notes
  cancellationReason: { type: String },
  cancelledBy:     { type: String, enum: ['customer', 'staff', 'admin', 'system'] },
  cancelledAt:     { type: Date },

  reminderSent:    { type: Boolean, default: false },
  confirmationSent:{ type: Boolean, default: false },

}, { timestamps: true });

// Compound index to prevent duplicate/conflicting bookings
bookingSchema.index({ staffId: 1, date: 1, startTime: 1, status: 1 });
bookingSchema.index({ businessId: 1, date: 1 });
bookingSchema.index({ customerId: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
