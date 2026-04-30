const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: true, minlength: 6, select: false },
  phone:     { type: String, trim: true },
  role:      { type: String, enum: ['admin', 'staff', 'customer'], default: 'customer' },
  avatar:    { type: String },
  isActive:  { type: Boolean, default: true },

  // Multi-tenant: which business this user belongs to (for staff/admin)
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' },

  // For staff: what services they can perform
  services:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],

  // Customer loyalty points (Phase 2 placeholder)
  loyaltyPoints: { type: Number, default: 0 },

  resetPasswordToken:   { type: String },
  resetPasswordExpires: { type: Date },

}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpires;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
