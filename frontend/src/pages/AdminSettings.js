import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Container,
  Paper,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Notifications,
  Security,
  Payment,
  LocalShipping,
  Store,
  Save,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  RestartAlt as RestartIcon,
  ChevronRight,
} from '@mui/icons-material';

// Settings Categories
const SETTINGS_CATEGORIES = {
  general: {
    title: 'General Settings',
    icon: SettingsIcon,
    color: '#6366f1',
  },
  commission: {
    title: 'Commission & Pricing',
    icon: Payment,
    color: '#10b981',
  },
  delivery: {
    title: 'Delivery Settings',
    icon: LocalShipping,
    color: '#f59e0b',
  },
  payment: {
    title: 'Payment Gateway',
    icon: Payment,
    color: '#3b82f6',
  },
  email: {
    title: 'Email Configuration',
    icon: SettingsIcon,
    color: '#8b5cf6',
  },
  sms: {
    title: 'SMS Configuration',
    icon: SettingsIcon,
    color: '#ec4899',
  },
  notifications: {
    title: 'Notifications',
    icon: Notifications,
    color: '#f97316',
  },
  security: {
    title: 'Security & Access',
    icon: Security,
    color: '#ef4444',
  },
  kyc: {
    title: 'KYC & Verification',
    icon: SettingsIcon,
    color: '#06b6d4',
  },
  products: {
    title: 'Products & Categories',
    icon: Store,
    color: '#14b8a6',
  },
  compliance: {
    title: 'Compliance & Legal',
    icon: SettingsIcon,
    color: '#6b7280',
  },
  analytics: {
    title: 'Analytics & Reporting',
    icon: SettingsIcon,
    color: '#8b5cf6',
  },
  marketing: {
    title: 'Marketing & Promotions',
    icon: SettingsIcon,
    color: '#ec4899',
  },
  support: {
    title: 'Support & Customer Service',
    icon: SettingsIcon,
    color: '#06b6d4',
  },
  audit: {
    title: 'Audit & Compliance',
    icon: SettingsIcon,
    color: '#6b7280',
  },
  recovery: {
    title: 'Disaster Recovery',
    icon: SettingsIcon,
    color: '#ef4444',
  },
};

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

