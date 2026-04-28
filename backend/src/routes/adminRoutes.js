const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const appDataController = require('../controllers/appDataController');
const appRiderController = require('../controllers/appRiderController');

const adminOnly = authorize(['admin', 'super_admin']);

// Admin store routes
router.get('/stores', authenticate, adminOnly, appDataController.getStores);
router.get('/stores/pending', authenticate, adminOnly, appDataController.getPendingStores);
router.patch('/stores/:storeId/status', authenticate, adminOnly, appDataController.approveStore);

// Admin rider approval route alias
router.get('/riders', authenticate, adminOnly, appRiderController.getRiders);
router.get('/riders/pending', authenticate, adminOnly, appRiderController.getPendingRiders);
router.patch('/riders/:id/status', authenticate, adminOnly, async (req, res, next) => {
  const status = String(req.body?.status || '').trim().toLowerCase();

  if (status === 'active' || status === 'approved') {
    return appRiderController.approveRider(req, res, next);
  }

  if (status === 'rejected' || status === 'reject') {
    return appRiderController.rejectRider(req, res, next);
  }

  return res.status(400).json({ success: false, message: 'Invalid status value. Use "active" or "rejected".' });
});

module.exports = router;
