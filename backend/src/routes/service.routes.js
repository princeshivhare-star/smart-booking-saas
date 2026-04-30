const router = require('express').Router();
const { getServices, getService, createService, updateService, deleteService } = require('../controllers/service.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.get('/', getServices);
router.get('/:id', getService);
router.post('/', authenticate, authorize('admin'), createService);
router.put('/:id', authenticate, authorize('admin'), updateService);
router.delete('/:id', authenticate, authorize('admin'), deleteService);

module.exports = router;
