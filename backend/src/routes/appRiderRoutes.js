const express = require('express');
const router = express.Router();
const appRiderController = require('../controllers/appRiderController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const adminOnly = authorize(['admin', 'superadmin']);

// Collection-level routes (must be before :id routes)
router.get('/earnings/all', appRiderController.getRiderEarnings);
router.get('/payouts/all', appRiderController.getRiderPayouts);

// Approval queue
router.get('/pending', authenticate, adminOnly, appRiderController.getPendingRiders);
router.patch('/:id/approve', authenticate, adminOnly, appRiderController.approveRider);
router.patch('/:id/reject', authenticate, adminOnly, appRiderController.rejectRider);

// Get all riders
router.get('/', appRiderController.getRiders);
router.post('/', appRiderController.createRider);
router.delete('/:riderId', appRiderController.deleteRider);

// ID-specific routes (after collection routes)
router.get('/:id', appRiderController.getRiderById);
router.get('/:id/earnings', appRiderController.getRiderEarnings);
router.get('/:id/payouts', appRiderController.getRiderPayouts);
router.get('/:id/earnings-summary', appRiderController.getEarningsSummary);

module.exports = router;