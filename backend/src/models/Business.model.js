const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  slug:        { type: String, unique: true, lowercase: true },
  description: { type: String },
  category:    {
    type: String,
    enum: ['barbershop', 'clinic', 'salon', 'workshop', 'consultant', 'spa', 'gym', 'other'],
    default: 'other',
  },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  contact: {
    email:   { type: String },
    phone:   { type: String },
    website: { type: String },
  },
  address: {
    street:  { type: String },
    city:    { type: String },
    state:   { type: String },
    country: { type: String },
    zip:     { type: String },
  },

  logo:    { type: String },
  banner:  { type: String },
  isActive: { type: Boolean, default: true },

  // Working hours: { monday: { open: '09:00', close: '18:00', isOpen: true }, ... }
  workingHours: {
    monday:    { open: String, close: String, isOpen: { type: Boolean, default: true } },
    tuesday:   { open: String, close: String, isOpen: { type: Boolean, default: true } },
    wednesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    thursday:  { open: String, close: String, isOpen: { type: Boolean, default: true } },
    friday:    { open: String, close: String, isOpen: { type: Boolean, default: true } },
    saturday:  { open: String, close: String, isOpen: { type: Boolean, default: false } },
    sunday:    { open: String, close: String, isOpen: { type: Boolean, default: false } },
  },

  // Subscription plan (Phase 2)
  plan: { type: String, enum: ['free', 'basic', 'pro', 'enterprise'], default: 'free' },

  settings: {
    bookingInterval:    { type: Number, default: 30 }, // in minutes
    maxAdvanceBooking:  { type: Number, default: 30 }, // in days
    cancellationPolicy: { type: Number, default: 24 }, // hours before
    autoConfirm:        { type: Boolean, default: true },
    currency:           { type: String, default: 'USD' },
  },

  stripeAccountId: { type: String },

}, { timestamps: true });

// Auto-generate slug from business name
businessSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
  }
  next();
});

module.exports = mongoose.model('Business', businessSchema);
