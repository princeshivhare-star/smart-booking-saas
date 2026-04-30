// schedule.routes.js
const router = require('express').Router();
const { getBlockedSlots, createBlockedSlot, deleteBlockedSlot } = require('../controllers/schedule.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.get('/blocked', getBlockedSlots);
router.post('/blocked', authenticate, authorize('admin', 'staff'), createBlockedSlot);
router.delete('/blocked/:id', authenticate, authorize('admin', 'staff'), deleteBlockedSlot);

module.exports = router;
