const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const settingsController = require('../controllers/settingsController');

// Middleware to ensure only admins can access settings
const adminOnly = authorize(['admin', 'super_admin']);

/**
 * @route   GET /api/settings
 * @desc    Get all admin settings
 * @access  Admin
 */
router.get('/', authenticate, adminOnly, settingsController.getSettings);

/**
 * @route   GET /api/settings/:category
 * @desc    Get settings by category
 * @access  Admin
 */
router.get('/:category', authenticate, adminOnly, settingsController.getSettingsByCategory);

/**
 * @route   PUT /api/settings
 * @desc    Update all admin settings
 * @access  Super Admin
 */
router.put('/', authenticate, authorize(['super_admin']), settingsController.updateSettings);

/**
 * @route   PUT /api/settings/:category
 * @desc    Update settings by category
 * @access  Super Admin
 */
router.put('/:category', authenticate, authorize(['super_admin']), settingsController.updateSettingsByCategory);

/**
 * @route   POST /api/settings/test/email
 * @desc    Test email configuration
 * @access  Super Admin
 */
router.post('/test/email', authenticate, authorize(['super_admin']), settingsController.testEmailConfiguration);

/**
 * @route   POST /api/settings/test/sms
 * @desc    Test SMS configuration
 * @access  Super Admin
 */
router.post('/test/sms', authenticate, authorize(['super_admin']), settingsController.testSmsConfiguration);

/**
 * @route   POST /api/settings/test/payment
 * @desc    Test payment gateway configuration
 * @access  Super Admin
 */
router.post('/test/payment', authenticate, authorize(['super_admin']), settingsController.testPaymentGateway);

/**
 * @route   GET /api/settings/export
 * @desc    Export settings as JSON
 * @access  Admin
 */
router.get('/export', authenticate, adminOnly, settingsController.exportSettings);

/**
 * @route   POST /api/settings/import
 * @desc    Import settings from JSON
 * @access  Super Admin
 */
router.post('/import', authenticate, authorize(['super_admin']), settingsController.importSettings);

/**
 * @route   POST /api/settings/reset
 * @desc    Reset settings to defaults
 * @access  Super Admin
 */
router.post('/reset', authenticate, authorize(['super_admin']), settingsController.resetSettings);

/**
 * @route   GET /api/settings/history
 * @desc    Get settings change history
 * @access  Admin
 */
router.get('/history', authenticate, adminOnly, settingsController.getSettingsHistory);

/**
 * @route   POST /api/settings/validate
 * @desc    Validate settings before saving
 * @access  Admin
 */
router.post('/validate', authenticate, adminOnly, settingsController.validateSettings);

module.exports = router;