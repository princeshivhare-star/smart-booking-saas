const Booking = require('../models/Booking.model');
const Service = require('../models/Service.model');
const BlockedSlot = require('../models/BlockedSlot.model');
const Business = require('../models/Business.model');
const User = require('../models/User.model');
const { sendEmail } = require('../services/email.service');
const { getAvailableSlots } = require('../services/availability.service');

// GET /api/bookings/availability
const getAvailability = async (req, res) => {
  try {
    const { serviceId, staffId, date } = req.query;
    if (!serviceId || !date) {
      return res.status(400).json({ success: false, message: 'serviceId and date are required.' });
    }

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found.' });

    const business = await Business.findById(service.businessId);
    if (!business) return res.status(404).json({ success: false, message: 'Business not found.' });

    const slots = await getAvailableSlots({ service, business, staffId, date });
    res.json({ success: true, slots, date, serviceId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to get availability.', error: err.message });
  }
};

// POST /api/bookings
const createBooking = async (req, res) => {
  try {
    const { serviceId, staffId, date, startTime, notes, paymentMethod } = req.body;
    const customerId = req.user._id;

    const service = await Service.findById(serviceId);
    if (!service || !service.isActive) {
      return res.status(404).json({ success: false, message: 'Service not found or inactive.' });
    }

    // Calculate end time
    const [h, m] = startTime.split(':').map(Number);
    const endMinutes = h * 60 + m + service.duration + (service.bufferTime || 0);
    const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;

    // Check for conflicts
    const conflict = await Booking.findOne({
      staffId: staffId || { $exists: true },
      date,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
      ],
      ...(staffId && { staffId }),
      businessId: service.businessId,
    });

    if (conflict) {
      return res.status(409).json({ success: false, message: 'This time slot is already booked.' });
    }

    // Check blocked slots
    const blocked = await BlockedSlot.findOne({
      date,
      $or: [
        { staffId: staffId || null },
        { staffId: { $exists: false } },
      ],
      businessId: service.businessId,
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    if (blocked) {
      return res.status(409).json({ success: false, message: 'This time slot is not available.' });
    }

    const business = await Business.findById(service.businessId);
    const booking = await Booking.create({
      businessId: service.businessId,
      serviceId,
      staffId: staffId || null,
      customerId,
      date,
      startTime,
      endTime,
      status: business.settings?.autoConfirm ? 'confirmed' : 'pending',
      notes,
      payment: {
        method: paymentMethod || 'at_location',
        amount: service.price,
        currency: service.currency || 'USD',
        status: paymentMethod === 'at_location' ? 'pending' : 'pending',
      },
    });

    await booking.populate(['serviceId', 'staffId', 'customerId', 'businessId']);

    // Send confirmation email
    await sendEmail({
      to: req.user.email,
      subject: `Booking Confirmed - ${booking.bookingRef}`,
      template: 'booking_confirmation',
      data: {
        name: req.user.firstName,
        bookingRef: booking.bookingRef,
        service: service.name,
        date,
        startTime,
      },
    });

    res.status(201).json({ success: true, message: 'Booking created successfully.', booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create booking.', error: err.message });
  }
};

// GET /api/bookings (admin/staff: their business; customer: own bookings)
const getBookings = async (req, res) => {
  try {
    const { status, date, page = 1, limit = 20 } = req.query;
    let query = {};

    if (req.user.role === 'customer') {
      query.customerId = req.user._id;
    } else if (req.user.role === 'staff') {
      query.staffId = req.user._id;
    } else if (req.user.role === 'admin') {
      query.businessId = req.user.businessId;
    }

    if (status) query.status = status;
    if (date) query.date = date;

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('serviceId', 'name duration price')
      .populate('staffId', 'firstName lastName')
      .populate('customerId', 'firstName lastName email phone')
      .populate('businessId', 'name')
      .sort({ date: -1, startTime: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      bookings,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit), limit: parseInt(limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch bookings.', error: err.message });
  }
};

// GET /api/bookings/:id
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('serviceId')
      .populate('staffId', 'firstName lastName email phone')
      .populate('customerId', 'firstName lastName email phone')
      .populate('businessId', 'name contact');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    // Authorization check
    const userId = req.user._id.toString();
    if (
      req.user.role === 'customer' && booking.customerId._id.toString() !== userId &&
      req.user.role === 'staff'    && booking.staffId?._id.toString() !== userId
    ) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch booking.' });
  }
};

// PUT /api/bookings/:id/reschedule
const rescheduleBooking = async (req, res) => {
  try {
    const { date, startTime } = req.body;
    const booking = await Booking.findById(req.params.id).populate('serviceId');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: 'Cannot reschedule this booking.' });
    }

    // Check authorization
    if (req.user.role === 'customer' && booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const service = booking.serviceId;
    const [h, m] = startTime.split(':').map(Number);
    const endMinutes = h * 60 + m + service.duration;
    const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;

    // Conflict check (excluding current booking)
    const conflict = await Booking.findOne({
      _id: { $ne: booking._id },
      businessId: booking.businessId,
      staffId: booking.staffId,
      date,
      status: { $in: ['pending', 'confirmed'] },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    if (conflict) {
      return res.status(409).json({ success: false, message: 'New time slot is not available.' });
    }

    booking.date = date;
    booking.startTime = startTime;
    booking.endTime = endTime;
    await booking.save();

    await sendEmail({
      to: req.user.email,
      subject: `Booking Rescheduled - ${booking.bookingRef}`,
      template: 'booking_rescheduled',
      data: { name: req.user.firstName, bookingRef: booking.bookingRef, date, startTime },
    });

    res.json({ success: true, message: 'Booking rescheduled.', booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Reschedule failed.', error: err.message });
  }
};

// PUT /api/bookings/:id/cancel
const cancelBooking = async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled.' });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = reason;
    booking.cancelledBy = req.user.role;
    booking.cancelledAt = new Date();
    await booking.save();

    await sendEmail({
      to: req.user.email,
      subject: `Booking Cancelled - ${booking.bookingRef}`,
      template: 'booking_cancelled',
      data: { name: req.user.firstName, bookingRef: booking.bookingRef, reason },
    });

    res.json({ success: true, message: 'Booking cancelled.', booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Cancellation failed.', error: err.message });
  }
};

// PUT /api/bookings/:id/status (admin/staff only)
const updateBookingStatus = async (req, res) => {
  try {
    const { status, internalNotes } = req.body;
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, businessId: req.user.businessId },
      { status, ...(internalNotes && { internalNotes }) },
      { new: true }
    );
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    res.json({ success: true, message: 'Status updated.', booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Update failed.' });
  }
};

module.exports = {
  getAvailability,
  createBooking,
  getBookings,
  getBookingById,
  rescheduleBooking,
  cancelBooking,
  updateBookingStatus,
};
