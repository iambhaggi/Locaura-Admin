import { NotificationManager } from './NotificationManager';
import { WebSocketProvider } from '../infra/providers/WebSocketProvider';
import { FCMProvider } from '../infra/providers/FCMProvider';
import { Logger } from '../../utils/logger';

// One-time setup
const manager = NotificationManager.get_instance();
manager.register_provider(new WebSocketProvider());
manager.register_provider(new FCMProvider());

/**
 * Application Use Case for Notifications.
 * Encapsulates the business rules for WHEN and WHAT to notify.
 */
export class NotificationUseCase {
    public static async notify_new_order(store_id: string, retailer_id: string, order_number: string) {
        try {
            const payload = {
                title: "🛍️ New Order Received!",
                body: `Order #${order_number} is ready for processing. Check it now!`,
                type: 'NEW_ORDER',
                data: { order_number, store_id: store_id.toString() }
            };

            await manager.send_to_user(retailer_id.toString(), payload);
        } catch (error: any) {
            Logger.error(`Notification UseCase Error (New Order): ${error.message}`, 'NotificationUseCase');
        }
    }

    public static async notify_order_status_update(consumer_id: string, status: string, order_number: string) {
        try {
            const isAccepted = status === 'ACCEPTED';
            const isPacked = status === 'PACKED';
            
            const payload = {
                title: isAccepted ? "✅ Order Accepted" : isPacked ? "🍞 Order Packed" : "📦 Order Update",
                body: isAccepted ? `Order #${order_number} has been accepted!` : isPacked ? `Order #${order_number} is ready!` : `Order #${order_number} is ${status}.`,
                type: 'ORDER_UPDATE',
                data: { order_number, status }
            };

            await manager.send_to_user(consumer_id.toString(), payload);
        } catch (error: any) {
             Logger.error(`Notification UseCase Error (Status Update): ${error.message}`, 'NotificationUseCase');
        }
    }
}
