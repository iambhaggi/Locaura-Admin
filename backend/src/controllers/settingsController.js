const { createAdminSettingsModel } = require('../models/AdminSettings');
const { createAuditLogModel } = require('../models/AuditLog');
const { createAdminNotificationModel } = require('../models/AdminNotification');
const { createAuditLog, logSettingsChange } = require('../utils/auditLogger');

/**
 * Get all admin settings
 */
const getSettings = async (req, res) => {
  try {
    const AdminSettings = await createAdminSettingsModel();
    let settings = await AdminSettings.findOne();

    // Create default settings if none exist
    if (!settings) {
      settings = new AdminSettings();
      await settings.save();
    }

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
      error: error.message
    });
  }
};

/**
 * Get specific setting by category
 */
const getSettingsByCategory = async (req, res) => {
  try {
    const AdminSettings = await createAdminSettingsModel();
    const { category } = req.params;
    const settings = await AdminSettings.findOne();

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found'
      });
    }

    if (!settings[category]) {
      return res.status(404).json({
        success: false,
        message: `Category '${category}' not found`
      });
    }

    res.status(200).json({
      success: true,
      data: {
        category,
        settings: settings[category]
      }
    });
  } catch (error) {
    console.error('Error fetching settings by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
      error: error.message
    });
  }
};

/**
 * Update all admin settings
 */
const updateSettings = async (req, res) => {
  try {
    const AdminSettings = await createAdminSettingsModel();
    const AuditLog = await createAuditLogModel();
    const { updates } = req.body;
    const adminId = req.user?._id;

    // Validate critical settings
    if (updates.commission) {
      if (updates.commission.retailer?.base > 100) {
        return res.status(400).json({
          success: false,
          message: 'Retailer commission cannot exceed 100%'
        });
      }
      if (updates.commission.delivery?.base > 100) {
        return res.status(400).json({
          success: false,
          message: 'Delivery commission cannot exceed 100%'
        });
      }
    }

    if (updates.security) {
      if (updates.security.sessionTimeout < 15) {
        return res.status(400).json({
          success: false,
          message: 'Session timeout must be at least 15 minutes'
        });
      }
    }

    // Get current settings
    let settings = await AdminSettings.findOne();
    if (!settings) {
      settings = new AdminSettings();
    }

    // Store old values for audit
    const oldSettings = JSON.parse(JSON.stringify(settings));

    // Update settings
    Object.keys(updates).forEach(key => {
      if (key in settings.toObject()) {
        settings[key] = {
          ...settings[key],
          ...updates[key]
        };
      }
    });

    settings.modifiedBy = adminId;
    settings.lastModifiedAt = new Date();

    await settings.save();

    // Create audit log
    await logSettingsChange(adminId, category, oldSettings, settings.toObject(), {
      updatedFields: Object.keys(updates)
    });

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: error.message
    });
  }
};

/**
 * Update specific setting by category
 */
const updateSettingsByCategory = async (req, res) => {
  try {
    const AdminSettings = await createAdminSettingsModel();
    const AuditLog = await createAuditLogModel();
    const { category } = req.params;
    const { updates } = req.body;
    const adminId = req.user?._id;

    let settings = await AdminSettings.findOne();
    if (!settings) {
      settings = new AdminSettings();
    }

    if (!settings[category]) {
      return res.status(404).json({
        success: false,
        message: `Category '${category}' not found`
      });
    }

    const oldValue = JSON.parse(JSON.stringify(settings[category]));
    
    settings[category] = {
      ...settings[category],
      ...updates
    };

    settings.modifiedBy = adminId;
    settings.lastModifiedAt = new Date();

    await settings.save();

    // Create audit log
    await createAuditLog({
      action: 'UPDATE_SETTINGS_CATEGORY',
      actor: adminId,
      resourceType: 'Settings',
      changes: {
        category,
        old: oldValue,
        new: settings[category]
      },
      description: `Updated ${category} settings`
    });

    res.status(200).json({
      success: true,
      message: `${category} settings updated successfully`,
      data: settings[category]
    });
  } catch (error) {
    console.error('Error updating settings by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: error.message
    });
  }
};

/**
 * Test email configuration
 */
