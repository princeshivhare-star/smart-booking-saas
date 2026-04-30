const router = require('express').Router();
const { getAdminDashboard, getStaffDashboard } = require('../controllers/analytics.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.get('/admin', authenticate, authorize('admin'), getAdminDashboard);
router.get('/staff', authenticate, authorize('staff', 'admin'), getStaffDashboard);

module.exports = router;
