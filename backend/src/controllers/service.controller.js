const Service = require('../models/Service.model');

// GET /api/services?businessId=...
const getServices = async (req, res) => {
  try {
    const { businessId } = req.query;
    if (!businessId) return res.status(400).json({ success: false, message: 'businessId is required.' });

    const services = await Service.find({ businessId, isActive: true })
      .populate('staffIds', 'firstName lastName avatar');
    res.json({ success: true, services });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch services.' });
  }
};

// GET /api/services/:id
const getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('staffIds', 'firstName lastName avatar');
    if (!service) return res.status(404).json({ success: false, message: 'Service not found.' });
    res.json({ success: true, service });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch service.' });
  }
};

// POST /api/services (admin only)
const createService = async (req, res) => {
  try {
    const { name, description, duration, price, currency, category, image, staffIds, bufferTime, maxConcurrent } = req.body;
    const service = await Service.create({
      businessId: req.user.businessId,
      name, description, duration, price, currency, category, image,
      staffIds: staffIds || [],
      bufferTime: bufferTime || 0,
      maxConcurrent: maxConcurrent || 1,
    });
    res.status(201).json({ success: true, message: 'Service created.', service });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create service.', error: err.message });
  }
};

// PUT /api/services/:id (admin only)
const updateService = async (req, res) => {
  try {
    const service = await Service.findOneAndUpdate(
      { _id: req.params.id, businessId: req.user.businessId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!service) return res.status(404).json({ success: false, message: 'Service not found.' });
    res.json({ success: true, message: 'Service updated.', service });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Update failed.' });
  }
};

// DELETE /api/services/:id (soft delete)
const deleteService = async (req, res) => {
  try {
    const service = await Service.findOneAndUpdate(
      { _id: req.params.id, businessId: req.user.businessId },
      { isActive: false },
      { new: true }
    );
    if (!service) return res.status(404).json({ success: false, message: 'Service not found.' });
    res.json({ success: true, message: 'Service deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Delete failed.' });
  }
};

module.exports = { getServices, getService, createService, updateService, deleteService };
