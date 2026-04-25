import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { NotificationUseCase } from '../Notifications/app/NotificationUseCase';
import { Logger } from '../utils/logger';

/**
 * MANUAL TEST SCRIPT
 * Usage: npx ts-node src/scripts/test_notification.ts <RETAILER_ID> <STORE_ID>
 */

dotenv.config();

const test_notification = async () => {
    const retailer_id = process.argv[2];
    const store_id = process.argv[3];

    if (!retailer_id || !store_id) {
        Logger.error('Missing arguments! Run: npx ts-node src/scripts/test_notification.ts <RETAILER_ID> <STORE_ID>', 'Test');
        process.exit(1);
    }

    try {
        Logger.info(`Connecting to DB to trigger test for Retailer ${retailer_id}...`, 'Test');
        await mongoose.connect(process.env.MONGODB_URI as string);
        
        Logger.info('Triggering Dual-Delivery Notification (WS + FCM)...', 'Test');
        
        await NotificationUseCase.notify_new_order(
            store_id, 
            retailer_id, 
            `TEST-${Math.floor(1000 + Math.random() * 9000)}`
        );

        Logger.success('Test notification sent successfully!', 'Test');
        process.exit(0);
    } catch (error: any) {
        Logger.error(`Test failed: ${error.message}`, 'Test');
        process.exit(1);
    }
};

test_notification();
