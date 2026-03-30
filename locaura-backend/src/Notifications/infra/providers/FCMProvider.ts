import * as admin from 'firebase-admin';
import { INotificationProvider, NotificationChannel, NotificationPayload } from '../../domain/interfaces/INotificationProvider';
import { Logger } from '../../../utils/logger';
import Retailer from '../../../Retailer/models/Retailer.model';
import { Consumer } from '../../../Consumer/models/Consumer.model';

export class FCMProvider implements INotificationProvider {
    public readonly channel = NotificationChannel.FCM;
    private static initialized = false;

    private _initialize() {
        if (!FCMProvider.initialized) {
            if (!admin.apps.length) {
                try {
                    admin.initializeApp({
                        credential: admin.credential.cert('service_account.json')
                    });
                     Logger.success('FCM Provider Infrastructure Initialized', 'FCM');
                } catch (e: any) {
                    Logger.error(`Failed to initialize FCM Admin: ${e.message}`, 'FCM');
                }
            }
            FCMProvider.initialized = true;
        }
    }

    async send(recipientId: string, payload: NotificationPayload): Promise<boolean> {
        this._initialize();
        try {
            const retailer = await Retailer.findById(recipientId).select('fcm_token');
            const consumer = !retailer ? await Consumer.findById(recipientId).select('fcm_token') : null;
            
            const token = retailer?.fcm_token || consumer?.fcm_token;
            if (!token) return false;

            const message: admin.messaging.Message = {
                token,
                notification: { title: payload.title, body: payload.body },
                data: payload.data || {},
                android: { priority: 'high', notification: { sound: 'default', channelId: 'high_importance_channel' } },
                apns: { payload: { aps: { sound: 'default', badge: 1 } } }
            };

            await admin.messaging().send(message);
            Logger.info(`FCM PUSH delivered to user ${recipientId}`, 'FCMProvider');
            return true;
        } catch (error: any) {
            Logger.error(`FCM failed for user ${recipientId}: ${error.message}`, 'FCMProvider');
            return false;
        }
    }

    async sendToTopic(topic: string, payload: NotificationPayload): Promise<boolean> {
         this._initialize();
         try {
            const message: admin.messaging.TopicMessage = {
                topic,
                notification: { title: payload.title, body: payload.body },
                data: payload.data || {}
            };
            await admin.messaging().send(message);
            Logger.info(`FCM TOPIC delivered to ${topic}`, 'FCMProvider');
            return true;
        } catch (error: any) {
            Logger.error(`FCM failed for topic ${topic}: ${error.message}`, 'FCMProvider');
            return false;
        }
    }
}

