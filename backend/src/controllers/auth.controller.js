const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const Business = require('../models/Business.model');
const { sendEmail } = require('../services/email.service');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      role,
      businessName,
      businessCategory,
    } = req.body;

    const userRole = role || 'customer';

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered.',
      });
    }

    // 1. Create user first
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      role: userRole,
    });

    let businessId = null;

    // 2. If business owner/admin, create business with ownerId
    if (userRole === 'admin') {
      const business = await Business.create({
        name: businessName || `${firstName}'s Business`,
        category: businessCategory || 'other',
        ownerId: user._id,
        workingHours: {
          monday: { open: '09:00', close: '18:00', isOpen: true },
          tuesday: { open: '09:00', close: '18:00', isOpen: true },
          wednesday: { open: '09:00', close: '18:00', isOpen: true },
          thursday: { open: '09:00', close: '18:00', isOpen: true },
          friday: { open: '09:00', close: '18:00', isOpen: true },
          saturday: { open: '09:00', close: '13:00', isOpen: false },
          sunday: { open: '09:00', close: '13:00', isOpen: false },
        },
      });

      businessId = business._id;

      user.businessId = businessId;
      await user.save();
    }

    const token = generateToken(user._id);

    // 3. Send welcome email safely
    try {
      await sendEmail({
        to: email,
        subject: 'Welcome to Smart Booking!',
        template: 'welcome',
        data: { name: firstName },
      });
    } catch (emailError) {
      console.warn('Email send failed:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        businessId: user.businessId,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({
      success: false,
      message: 'Registration failed.',
      error: err.message,
    });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email })
      .select('+password')
      .populate('businessId', 'name slug isActive');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Contact support.',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        businessId: user.businessId?._id,
        businessName: user.businessId?.name,
        businessSlug: user.businessId?.slug,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Login failed.',
      error: err.message,
    });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      'businessId',
      'name slug category settings isActive'
    );

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user.',
    });
  }
};

// PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName, phone, avatar },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated.',
      user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Update failed.',
    });
  }
};

// PUT /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Password change failed.',
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
};