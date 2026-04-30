const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;
const Booking = require('../models/Booking.model');

// POST /api/payments/intent - Create a Stripe payment intent
const createPaymentIntent = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ success: false, message: 'Payment service not configured. Please add STRIPE_SECRET_KEY.' });
    }

    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId).populate('serviceId', 'name price currency');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    if (booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    if (booking.payment.status === 'paid') {
      return res.status(400).json({ success: false, message: 'Already paid.' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.payment.amount * 100), // in cents
      currency: (booking.payment.currency || 'USD').toLowerCase(),
      metadata: {
        bookingId: booking._id.toString(),
        bookingRef: booking.bookingRef,
        customerId: req.user._id.toString(),
      },
    });

    booking.payment.stripePaymentIntentId = paymentIntent.id;
    booking.payment.method = 'online';
    await booking.save();

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create payment intent.', error: err.message });
  }
};

// POST /api/payments/webhook - Stripe webhook handler
const handleWebhook = async (req, res) => {
  try {
    if (!stripe) return res.status(200).json({ received: true });

    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      await Booking.findOneAndUpdate(
        { 'payment.stripePaymentIntentId': paymentIntent.id },
        { 'payment.status': 'paid', 'payment.paidAt': new Date(), status: 'confirmed' }
      );
    }

    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object;
      await Booking.findOneAndUpdate(
        { 'payment.stripePaymentIntentId': paymentIntent.id },
        { 'payment.status': 'failed' }
      );
    }

    res.json({ received: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Webhook handler failed.' });
  }
};

// PUT /api/payments/:bookingId/mark-paid (admin/staff)
const markAsPaid = async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.bookingId, businessId: req.user.businessId },
      { 'payment.status': 'paid', 'payment.paidAt': new Date(), 'payment.method': 'at_location' },
      { new: true }
    );
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    res.json({ success: true, message: 'Marked as paid.', booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Update failed.' });
  }
};

// GET /api/payments/history (customer)
const getPaymentHistory = async (req, res) => {
  try {
    const bookings = await Booking.find({
      customerId: req.user._id,
      'payment.status': 'paid',
    })
      .populate('serviceId', 'name')
      .populate('businessId', 'name')
      .sort({ 'payment.paidAt': -1 });

    res.json({ success: true, payments: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch payment history.' });
  }
};

module.exports = { createPaymentIntent, handleWebhook, markAsPaid, getPaymentHistory };
