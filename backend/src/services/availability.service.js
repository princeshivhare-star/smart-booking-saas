const Booking = require('../models/Booking.model');
const BlockedSlot = require('../models/BlockedSlot.model');

/**
 * Generate time slots for a given business/service/staff/date
 */
const getAvailableSlots = async ({ service, business, staffId, date }) => {
  const dayName = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const dayHours = business.workingHours?.[dayName];

  if (!dayHours || !dayHours.isOpen) return [];

  const openTime  = dayHours.open  || '09:00';
  const closeTime = dayHours.close || '18:00';
  const interval  = business.settings?.bookingInterval || 30;
  const duration  = service.duration + (service.bufferTime || 0);

  // Generate all possible start times
  const allSlots = [];
  let [oh, om] = openTime.split(':').map(Number);
  const [ch, cm] = closeTime.split(':').map(Number);
  const closeMinutes = ch * 60 + cm;

  while (oh * 60 + om + duration <= closeMinutes) {
    allSlots.push(`${String(oh).padStart(2, '0')}:${String(om).padStart(2, '0')}`);
    om += interval;
    if (om >= 60) { oh++; om -= 60; }
  }

  // Fetch existing bookings
  const existingBookings = await Booking.find({
    businessId: business._id,
    date,
    status: { $in: ['pending', 'confirmed'] },
    ...(staffId && { staffId }),
  }).select('startTime endTime staffId');

  // Fetch blocked slots
  const blockedSlots = await BlockedSlot.find({
    businessId: business._id,
    date,
    ...(staffId ? { $or: [{ staffId }, { staffId: { $exists: false } }] } : {}),
  }).select('startTime endTime');

  const allBlocked = [
    ...existingBookings.map(b => ({ startTime: b.startTime, endTime: b.endTime })),
    ...blockedSlots.map(b => ({ startTime: b.startTime, endTime: b.endTime })),
  ];

  const toMinutes = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const availableSlots = allSlots.filter(slot => {
    const slotStart = toMinutes(slot);
    const slotEnd   = slotStart + duration;

    return !allBlocked.some(b => {
      const bStart = toMinutes(b.startTime);
      const bEnd   = toMinutes(b.endTime);
      return slotStart < bEnd && slotEnd > bStart;
    });
  });

  // Filter out past slots for today
  const today = new Date().toISOString().split('T')[0];
  if (date === today) {
    const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
    return availableSlots.filter(slot => toMinutes(slot) > nowMinutes);
  }

  return availableSlots;
};

module.exports = { getAvailableSlots };