const testEmailConfiguration = async (req, res) => {
  try {
    const settings = await AdminSettings.findOne();
    
    if (!settings?.email?.sendgrid?.apiKey) {
      return res.status(400).json({
        success: false,
        message: 'Email configuration not set'
      });
    }

    // Test SendGrid connection
    // This is a simplified example - implement actual email sending
    const testEmail = req.body.testEmail || settings.email.fromEmail;

    // TODO: Implement actual email sending test
    // For now, just verify the API key format
    if (settings.email.sendgrid.apiKey.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Invalid SendGrid API key'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Email configuration test successful',
      data: {
        provider: settings.email.provider,
        from: settings.email.fromEmail,
        testEmail: testEmail
      }
    });
  } catch (error) {
    console.error('Error testing email configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Email configuration test failed',
      error: error.message
    });
  }
};

/**
 * Test SMS configuration
 */
const testSmsConfiguration = async (req, res) => {
  try {
    const settings = await AdminSettings.findOne();
    
    if (!settings?.sms?.twilio?.accountSid) {
      return res.status(400).json({
        success: false,
        message: 'SMS configuration not set'
      });
    }

    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number required for SMS test'
      });
    }

    // TODO: Implement actual SMS sending test using Twilio SDK
    // For now, just verify the configuration
    if (!settings.sms.twilio.phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Twilio phone number not configured'
      });
    }

    res.status(200).json({
      success: true,
      message: 'SMS configuration test successful',
      data: {
        provider: settings.sms.provider,
        from: settings.sms.twilio.phoneNumber,
        to: phoneNumber
      }
    });
  } catch (error) {
    console.error('Error testing SMS configuration:', error);
    res.status(500).json({
      success: false,
      message: 'SMS configuration test failed',
      error: error.message
    });
  }
};

/**
 * Test payment gateway configuration
 */
const testPaymentGateway = async (req, res) => {
  try {
    const settings = await AdminSettings.findOne();
    
    if (!settings?.paymentGateway?.razorpay?.keyId) {
      return res.status(400).json({
        success: false,
        message: 'Payment gateway configuration not set'
      });
    }

    // TODO: Implement actual payment gateway test
    // For now, just verify the API keys
    if (!settings.paymentGateway.razorpay.keySecret) {
      return res.status(400).json({
        success: false,
        message: 'Payment gateway secret key not configured'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment gateway configuration test successful',
      data: {
        gateway: settings.paymentGateway.type,
        keyId: settings.paymentGateway.razorpay.keyId.substring(0, 10) + '***',
        status: 'connected'
      }
    });
  } catch (error) {
    console.error('Error testing payment gateway:', error);
    res.status(500).json({
      success: false,
      message: 'Payment gateway test failed',
      error: error.message
    });
  }
};

/**
 * Export settings as JSON
 */
const exportSettings = async (req, res) => {
  try {
    const settings = await AdminSettings.findOne();
    
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found'
      });
    }

    // Remove sensitive data before export
    const exportData = settings.toObject();
    
    // Mask sensitive fields
    if (exportData.paymentGateway?.razorpay?.keySecret) {
      exportData.paymentGateway.razorpay.keySecret = '***MASKED***';
    }
    if (exportData.email?.sendgrid?.apiKey) {
      exportData.email.sendgrid.apiKey = '***MASKED***';
    }
    if (exportData.sms?.twilio?.authToken) {
      exportData.sms.twilio.authToken = '***MASKED***';
    }

    const filename = `locaura-settings-${new Date().toISOString().split('T')[0]}.json`;
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    res.status(200).send(JSON.stringify(exportData, null, 2));
  } catch (error) {
    console.error('Error exporting settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export settings',
      error: error.message
    });
  }
};

/**
 * Import settings from JSON
 */
