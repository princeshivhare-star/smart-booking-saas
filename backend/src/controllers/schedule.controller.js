const BlockedSlot = require('../models/BlockedSlot.model');

// GET /api/schedules/blocked?businessId=&date=
const getBlockedSlots = async (req, res) => {
  try {
    const { businessId, staffId, date, startDate, endDate } = req.query;
    let query = {};

    if (businessId) query.businessId = businessId;
    if (staffId) query.staffId = staffId;
    if (date) query.date = date;
    if (startDate && endDate) query.date = { $gte: startDate, $lte: endDate };

    const slots = await BlockedSlot.find(query).populate('staffId', 'firstName lastName').sort({ date: 1, startTime: 1 });
    res.json({ success: true, slots });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch blocked slots.' });
  }
};

// POST /api/schedules/blocked (admin/staff)
const createBlockedSlot = async (req, res) => {
  try {
    const { staffId, date, startTime, endTime, reason, type } = req.body;

    const slot = await BlockedSlot.create({
      businessId: req.user.businessId,
      staffId: staffId || req.user._id,
      date, startTime, endTime,
      reason, type: type || 'blocked',
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, message: 'Time slot blocked.', slot });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to block slot.', error: err.message });
  }
};

// DELETE /api/schedules/blocked/:id (admin/staff)
const deleteBlockedSlot = async (req, res) => {
  try {
    const slot = await BlockedSlot.findOneAndDelete({
      _id: req.params.id,
      businessId: req.user.businessId,
    });
    if (!slot) return res.status(404).json({ success: false, message: 'Slot not found.' });
    res.json({ success: true, message: 'Slot unblocked.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Delete failed.' });
  }
};

module.exports = { getBlockedSlots, createBlockedSlot, deleteBlockedSlot };
