const mongoose = require('mongoose');
const Booking = require('../models/Booking.model');
const User = require('../models/User.model');

const getAdminDashboard = async (req, res) => {
  try {
    const businessId = req.user.businessId;

    if (!businessId) {
      return res.status(400).json({
        success: false,
        message: 'Business ID not found for this user.',
      });
    }

    const businessObjectId = new mongoose.Types.ObjectId(businessId);
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const [
      totalBookings,
      upcomingBookings,
      cancelledBookings,
      completedBookings,
      todayBookings,
      revenueData,
      recentBookings,
      staffCount,
    ] = await Promise.all([
      Booking.countDocuments({ businessId }),
      Booking.countDocuments({
        businessId,
        date: { $gte: today },
        status: { $in: ['confirmed', 'pending'] },
      }),
      Booking.countDocuments({ businessId, status: 'cancelled' }),
      Booking.countDocuments({ businessId, status: 'completed' }),
      Booking.countDocuments({ businessId, date: today }),

      Booking.aggregate([
        {
          $match: {
            businessId: businessObjectId,
            'payment.status': 'paid',
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $ifNull: ['$payment.amount', 0] } },
            count: { $sum: 1 },
          },
        },
      ]),

      Booking.find({ businessId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('serviceId', 'name')
        .populate('customerId', 'firstName lastName'),

      User.countDocuments({
        businessId,
        role: 'staff',
        isActive: true,
      }),
    ]);

    const monthlyData = await Booking.aggregate([
      {
        $match: {
          businessId: businessObjectId,
          date: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: { $substr: ['$date', 0, 7] },
          bookings: { $sum: 1 },
          revenue: { $sum: { $ifNull: ['$payment.amount', 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const staffPerformance = await Booking.aggregate([
      {
        $match: {
          businessId: businessObjectId,
          staffId: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$staffId',
          totalBookings: { $sum: 1 },
          completedBookings: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0],
            },
          },
          revenue: { $sum: { $ifNull: ['$payment.amount', 0] } },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'staff',
        },
      },
      {
        $unwind: {
          path: '$staff',
          preserveNullAndEmptyArrays: true,
        },
      },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      stats: {
        totalBookings,
        upcomingBookings,
        cancelledBookings,
        completedBookings,
        todayBookings,
        totalRevenue: revenueData[0]?.total || 0,
        paidBookings: revenueData[0]?.count || 0,
        staffCount,
      },
      monthlyData,
      staffPerformance,
      recentBookings,
    });
  } catch (err) {
    console.error('Admin dashboard analytics error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics.',
      error: err.message,
    });
  }
};

const getStaffDashboard = async (req, res) => {
  try {
    const staffId = req.user._id;
    const today = new Date().toISOString().split('T')[0];

    const [todayAppointments, upcomingAppointments, totalCompleted] =
      await Promise.all([
        Booking.find({
          staffId,
          date: today,
          status: { $in: ['confirmed', 'pending'] },
        })
          .populate('serviceId', 'name duration price')
          .populate('customerId', 'firstName lastName phone')
          .sort({ startTime: 1 }),

        Booking.find({
          staffId,
          date: { $gt: today },
          status: { $in: ['confirmed', 'pending'] },
        })
          .populate('serviceId', 'name duration')
          .populate('customerId', 'firstName lastName')
          .sort({ date: 1, startTime: 1 })
          .limit(10),

        Booking.countDocuments({ staffId, status: 'completed' }),
      ]);

    res.json({
      success: true,
      todayAppointments,
      upcomingAppointments,
      totalCompleted,
    });
  } catch (err) {
    console.error('Staff dashboard error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to get staff dashboard.',
      error: err.message,
    });
  }
};

module.exports = {
  getAdminDashboard,
  getStaffDashboard,
};