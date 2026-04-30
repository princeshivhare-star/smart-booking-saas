// business.routes.js
const router = require('express').Router();
const {
  getBusinesses, getBusiness, getMyBusiness,
  updateBusiness, getBusinessStaff, addStaff, removeStaff,
} = require('../controllers/business.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.get('/', getBusinesses);
router.get('/mine', authenticate, authorize('admin'), getMyBusiness);
router.get('/:id', getBusiness);
router.put('/:id', authenticate, authorize('admin'), updateBusiness);
router.get('/:businessId/staff', getBusinessStaff);
router.post('/staff', authenticate, authorize('admin'), addStaff);
router.delete('/staff/:staffId', authenticate, authorize('admin'), removeStaff);

module.exports = router;
