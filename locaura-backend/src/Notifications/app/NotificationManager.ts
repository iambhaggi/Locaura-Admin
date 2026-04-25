import { INotificationProvider, NotificationPayload } from '../domain/interfaces/INotificationProvider';
import { Logger } from '../../utils/logger';

export class NotificationManager {
    private static instance: NotificationManager;
    private providers: INotificationProvider[] = [];

    private constructor() {}

    public static get_instance(): NotificationManager {
        if (!NotificationManager.instance) {
            NotificationManager.instance = new NotificationManager();
        }
        return NotificationManager.instance;
    }

    public register_provider(provider: INotificationProvider) {
        this.providers.push(provider);
        Logger.info(`Notification Provider registered: ${provider.channel}`, 'NotificationManager');
    }

    /**
     * Unified send to user with Dual-Delivery Strategy (WS + FCM)
     * This ensures the merchant gets the order when foreground (WS) AND background (FCM)
     */
    public async send_to_user(userId: string, payload: NotificationPayload) {
        const promises = this.providers.map(p => {
             return p.send(userId, payload)
                    .catch((err: any) => {
                        Logger.error(`Provider ${p.channel} failed: ${err.message}`, 'NotificationManager');
                        return false;
                    });
        });
        
        return Promise.all(promises);
    }

    /**
     * Topic broadcast (e.g. retailers assigned to store_id)
     */
    public async send_to_topic(topic: string, payload: NotificationPayload) {
        const promises = this.providers.map(p => {
             return p.sendToTopic(topic, payload)
                    .catch((err: any) => {
                         Logger.error(`Topic Broadcaster ${p.channel} failed: ${err.message}`, 'NotificationManager');
                         return false;
                    });
        });

        return Promise.all(promises);
    }
}

