const Business = require('../models/Business.model');
const User = require('../models/User.model');

// GET /api/businesses (public: list all active)
const getBusinesses = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    let query = { isActive: true };
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    const total = await Business.countDocuments(query);
    const businesses = await Business.find(query)
      .select('-stripeAccountId')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, businesses, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch businesses.' });
  }
};

// GET /api/businesses/:id or /api/businesses/slug/:slug
const getBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const business = await Business.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { slug: id }],
      isActive: true,
    }).select('-stripeAccountId');

    if (!business) return res.status(404).json({ success: false, message: 'Business not found.' });
    res.json({ success: true, business });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch business.' });
  }
};

// GET /api/businesses/mine (admin: own business)
const getMyBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.user.businessId);
    if (!business) return res.status(404).json({ success: false, message: 'Business not found.' });
    res.json({ success: true, business });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch business.' });
  }
};

// PUT /api/businesses/:id
const updateBusiness = async (req, res) => {
  try {
    const { name, description, category, contact, address, workingHours, settings, logo, banner } = req.body;

    const business = await Business.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user._id },
      { name, description, category, contact, address, workingHours, settings, logo, banner },
      { new: true, runValidators: true }
    );

    if (!business) return res.status(404).json({ success: false, message: 'Business not found or not authorized.' });
    res.json({ success: true, message: 'Business updated.', business });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Update failed.', error: err.message });
  }
};

// GET /api/businesses/:businessId/staff
const getBusinessStaff = async (req, res) => {
  try {
    const staff = await User.find({
      businessId: req.params.businessId,
      role: { $in: ['staff', 'admin'] },
      isActive: true,
    }).select('firstName lastName email phone services avatar');
    res.json({ success: true, staff });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch staff.' });
  }
};

// POST /api/businesses/staff (admin: add staff)
const addStaff = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, services } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already in use.' });

    const staff = await User.create({
      firstName, lastName, email, password, phone,
      role: 'staff',
      businessId: req.user.businessId,
      services: services || [],
    });

    res.status(201).json({ success: true, message: 'Staff added.', staff });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to add staff.', error: err.message });
  }
};

// DELETE /api/businesses/staff/:staffId
const removeStaff = async (req, res) => {
  try {
    const staff = await User.findOneAndUpdate(
      { _id: req.params.staffId, businessId: req.user.businessId, role: 'staff' },
      { isActive: false },
      { new: true }
    );
    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found.' });
    res.json({ success: true, message: 'Staff removed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to remove staff.' });
  }
};

module.exports = { getBusinesses, getBusiness, getMyBusiness, updateBusiness, getBusinessStaff, addStaff, removeStaff };
