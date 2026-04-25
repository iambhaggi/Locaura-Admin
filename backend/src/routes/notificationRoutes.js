const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/authMiddleware');

// Send offer to users
router.post('/send-offer', auth, notificationController.sendOffer);

// Get all notifications
router.get('/', auth, notificationController.getNotifications);

// Get notification statistics
router.get('/stats', auth, notificationController.getNotificationStats);

// Send test notification
router.post('/test', auth, notificationController.sendTestNotification);

// Delete old notifications
router.delete('/cleanup', auth, notificationController.deleteOldNotifications);

module.exports = router;