function EnhancedAdminSettings() {
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState({});
  const [loading, setLoading] = useState(false);
  const [savingCategory, setSavingCategory] = useState(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [initialSettings, setInitialSettings] = useState(null);

  const [settings, setSettings] = useState({
    // General Settings
    platformName: 'Locaura',
    platformLogo: 'https://locaura.com/logo.png',
    platformDescription: 'On-demand delivery platform',
    website: 'https://locaura.com',
    supportEmail: 'support@locaura.com',
    supportPhone: '+91 9876543210',
    officeAddress: 'Bangalore, India',

    // Commission Settings
    retailerCommission: 10,
    deliveryCommission: 15,
    platformFee: 5,
    taxRate: 18,
    discountCap: 50,

    // Delivery Settings
    deliveryRadius: 25,
    maxDeliveryDistance: 50,
    deliveryFee: 50,
    freeDeliveryThreshold: 500,
    standardDeliveryTime: 45,
    expressDeliveryTime: 20,
    peakHourSurcharge: 10,

    // Payment Gateway
    paymentGateway: 'razorpay',
    razorpayKey: 'rzp_live_XXXXXXXXXXX',
    razorpaySecret: 'xxxxxxxxxxxxxxxxxxx',
    enableCOD: true,
    enableUPI: true,
    enableCards: true,
    enableWallet: true,

    // Email Configuration
    emailProvider: 'sendgrid',
    sendgridApiKey: 'SG.XXXXXXXXXXXXXXXXXXXXX',
    emailFrom: 'noreply@locaura.com',
    emailFromName: 'Locaura',

    // SMS Configuration
    smsProvider: 'twilio',
    twilioAccountSid: 'ACxxxxxxxxxxxxxxxxxxxxxxxx',
    twilioAuthToken: 'xxxxxxxxxxxxxxxxxxxxxxxx',
    twilioPhoneNumber: '+1234567890',

    // Notification Settings
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    maxNotificationsPerDay: 5,

    // Security Settings
    twoFactorAuth: true,
    sessionTimeout: 30,
    passwordExpiry: 90,
    maxLoginAttempts: 5,
    apiRateLimit: 1000,
    enableIpWhitelist: false,

    // KYC Settings
    requireRetailerPan: true,
    requireRetailerGst: true,
    requireRiderAadhaar: true,
    requireRiderLicense: true,
    licenseRenewalReminder: 30,

    // Product Settings
    autoProductApproval: false,
    productApprovalLevel: 'manual',
    minProductDescLength: 50,
    minProductImages: 3,
    maxProductImages: 10,

    // Compliance Settings
    gdprCompliance: true,
    ccpaCompliance: false,
    dataLocalization: true,
    privacyPolicyUrl: 'https://locaura.com/privacy',
    termsConditionsUrl: 'https://locaura.com/terms',

    // Analytics Settings
    enableRealTimeAnalytics: true,
    analyticsUpdateInterval: 5,
    dataRetentionDays: 365,

    // Marketing Settings
    maxActivePromotions: 50,
    maxDiscountPercent: 80,
    maxCouponUsage: 1000,
    firstOrderDiscount: 20,

    // Support Settings
    enableEmailSupport: true,
    enableChatSupport: true,
    enablePhoneSupport: true,
    slaResponseTime: 2,
    slaResolutionTime: 24,

    // Audit Settings
    enableAuditLogging: true,
    auditLogRetention: 365,

    // Disaster Recovery
    autoBackup: true,
    backupFrequency: 'daily',
    backupRetention: 30,
    enableCrossRegionBackup: true,
    rto: 60,
    rpo: 15,
  });

  // Fetch settings from backend on mount
  useEffect(() => {
    fetchSettingsFromBackend();
  }, []);

  const fetchSettingsFromBackend = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const token = localStorage.getItem('token');
      
      if (!token) {
        setErrorMessage('Authentication token not found. Please login again.');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch settings: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        // Map backend data to frontend state
        const mappedSettings = mapBackendToFrontend(data.data);
        setSettings(mappedSettings);
        setInitialSettings(mappedSettings);
        setSuccessMessage('✓ Settings loaded successfully!');
        setTimeout(() => setSuccessMessage(''), 2000);
      } else {
        throw new Error(data.message || 'Failed to load settings');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setErrorMessage(`Error loading settings: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const mapBackendToFrontend = (data) => {
    return {
      platformName: data.platformName || '',
      platformLogo: data.platformLogo || '',
      platformDescription: data.platformDescription || '',
      website: data.website || '',
      supportEmail: data.supportEmail || '',
      supportPhone: data.supportPhone || '',
      officeAddress: data.officeAddress || '',
      retailerCommission: data.commission?.retailer?.base || 10,
      deliveryCommission: data.commission?.delivery?.base || 15,
      platformFee: data.commission?.platform || 5,
      taxRate: data.commission?.taxRate || 18,
      discountCap: data.commission?.maxDiscount || 50,
      deliveryRadius: data.delivery?.baseRadius || 25,
      maxDeliveryDistance: data.delivery?.maxDistance || 50,
      deliveryFee: data.delivery?.baseFee || 50,
      freeDeliveryThreshold: data.delivery?.freeDeliveryThreshold || 500,
      standardDeliveryTime: data.delivery?.standardTime || 45,
      expressDeliveryTime: data.delivery?.expressTime || 20,
      peakHourSurcharge: data.delivery?.peakHourSurcharge || 10,
      paymentGateway: data.paymentGateway?.type || 'razorpay',
      razorpayKey: data.paymentGateway?.razorpay?.keyId || '',
      razorpaySecret: data.paymentGateway?.razorpay?.keySecret || '',
      enableCOD: data.paymentGateway?.paymentMethods?.cod ?? true,
      enableUPI: data.paymentGateway?.paymentMethods?.upi ?? true,
      enableCards: data.paymentGateway?.paymentMethods?.creditDebit ?? true,
      enableWallet: data.paymentGateway?.paymentMethods?.wallet ?? true,
      emailProvider: data.email?.provider || 'sendgrid',
      sendgridApiKey: data.email?.sendgrid?.apiKey || '',
      emailFrom: data.email?.fromEmail || '',
      emailFromName: data.email?.fromName || '',
      smsProvider: data.sms?.provider || 'twilio',
      twilioAccountSid: data.sms?.twilio?.accountSid || '',
      twilioAuthToken: data.sms?.twilio?.authToken || '',
      twilioPhoneNumber: data.sms?.twilio?.phoneNumber || '',
      emailNotifications: data.notifications?.email ?? true,
      smsNotifications: data.notifications?.sms ?? true,
      pushNotifications: data.notifications?.push ?? true,
      quietHoursStart: data.notifications?.quietHoursStart || '22:00',
      quietHoursEnd: data.notifications?.quietHoursEnd || '07:00',
      maxNotificationsPerDay: data.notifications?.maxPerDay || 5,
      twoFactorAuth: data.security?.twoFactorAuth ?? true,
      sessionTimeout: data.security?.sessionTimeout || 30,
      passwordExpiry: data.security?.passwordExpiry || 90,
      maxLoginAttempts: data.security?.maxLoginAttempts || 5,
      apiRateLimit: data.security?.apiRateLimit || 1000,
      enableIpWhitelist: data.security?.ipWhitelistEnabled ?? false,
      requireRetailerPan: data.kyc?.retailer?.requirePan ?? true,
      requireRetailerGst: data.kyc?.retailer?.requireGst ?? true,
      requireRiderAadhaar: data.kyc?.rider?.requireAadhaar ?? true,
      requireRiderLicense: data.kyc?.rider?.requireDrivingLicense ?? true,
      licenseRenewalReminder: data.kyc?.rider?.licenseRenewalReminder || 30,
      autoProductApproval: data.products?.autoApproval ?? false,
      productApprovalLevel: data.products?.approvalLevel || 'manual',
      minProductDescLength: data.products?.minDescriptionLength || 50,
      minProductImages: data.products?.minImagesRequired || 3,
      maxProductImages: data.products?.maxImagesAllowed || 10,
      gdprCompliance: data.compliance?.gdprCompliance ?? true,
      ccpaCompliance: data.compliance?.ccpaCompliance ?? false,
      dataLocalization: data.compliance?.dataLocalization ?? true,
      privacyPolicyUrl: data.compliance?.privacyPolicyUrl || '',
      termsConditionsUrl: data.compliance?.termsConditionsUrl || '',
      enableRealTimeAnalytics: data.analytics?.realTimeAnalyticsEnabled ?? true,
      analyticsUpdateInterval: data.analytics?.analyticsUpdateInterval || 5,
      dataRetentionDays: data.analytics?.dataRetentionDays || 365,
      maxActivePromotions: data.marketing?.maxActivePromotions || 50,
      maxDiscountPercent: data.marketing?.maxDiscountPercent || 80,
      maxCouponUsage: data.marketing?.maxCouponUsage || 1000,
      firstOrderDiscount: data.marketing?.firstOrderDiscount || 20,
      enableEmailSupport: data.support?.emailSupportEnabled ?? true,
      enableChatSupport: data.support?.chatSupportEnabled ?? true,
      enablePhoneSupport: data.support?.phoneSupportEnabled ?? true,
      slaResponseTime: data.support?.slaResponseTime || 2,
      slaResolutionTime: data.support?.slaResolutionTime || 24,
      enableAuditLogging: data.audit?.auditLoggingEnabled ?? true,
      auditLogRetention: data.audit?.auditLogRetention || 365,
      autoBackup: data.disasterRecovery?.autoBackupEnabled ?? true,
      backupFrequency: data.disasterRecovery?.backupFrequency || 'daily',
      backupRetention: data.disasterRecovery?.backupRetention || 30,
      enableCrossRegionBackup: data.disasterRecovery?.crossRegionBackupEnabled ?? true,
      rto: data.disasterRecovery?.rto || 60,
      rpo: data.disasterRecovery?.rpo || 15,
    };
  };

  const getChangedFields = (category) => {
    // Get the fields that belong to this category and check if they've changed
    const categoryFields = settingsSections.find(s => s.category === category)?.fields || [];
    const changes = {};

    categoryFields.forEach(field => {
      if (settings[field.key] !== initialSettings?.[field.key]) {
        changes[field.key] = settings[field.key];
      }
    });

    return changes;
  };

  const mapFrontendToBackend = (category, changes) => {
    const updates = {};

    switch(category) {
      case 'general':
        updates.platformName = changes.platformName;
        updates.platformLogo = changes.platformLogo;
        updates.website = changes.website;
        updates.supportEmail = changes.supportEmail;
        updates.supportPhone = changes.supportPhone;
        break;
      case 'commission':
        updates.commission = {
          retailer: { base: changes.retailerCommission },
          delivery: { base: changes.deliveryCommission },
          platform: changes.platformFee,
          taxRate: changes.taxRate,
        };
        break;
      case 'delivery':
        updates.delivery = {
          baseRadius: changes.deliveryRadius,
          maxDistance: changes.maxDeliveryDistance,
          baseFee: changes.deliveryFee,
          freeDeliveryThreshold: changes.freeDeliveryThreshold,
          standardTime: changes.standardDeliveryTime,
          expressTime: changes.expressDeliveryTime,
          peakHourSurcharge: changes.peakHourSurcharge,
        };
        break;
      case 'payment':
        updates.paymentGateway = {
          type: changes.paymentGateway,
          razorpay: {
            keyId: changes.razorpayKey,
            keySecret: changes.razorpaySecret,
          },
          paymentMethods: {
            cod: changes.enableCOD,
            upi: changes.enableUPI,
            creditDebit: changes.enableCards,
            wallet: changes.enableWallet,
          }
        };
        break;
      case 'email':
        updates.email = {
          provider: changes.emailProvider,
          sendgrid: {
            apiKey: changes.sendgridApiKey,
          },
          fromEmail: changes.emailFrom,
          fromName: changes.emailFromName,
        };
        break;
      case 'sms':
        updates.sms = {
          provider: changes.smsProvider,
          twilio: {
            accountSid: changes.twilioAccountSid,
            authToken: changes.twilioAuthToken,
            phoneNumber: changes.twilioPhoneNumber,
          }
        };
        break;
      case 'security':
        updates.security = {
          twoFactorAuth: changes.twoFactorAuth,
          sessionTimeout: changes.sessionTimeout,
          passwordExpiry: changes.passwordExpiry,
          maxLoginAttempts: changes.maxLoginAttempts,
          apiRateLimit: changes.apiRateLimit,
          ipWhitelistEnabled: changes.enableIpWhitelist,
        };
        break;
      default:
        return changes;
    }

    return updates;
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSavingCategory(selectedCategory);
      setErrorMessage('');

      const currentCategory = selectedCategory;
      const changedFields = getChangedFields(currentCategory);

      if (Object.keys(changedFields).length === 0) {
        setErrorMessage('No changes to save');
        setSavingCategory(null);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setErrorMessage('Authentication token not found');
        setSavingCategory(null);
        return;
      }

      const updates = mapFrontendToBackend(currentCategory, changedFields);

      const response = await fetch(`${API_BASE_URL}/settings/${currentCategory}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updates }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save settings');
      }

      if (data.success) {
        setSuccessMessage(`✓ ${SETTINGS_CATEGORIES[currentCategory].title} updated successfully!`);
        // Update initial settings to reflect saved state
        const updatedSettings = { ...settings };
        setInitialSettings(updatedSettings);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error(data.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setErrorMessage(`Error: ${error.message}`);
    } finally {
      setSavingCategory(null);
    }
  };

  const handleReset = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const token = localStorage.getItem('token');

      if (!token) {
        setErrorMessage('Authentication token not found');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/settings/reset`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirm: true }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset settings');
      }

      if (data.success) {
        fetchSettingsFromBackend();
        setSuccessMessage('✓ Settings reset to defaults');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error resetting settings:', error);
      setErrorMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
      setResetConfirmOpen(false);
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setErrorMessage('Authentication token not found');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/settings/export`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export settings');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `locaura-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setSuccessMessage('✓ Settings exported successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error exporting settings:', error);
      setErrorMessage(`Error: ${error.message}`);
    }
  };

  const renderSettingField = (field) => {
    const { key, label, type, options, helperText } = field;
    const value = settings[key];

    if (type === 'toggle') {
      return (
        <FormControlLabel
          control={
            <Switch
              checked={value}
              onChange={(e) => handleInputChange(key, e.target.checked)}
            />
          }
          label={label}
        />
      );
    }

    if (type === 'select') {
      return (
        <Select
          fullWidth
          value={value}
          onChange={(e) => handleInputChange(key, e.target.value)}
          size="small"
        >
          {options.map(opt => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      );
    }

    if (type === 'password') {
      return (
        <TextField
          fullWidth
          type={showPassword[key] ? 'text' : 'password'}
          label={label}
          value={value}
          onChange={(e) => handleInputChange(key, e.target.value)}
          size="small"
          helperText={helperText}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(prev => ({ ...prev, [key]: !prev[key] }))}
                  edge="end"
                  size="small"
                >
                  {showPassword[key] ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      );
    }

    return (
      <TextField
        fullWidth
        label={label}
        value={value}
        onChange={(e) => handleInputChange(key, e.target.value)}
        type={type || 'text'}
        size="small"
        helperText={helperText}
        inputProps={type === 'number' ? { step: '0.01' } : {}}
      />
    );
  };

  const settingsSections = [
    {
      category: 'general',
      fields: [
        { key: 'platformName', label: 'Platform Name', type: 'text' },
        { key: 'platformLogo', label: 'Platform Logo URL', type: 'text' },
        { key: 'website', label: 'Website URL', type: 'url' },
        { key: 'supportEmail', label: 'Support Email', type: 'email' },
        { key: 'supportPhone', label: 'Support Phone', type: 'tel' },
        { key: 'officeAddress', label: 'Office Address', type: 'text' },
      ]
    },
    {
      category: 'commission',
      fields: [
        { key: 'retailerCommission', label: 'Retailer Commission (%)', type: 'number' },
        { key: 'deliveryCommission', label: 'Delivery Commission (%)', type: 'number' },
        { key: 'platformFee', label: 'Platform Fee (%)', type: 'number' },
        { key: 'taxRate', label: 'Tax Rate - GST (%)', type: 'number' },
        { key: 'discountCap', label: 'Max Discount (%)', type: 'number' },
      ]
    },
    {
      category: 'delivery',
      fields: [
        { key: 'deliveryRadius', label: 'Delivery Radius (km)', type: 'number' },
        { key: 'maxDeliveryDistance', label: 'Max Delivery Distance (km)', type: 'number' },
        { key: 'deliveryFee', label: 'Base Delivery Fee (₹)', type: 'number' },
        { key: 'freeDeliveryThreshold', label: 'Free Delivery Threshold (₹)', type: 'number' },
        { key: 'standardDeliveryTime', label: 'Standard Delivery Time (min)', type: 'number' },
        { key: 'expressDeliveryTime', label: 'Express Delivery Time (min)', type: 'number' },
        { key: 'peakHourSurcharge', label: 'Peak Hour Surcharge (%)', type: 'number' },
      ]
    },
    {
      category: 'payment',
      fields: [
        { key: 'paymentGateway', label: 'Payment Gateway', type: 'select', options: [
          { label: 'Razorpay', value: 'razorpay' },
          { label: 'Stripe', value: 'stripe' },
          { label: 'PayPal', value: 'paypal' }
        ]},
        { key: 'razorpayKey', label: 'Razorpay Key', type: 'password' },
        { key: 'razorpaySecret', label: 'Razorpay Secret', type: 'password' },
        { key: 'enableCOD', label: 'Enable Cash on Delivery', type: 'toggle' },
        { key: 'enableUPI', label: 'Enable UPI', type: 'toggle' },
        { key: 'enableCards', label: 'Enable Card Payments', type: 'toggle' },
        { key: 'enableWallet', label: 'Enable Wallet', type: 'toggle' },
      ]
    },
    {
      category: 'email',
      fields: [
        { key: 'emailProvider', label: 'Email Provider', type: 'select', options: [
          { label: 'SendGrid', value: 'sendgrid' },
          { label: 'AWS SES', value: 'ses' },
          { label: 'SMTP', value: 'smtp' }
        ]},
        { key: 'sendgridApiKey', label: 'SendGrid API Key', type: 'password' },
        { key: 'emailFrom', label: 'From Email Address', type: 'email' },
        { key: 'emailFromName', label: 'From Name', type: 'text' },
      ]
    },
    {
      category: 'sms',
      fields: [
        { key: 'smsProvider', label: 'SMS Provider', type: 'select', options: [
          { label: 'Twilio', value: 'twilio' },
          { label: 'AWS SNS', value: 'sns' },
          { label: 'Custom', value: 'custom' }
        ]},
        { key: 'twilioAccountSid', label: 'Twilio Account SID', type: 'password' },
        { key: 'twilioAuthToken', label: 'Twilio Auth Token', type: 'password' },
        { key: 'twilioPhoneNumber', label: 'Twilio Phone Number', type: 'tel' },
      ]
    },
    {
      category: 'notifications',
      fields: [
        { key: 'emailNotifications', label: 'Enable Email Notifications', type: 'toggle' },
        { key: 'smsNotifications', label: 'Enable SMS Notifications', type: 'toggle' },
        { key: 'pushNotifications', label: 'Enable Push Notifications', type: 'toggle' },
        { key: 'quietHoursStart', label: 'Quiet Hours Start Time', type: 'time' },
        { key: 'quietHoursEnd', label: 'Quiet Hours End Time', type: 'time' },
        { key: 'maxNotificationsPerDay', label: 'Max Notifications per Day', type: 'number' },
      ]
    },
    {
      category: 'security',
      fields: [
        { key: 'twoFactorAuth', label: 'Enable 2FA', type: 'toggle' },
        { key: 'sessionTimeout', label: 'Session Timeout (minutes)', type: 'number' },
        { key: 'passwordExpiry', label: 'Password Expiry (days)', type: 'number' },
        { key: 'maxLoginAttempts', label: 'Max Login Attempts', type: 'number' },
        { key: 'apiRateLimit', label: 'API Rate Limit (requests/min)', type: 'number' },
        { key: 'enableIpWhitelist', label: 'Enable IP Whitelist', type: 'toggle' },
      ]
    },
    {
      category: 'kyc',
      fields: [
        { key: 'requireRetailerPan', label: 'Require Retailer PAN', type: 'toggle' },
        { key: 'requireRetailerGst', label: 'Require Retailer GST', type: 'toggle' },
        { key: 'requireRiderAadhaar', label: 'Require Rider Aadhaar', type: 'toggle' },
        { key: 'requireRiderLicense', label: 'Require Driving License', type: 'toggle' },
        { key: 'licenseRenewalReminder', label: 'License Renewal Reminder (days)', type: 'number' },
      ]
    },
    {
      category: 'products',
      fields: [
        { key: 'autoProductApproval', label: 'Auto-Approve Products', type: 'toggle' },
        { key: 'productApprovalLevel', label: 'Product Approval Level', type: 'select', options: [
          { label: 'Auto', value: 'auto' },
          { label: 'Manual', value: 'manual' },
          { label: 'Two-Level', value: 'two-level' }
        ]},
        { key: 'minProductDescLength', label: 'Min Description Length', type: 'number' },
        { key: 'minProductImages', label: 'Min Product Images Required', type: 'number' },
        { key: 'maxProductImages', label: 'Max Product Images Allowed', type: 'number' },
      ]
    },
    {
      category: 'compliance',
      fields: [
        { key: 'gdprCompliance', label: 'Enable GDPR Compliance', type: 'toggle' },
        { key: 'ccpaCompliance', label: 'Enable CCPA Compliance', type: 'toggle' },
        { key: 'dataLocalization', label: 'Enable Data Localization', type: 'toggle' },
        { key: 'privacyPolicyUrl', label: 'Privacy Policy URL', type: 'url' },
        { key: 'termsConditionsUrl', label: 'Terms & Conditions URL', type: 'url' },
      ]
    },
    {
      category: 'analytics',
      fields: [
        { key: 'enableRealTimeAnalytics', label: 'Enable Real-Time Analytics', type: 'toggle' },
        { key: 'analyticsUpdateInterval', label: 'Analytics Update Interval (minutes)', type: 'number' },
        { key: 'dataRetentionDays', label: 'Data Retention (days)', type: 'number' },
      ]
    },
    {
      category: 'marketing',
      fields: [
        { key: 'maxActivePromotions', label: 'Max Active Promotions', type: 'number' },
        { key: 'maxDiscountPercent', label: 'Max Discount %', type: 'number' },
        { key: 'maxCouponUsage', label: 'Max Coupon Usage', type: 'number' },
        { key: 'firstOrderDiscount', label: 'First Order Discount %', type: 'number' },
      ]
    },
    {
      category: 'support',
      fields: [
        { key: 'enableEmailSupport', label: 'Enable Email Support', type: 'toggle' },
        { key: 'enableChatSupport', label: 'Enable Chat Support', type: 'toggle' },
        { key: 'enablePhoneSupport', label: 'Enable Phone Support', type: 'toggle' },
        { key: 'slaResponseTime', label: 'SLA Response Time (hours)', type: 'number' },
        { key: 'slaResolutionTime', label: 'SLA Resolution Time (hours)', type: 'number' },
      ]
    },
    {
      category: 'audit',
      fields: [
        { key: 'enableAuditLogging', label: 'Enable Audit Logging', type: 'toggle' },
        { key: 'auditLogRetention', label: 'Audit Log Retention (days)', type: 'number' },
      ]
    },
    {
      category: 'recovery',
      fields: [
        { key: 'autoBackup', label: 'Enable Auto Backup', type: 'toggle' },
        { key: 'backupFrequency', label: 'Backup Frequency', type: 'select', options: [
          { label: 'Hourly', value: 'hourly' },
          { label: 'Daily', value: 'daily' },
          { label: 'Weekly', value: 'weekly' }
        ]},
        { key: 'backupRetention', label: 'Backup Retention (days)', type: 'number' },
        { key: 'enableCrossRegionBackup', label: 'Enable Cross-Region Backup', type: 'toggle' },
        { key: 'rto', label: 'RTO (minutes)', type: 'number' },
        { key: 'rpo', label: 'RPO (minutes)', type: 'number' },
      ]
    },
  ];

  const currentSection = settingsSections.find(s => s.category === selectedCategory);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Left Sidebar with Categories Tree */}
      <Paper sx={{ 
        width: 320, 
        borderRadius: 0,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        height: '100vh',
        overflow: 'auto',
        position: 'sticky',
        top: 0,
      }}>
        <Box sx={{ p: 2, bgcolor: '#2196f3', color: 'white' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <SettingsIcon fontSize="small" /> Settings
          </Typography>
          <Typography variant="caption">Configure your platform</Typography>
        </Box>
        
        <Divider />
        
        <List sx={{ p: 0 }}>
          {Object.keys(SETTINGS_CATEGORIES).map((cat) => {
            const Category = SETTINGS_CATEGORIES[cat];
            const CategoryIcon = Category.icon;
            return (
              <ListItem
                button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                sx={{
                  bgcolor: selectedCategory === cat ? 'rgba(33, 150, 243, 0.15)' : 'transparent',
                  borderLeft: selectedCategory === cat ? '4px solid #2196f3' : '4px solid transparent',
                  paddingLeft: selectedCategory === cat ? '12px' : '16px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'rgba(33, 150, 243, 0.1)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: Category.color }}>
                  <CategoryIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary={Category.title}
                  primaryTypographyProps={{
                    fontSize: '14px',
                    fontWeight: selectedCategory === cat ? '600' : '500',
                  }}
                />
              </ListItem>
            );
          })}
        </List>
      </Paper>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {successMessage && (
            <Alert severity="success" onClose={() => setSuccessMessage('')} sx={{ mb: 3 }}>
              {successMessage}
            </Alert>
          )}

          {errorMessage && (
            <Alert severity="error" onClose={() => setErrorMessage('')} sx={{ mb: 3 }}>
              {errorMessage}
            </Alert>
          )}

          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Box sx={{ color: SETTINGS_CATEGORIES[selectedCategory].color }}>
                {React.createElement(SETTINGS_CATEGORIES[selectedCategory].icon, { sx: { fontSize: 32 } })}
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {SETTINGS_CATEGORIES[selectedCategory].title}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#666', ml: 5 }}>
              Configure {SETTINGS_CATEGORIES[selectedCategory].title.toLowerCase()} for your platform
            </Typography>
          </Box>

          <Paper sx={{ p: 3 }}>
            {settingsSections.find(s => s.category === selectedCategory) && (
              <Grid container spacing={3}>
                {settingsSections.find(s => s.category === selectedCategory).fields.map((field) => (
                  <Grid item xs={12} sm={6} md={4} key={field.key}>
                    <Box>
                      {renderSettingField(field)}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<RestartIcon />}
                onClick={() => setResetConfirmOpen(true)}
                disabled={loading || savingCategory !== null}
              >
                Reset
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleExport}
                disabled={loading || savingCategory !== null}
              >
                Export
              </Button>
              <Button
                variant="contained"
                startIcon={savingCategory !== null ? <CircularProgress size={20} /> : <Save />}
                onClick={handleSave}
                disabled={loading || savingCategory !== null}
                sx={{ background: '#2196f3' }}
              >
                {savingCategory !== null ? 'Saving...' : 'Save Settings'}
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* Reset Confirmation Dialog */}
      <Dialog
        open={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
      >
        <DialogTitle>⚠️ Reset All Settings</DialogTitle>
        <DialogContent>
          Are you sure you want to reset all settings to their default values? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={handleReset}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default EnhancedAdminSettings;
