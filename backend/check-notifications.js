const { createNotificationModel } = require('./src/models/AppNotification');
const { connectAppMongoDB } = require('./src/config/database');

async function checkNotifications() {
  try {
    console.log('🔌 Connecting to database...');
    await connectAppMongoDB();

    const Notification = await createNotificationModel();
    const count = await Notification.countDocuments();
    console.log(`📊 Total notifications in database: ${count}`);

    if (count > 0) {
      const notifications = await Notification.find().limit(5).lean();
      console.log('📋 Sample notifications:');
      notifications.forEach((notif, index) => {
        console.log(`${index + 1}. ${notif.title} - ${notif.recipient_role} - Read: ${notif.is_read}`);
      });
    } else {
      console.log('❌ No notifications found in database');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkNotifications();