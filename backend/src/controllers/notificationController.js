const { createNotificationModel } = require('../models/AppNotification');
const { createConsumerModel } = require('../models/Consumer');
const { createRetailerModel } = require('../models/AppRetailer');
const { createRiderModel } = require('../models/AppRider');
const nodemailer = require('nodemailer');

// Configure email transporter (update with your credentials)
const emailTransporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password',
  },
});

// Send offer to users
exports.sendOffer = async (req, res) => {
  try {
    const {
      title,
      description,
      discount_percentage,
      offer_type,
      target_users,
      image_url,
      validity_days,
      terms_conditions,
      sendEmail,
      sendPushNotification,
    } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required',
      });
    }

    // Get notification model
    const Notification = await createNotificationModel();

    // Determine target user IDs based on target_users filter
    let userIds = [];
    let userEmails = [];

    if (target_users === 'all' || target_users === 'consumer') {
      const Consumer = await createConsumerModel();
      const consumers = await Consumer.find({}, { _id: 1, email: 1 }).lean();
      userIds.push(...consumers.map(c => ({ id: c._id, role: 'consumer', email: c.email })));
    }

    if (target_users === 'all' || target_users === 'retailer') {
      const Retailer = await createRetailerModel();
      const retailers = await Retailer.find({}, { _id: 1, email: 1 }).lean();
      userIds.push(...retailers.map(r => ({ id: r._id, role: 'retailer', email: r.email })));
    }

    if (target_users === 'all' || target_users === 'rider') {
      const Rider = await createRiderModel();
      const riders = await Rider.find({}, { _id: 1, email: 1 }).lean();
      userIds.push(...riders.map(r => ({ id: r._id, role: 'rider', email: r.email })));
    }

    // Create notifications for each target user
    const notificationData = userIds.map(user => ({
      recipient_id: user.id,
      recipient_role: user.role,
      type: 'OFFER',
      title: title,
      body: description,
      data: {
        offer_type,
        discount_percentage,
        image_url,
        validity_days,
        terms_conditions,
      },
      is_read: false,
      sent_via_fcm: sendPushNotification || false,
    }));

    // Insert all notifications
    const createdNotifications = await Notification.insertMany(notificationData);

    // Send emails if enabled
    if (sendEmail && userIds.length > 0) {
      sendEmailNotifications(userIds, title, description, discount_percentage, offer_type, validity_days, terms_conditions);
    }

    res.json({
      success: true,
      message: `Offer sent to ${userIds.length} users`,
      data: {
        notification_count: createdNotifications.length,
        users_count: userIds.length,
        email_sent: sendEmail,
        push_sent: sendPushNotification,
      },
    });
  } catch (error) {
    console.error('Error sending offer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send offer',
      error: error.message,
    });
  }
};

// Send email notifications
const sendEmailNotifications = async (userIds, title, description, discountPercentage, offerType, validityDays, termsConditions) => {
  try {
    const emailPromises = userIds.map(user => {
      const discountText = offerType === 'percentage' 
        ? `${discountPercentage}% OFF` 
        : `Flat ₹${discountPercentage} OFF`;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Arial', sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; background: #f9fafb; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { background: white; padding: 30px; }
            .offer-banner { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; }
            .offer-banner h2 { margin: 0 0 10px 0; font-size: 28px; }
            .discount-badge { background: rgba(255,255,255,0.2); padding: 10px 20px; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 18px; }
            .footer { background: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #666; }
            .cta-button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; text-decoration: none; display: inline-block; margin: 20px 0; }
            .terms { font-size: 12px; color: #999; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Locaura Special Offer</h1>
            </div>
            
            <div class="content">
              <p>Hi there,</p>
              <p>We have an exclusive offer just for you!</p>
              
              <div class="offer-banner">
                <h2>${title}</h2>
                <div class="discount-badge">${discountText}</div>
              </div>
              
              <p>${description}</p>
              
              <div style="background: #f0f7ff; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 5px;">
                <strong>✅ Valid for ${validityDays} days</strong>
              </div>
              
              <a href="https://locaura.com/offers" class="cta-button">View Offer</a>
              
              ${termsConditions ? `
                <div class="terms">
                  <strong>Terms & Conditions:</strong>
                  <p>${termsConditions}</p>
                </div>
              ` : ''}
            </div>
            
            <div class="footer">
              <p>© 2024 Locaura. All rights reserved.</p>
              <p>This is an automated offer notification. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      return emailTransporter.sendMail({
        from: process.env.EMAIL_USER || 'noreply@locaura.com',
        to: user.email,
        subject: `🎉 ${title} - Special Offer from Locaura`,
        html: htmlContent,
      });
    });

    await Promise.all(emailPromises);
    console.log(`Emails sent to ${userIds.length} users`);
  } catch (error) {
    console.error('Error sending emails:', error);
  }
};

// Get all notifications
exports.getNotifications = async (req, res) => {
  try {
    const Notification = await createNotificationModel();
    const { page = 1, limit = 20, recipient_role } = req.query;
    const skip = (page - 1) * limit;

    const query = recipient_role ? { recipient_role } : {};
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Notification.countDocuments(query);

    res.json({
      success: true,
      data: notifications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
    });
  }
};

// Get notification statistics
exports.getNotificationStats = async (req, res) => {
  try {
    const Notification = await createNotificationModel();

    const stats = {
      total: await Notification.countDocuments(),
      read: await Notification.countDocuments({ is_read: true }),
      unread: await Notification.countDocuments({ is_read: false }),
      by_role: {
        consumer: await Notification.countDocuments({ recipient_role: 'consumer' }),
        retailer: await Notification.countDocuments({ recipient_role: 'retailer' }),
        rider: await Notification.countDocuments({ recipient_role: 'rider' }),
      },
      sent_via_fcm: await Notification.countDocuments({ sent_via_fcm: true }),
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
    });
  }
};

// Send test notification
exports.sendTestNotification = async (req, res) => {
  try {
    const { recipient_id, recipient_role } = req.body;

    const Notification = await createNotificationModel();

    const testNotification = await Notification.create({
      recipient_id,
      recipient_role,
      type: 'TEST',
      title: '✅ Test Notification',
      body: 'This is a test notification from Locaura Admin Panel',
      data: {
        test: true,
        timestamp: new Date(),
      },
      is_read: false,
      sent_via_fcm: true,
    });

    res.json({
      success: true,
      message: 'Test notification sent',
      data: testNotification,
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification',
    });
  }
};

// Delete old notifications (cleanup)
exports.deleteOldNotifications = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const Notification = await createNotificationModel();
    const result = await Notification.deleteMany({
      createdAt: { $lt: cutoffDate },
      is_read: true,
    });

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} old notifications`,
      data: result,
    });
  } catch (error) {
    console.error('Error deleting notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notifications',
    });
  }
};
