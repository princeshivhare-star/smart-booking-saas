const router = require('express').Router();
const express = require('express');
const { createPaymentIntent, handleWebhook, markAsPaid, getPaymentHistory } = require('../controllers/payment.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Stripe webhook needs raw body
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

router.post('/intent', authenticate, createPaymentIntent);
router.put('/:bookingId/mark-paid', authenticate, authorize('admin', 'staff'), markAsPaid);
router.get('/history', authenticate, getPaymentHistory);

module.exports = router;
