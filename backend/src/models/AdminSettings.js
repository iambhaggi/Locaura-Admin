const mongoose = require('mongoose');
const { connectAdminMongoDB } = require('../config/database');

const settingSchema = new mongoose.Schema(
  {
    // General Settings
    platformName: {
      type: String,
      default: 'Locaura',
      required: true,
    },
    platformLogo: String,
    platformDescription: String,
    website: String,
    supportEmail: String,
    supportPhone: String,
    supportWhatsapp: String,
    officeAddress: String,
    officeTimings: String,

    // Social Media
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String,
      linkedin: String,
      youtube: String,
    },

    // Commission & Pricing
    commission: {
      retailer: {
        base: { type: Number, default: 10 },
        min: { type: Number, default: 0 },
        max: { type: Number, default: 100 },
      },
      delivery: {
        base: { type: Number, default: 15 },
        perKm: { type: Number, default: 5 },
        peakMultiplier: { type: Number, default: 1.5 },
      },
      platform: { type: Number, default: 5 },
      taxRate: { type: Number, default: 18 },
    },

    // Delivery Settings
    delivery: {
      baseRadius: { type: Number, default: 25 },
      maxDistance: { type: Number, default: 50 },
      baseFee: { type: Number, default: 50 },
      freeDeliveryThreshold: { type: Number, default: 500 },
      minOrderValue: { type: Number, default: 100 },
      maxOrderValue: { type: Number, default: 10000 },
      standardTime: { type: Number, default: 45 },
      expressTime: { type: Number, default: 20 },
      peakHourSurcharge: { type: Number, default: 10 },
      weekendPremium: { type: Number, default: 5 },
      peakHourStart: { type: String, default: '12:00' },
      peakHourEnd: { type: String, default: '15:00' },
      noDeliveryZones: [String],
    },

    // Payment Gateway
    paymentGateway: {
      type: {
        type: String,
        enum: ['razorpay', 'stripe', 'paypal'],
        default: 'razorpay',
      },
      razorpay: {
        keyId: String,
        keySecret: String,
        webhookUrl: String,
        enabled: { type: Boolean, default: true },
      },
      stripe: {
        secretKey: String,
        publishableKey: String,
        webhookSecret: String,
        enabled: { type: Boolean, default: false },
      },
      paymentMethods: {
        creditDebit: { type: Boolean, default: true },
        upi: { type: Boolean, default: true },
        netBanking: { type: Boolean, default: true },
        wallet: { type: Boolean, default: true },
        cod: { type: Boolean, default: true },
        bnpl: { type: Boolean, default: false },
      },
    },

    // Email Configuration
    email: {
      provider: {
        type: String,
        enum: ['sendgrid', 'ses', 'smtp'],
        default: 'sendgrid',
      },
      sendgrid: {
        apiKey: String,
        enabled: { type: Boolean, default: true },
      },
      smtp: {
        host: String,
        port: Number,
        user: String,
        password: String,
        enabled: { type: Boolean, default: false },
      },
      fromEmail: String,
      fromName: String,
      replyTo: String,
      templates: {
        welcome: String,
        orderConfirmation: String,
        passwordReset: String,
        notification: String,
      },
    },

    // SMS Configuration
    sms: {
      provider: {
        type: String,
        enum: ['twilio', 'sns', 'custom'],
        default: 'twilio',
      },
      twilio: {
        accountSid: String,
        authToken: String,
        phoneNumber: String,
        enabled: { type: Boolean, default: true },
      },
      aws: {
        accessKeyId: String,
        secretAccessKey: String,
        region: String,
        enabled: { type: Boolean, default: false },
      },
      templates: {
        otp: String,
        welcome: String,
        orderUpdate: String,
        delivery: String,
      },
    },

    // Notifications
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true },
      quietHoursStart: { type: String, default: '22:00' },
      quietHoursEnd: { type: String, default: '07:00' },
      maxPerDay: { type: Number, default: 5 },
      types: {
        order: { type: Boolean, default: true },
        delivery: { type: Boolean, default: true },
        payment: { type: Boolean, default: true },
        promotion: { type: Boolean, default: true },
        support: { type: Boolean, default: true },
      },
    },

    // Security & Access Control
    security: {
      twoFactorAuth: { type: Boolean, default: true },
      sessionTimeout: { type: Number, default: 30 }, // minutes
      passwordExpiry: { type: Number, default: 90 }, // days
      maxLoginAttempts: { type: Number, default: 5 },
      lockoutDuration: { type: Number, default: 15 }, // minutes
      passwordMinLength: { type: Number, default: 8 },
      requireComplexPassword: { type: Boolean, default: true },
      ipWhitelistEnabled: { type: Boolean, default: false },
      ipWhitelist: [String],
      apiRateLimit: { type: Number, default: 1000 }, // requests per minute
      sslRequired: { type: Boolean, default: true },
    },

    // KYC & Verification
    kyc: {
      retailer: {
        requirePan: { type: Boolean, default: true },
        requireGst: { type: Boolean, default: true },
        requireBankDetails: { type: Boolean, default: true },
        requireBusinessReg: { type: Boolean, default: true },
        approvalLevel: {
          type: String,
          enum: ['auto', 'manual', 'two-level'],
          default: 'manual',
        },
      },
      rider: {
        requireAadhaar: { type: Boolean, default: true },
        requireDrivingLicense: { type: Boolean, default: true },
        requireVehicleRc: { type: Boolean, default: true },
        requireBankDetails: { type: Boolean, default: true },
        backgroundCheckRequired: { type: Boolean, default: true },
        minAge: { type: Number, default: 18 },
        maxAge: { type: Number, default: 65 },
        licenseRenewalReminder: { type: Number, default: 30 }, // days
      },
      consumer: {
        emailVerificationRequired: { type: Boolean, default: true },
        phoneVerificationRequired: { type: Boolean, default: true },
        addressVerificationRequired: { type: Boolean, default: false },
        minAge: { type: Number, default: 13 },
      },
    },

    // Product & Category Settings
    products: {
      autoApproval: { type: Boolean, default: false },
      approvalLevel: {
        type: String,
        enum: ['auto', 'manual', 'two-level'],
        default: 'manual',
      },
      listingDuration: { type: Number, default: 365 }, // days
      minDescriptionLength: { type: Number, default: 50 },
      minImagesRequired: { type: Number, default: 3 },
      maxImagesAllowed: { type: Number, default: 10 },
      maxVariants: { type: Number, default: 50 },
      maxCategoriesPerProduct: { type: Number, default: 3 },
      profanityFilterEnabled: { type: Boolean, default: true },
      imageModerationEnabled: { type: Boolean, default: true },
    },

    // Consumer Management
    consumer: {
      minAge: { type: Number, default: 13 },
      minOrderValue: { type: Number, default: 50 },
      maxOrdersPerDay: { type: Number, default: 100 },
      maxCartItems: { type: Number, default: 50 },
      returnWindow: { type: Number, default: 7 }, // days
      replaceWindow: { type: Number, default: 7 }, // days
      walletEnabled: { type: Boolean, default: true },
      referralEnabled: { type: Boolean, default: true },
      loyaltyEnabled: { type: Boolean, default: true },
      pointsPerRupee: { type: Number, default: 1 },
      pointsExpiry: { type: Number, default: 365 }, // days
    },

    // Compliance & Legal
    compliance: {
      privacyPolicyUrl: String,
      termsConditionsUrl: String,
      refundPolicyUrl: String,
      shippingPolicyUrl: String,
      returnPolicyUrl: String,
      cookiePolicyUrl: String,
      gdprCompliance: { type: Boolean, default: true },
      ccpaCompliance: { type: Boolean, default: false },
      dataLocalization: { type: Boolean, default: true },
      pciDssCompliance: { type: Boolean, default: true },
      gstNumber: String,
      companyName: String,
      companyRegistration: String,
      cin: String,
    },

    // API & Integration
    integrations: {
      googleMapsApiKey: String,
      googleAnalyticsId: String,
      firebaseProjectId: String,
      sentryDsn: String,
      slackWebhook: String,
      webhookRetryAttempts: { type: Number, default: 3 },
      webhookTimeout: { type: Number, default: 30 }, // seconds
    },

    // System Configuration
    system: {
      databaseBackupFrequency: {
        type: String,
        enum: ['hourly', 'daily', 'weekly'],
        default: 'daily',
      },
      backupRetention: { type: Number, default: 30 }, // days
      cacheEnabled: { type: Boolean, default: true },
      cacheTTL: { type: Number, default: 300 }, // seconds
      maxFileUploadSize: { type: Number, default: 10 }, // MB
      imageQuality: { type: Number, default: 85 }, // percentage
      imageCompressionEnabled: { type: Boolean, default: true },
      cdnUrl: String,
    },

    // Analytics & Reporting
    analytics: {
      realTimeAnalyticsEnabled: { type: Boolean, default: true },
      analyticsUpdateInterval: { type: Number, default: 5 }, // minutes
      dataRetentionDays: { type: Number, default: 365 },
      dailyReports: { type: Boolean, default: true },
      weeklyReports: { type: Boolean, default: true },
      monthlyReports: { type: Boolean, default: true },
      reportEmail: String,
    },

    // Marketing & Promotions
    marketing: {
      maxActivePromotions: { type: Number, default: 50 },
      maxDiscountPercent: { type: Number, default: 80 },
      maxCouponUsage: { type: Number, default: 1000 },
      maxCouponUsagePerUser: { type: Number, default: 5 },
      firstOrderDiscount: { type: Number, default: 20 },
      referralDiscount: { type: Number, default: 10 },
      promoCodePrefix: { type: String, default: 'LOC' },
      emailCampaignsEnabled: { type: Boolean, default: true },
      smsCampaignsEnabled: { type: Boolean, default: true },
      pushCampaignsEnabled: { type: Boolean, default: true },
    },

    // Support & Customer Service
    support: {
      emailSupportEnabled: { type: Boolean, default: true },
      chatSupportEnabled: { type: Boolean, default: true },
      whatsappSupportEnabled: { type: Boolean, default: true },
      phoneSupportEnabled: { type: Boolean, default: true },
      helpCenterUrl: String,
      faqPageUrl: String,
      slaResponseTime: { type: Number, default: 2 }, // hours
      slaResolutionTime: { type: Number, default: 24 }, // hours
      ticketAutoCloseAfter: { type: Number, default: 7 }, // days
      chatbotEnabled: { type: Boolean, default: true },
    },

    // Audit & Compliance
    audit: {
      auditLoggingEnabled: { type: Boolean, default: true },
      auditLogRetention: { type: Number, default: 365 }, // days
      adminActionLogging: { type: Boolean, default: true },
      dataChangeLogging: { type: Boolean, default: true },
    },

    // Disaster Recovery
    disasterRecovery: {
      autoBackupEnabled: { type: Boolean, default: true },
      backupFrequency: {
        type: String,
        enum: ['hourly', 'daily', 'weekly'],
        default: 'daily',
      },
      backupRetention: { type: Number, default: 30 }, // days
      crossRegionBackupEnabled: { type: Boolean, default: true },
      rto: { type: Number, default: 60 }, // minutes
      rpo: { type: Number, default: 15 }, // minutes
      drSiteUrl: String,
    },

    // Multi-Location Settings
    multiLocation: {
      operatingCities: [String],
      defaultLanguage: { type: String, default: 'en' },
      supportedLanguages: [String],
      defaultCurrency: { type: String, default: 'INR' },
      timezone: { type: String, default: 'Asia/Kolkata' },
      regionRestrictions: [
        {
          region: String,
          restrictedProducts: [String],
          customPricing: Boolean,
        }
      ],
    },

    // Admin User Metadata
    createdBy: mongoose.Schema.Types.ObjectId,
    modifiedBy: mongoose.Schema.Types.ObjectId,
    lastModifiedAt: Date,
  },
  {
    timestamps: true,
    collection: 'settings'
  }
);

// Indexes
settingSchema.index({ createdAt: 1 });
settingSchema.index({ modifiedBy: 1 });

const createAdminSettingsModel = async () => {
  const adminConnection = await connectAdminMongoDB();
  return adminConnection.model('AdminSettings', settingSchema);
};

module.exports = {
  createAdminSettingsModel,
  settingSchema,
};