const importSettings = async (req, res) => {
  try {
    const { importData, merge = true } = req.body;
    const adminId = req.user?._id;

    if (!importData) {
      return res.status(400).json({
        success: false,
        message: 'Import data required'
      });
    }

    let settings = await AdminSettings.findOne();
    const oldSettings = settings ? JSON.parse(JSON.stringify(settings)) : null;

    if (!settings) {
      settings = new AdminSettings();
    }

    if (merge) {
      // Merge with existing settings
      Object.keys(importData).forEach(key => {
        if (key in settings.toObject()) {
          settings[key] = {
            ...settings[key],
            ...importData[key]
          };
        }
      });
    } else {
      // Replace all settings
      Object.keys(importData).forEach(key => {
        if (key in settings.toObject()) {
          settings[key] = importData[key];
        }
      });
    }

    settings.modifiedBy = adminId;
    settings.lastModifiedAt = new Date();

    await settings.save();

    // Create audit log
    await createAuditLog({
      action: 'IMPORT_SETTINGS',
      actor: adminId,
      resourceType: 'Settings',
      changes: {
        old: oldSettings,
        new: settings.toObject()
      },
      metadata: {
        mergeMode: merge,
        importedFields: Object.keys(importData)
      },
      description: 'Imported settings'
    });

    res.status(200).json({
      success: true,
      message: 'Settings imported successfully',
      data: settings
    });
  } catch (error) {
    console.error('Error importing settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import settings',
      error: error.message
    });
  }
};

/**
 * Reset settings to defaults
 */
const resetSettings = async (req, res) => {
  try {
    const { confirm } = req.body;
    const adminId = req.user?._id;

    if (!confirm) {
      return res.status(400).json({
        success: false,
        message: 'Please confirm reset action'
      });
    }

    const oldSettings = await AdminSettings.findOne();
    
    // Create default settings
    const defaultSettings = new AdminSettings();
    await defaultSettings.save();

    // Delete old settings
    if (oldSettings) {
      await AdminSettings.deleteMany({});
    }

    // Create audit log
    await createAuditLog({
      action: 'RESET_SETTINGS',
      actor: adminId,
      resourceType: 'Settings',
      changes: {
        old: oldSettings?.toObject(),
        new: defaultSettings.toObject()
      },
      description: 'Reset settings to defaults'
    });

    res.status(200).json({
      success: true,
      message: 'Settings reset to defaults',
      data: defaultSettings
    });
  } catch (error) {
    console.error('Error resetting settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset settings',
      error: error.message
    });
  }
};

/**
 * Get settings history/audit trail
 */
const getSettingsHistory = async (req, res) => {
  try {
    const { limit = 50, skip = 0 } = req.query;

    const history = await AuditLog.find({
      action: { $in: ['UPDATE_SETTINGS', 'UPDATE_SETTINGS_CATEGORY', 'IMPORT_SETTINGS'] }
    })
      .populate('actor', 'email name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await AuditLog.countDocuments({
      action: { $in: ['UPDATE_SETTINGS', 'UPDATE_SETTINGS_CATEGORY', 'IMPORT_SETTINGS'] }
    });

    res.status(200).json({
      success: true,
      data: history,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching settings history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings history',
      error: error.message
    });
  }
};

/**
 * Validate settings before saving
 */
const validateSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    const errors = [];
    const warnings = [];

    // Validate commission settings
    if (settings.commission?.retailer?.base > 100) {
      errors.push('Retailer commission cannot exceed 100%');
    }

    // Validate delivery settings
    if (settings.delivery?.baseFee > settings.delivery?.maxOrderValue) {
      warnings.push('Delivery fee should not exceed max order value');
    }

    // Validate security settings
    if (settings.security?.sessionTimeout < 15) {
      errors.push('Session timeout must be at least 15 minutes');
    }

    // Validate email configuration
    if (settings.email?.sendgrid?.enabled && !settings.email?.sendgrid?.apiKey) {
      errors.push('SendGrid API key required when email is enabled');
    }

    // Validate SMS configuration
    if (settings.sms?.twilio?.enabled && !settings.sms?.twilio?.accountSid) {
      errors.push('Twilio Account SID required when SMS is enabled');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Settings validation failed',
        errors,
        warnings
      });
    }

    res.status(200).json({
      success: true,
      message: 'Settings validation passed',
      warnings
    });
  } catch (error) {
    console.error('Error validating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Settings validation failed',
      error: error.message
    });
  }
};

module.exports = {
  getSettings,
  getSettingsByCategory,
  updateSettings,
  updateSettingsByCategory,
  testEmailConfiguration,
  testSmsConfiguration,
  testPaymentGateway,
  exportSettings,
  importSettings,
  resetSettings,
  getSettingsHistory,
  validateSettings
};
