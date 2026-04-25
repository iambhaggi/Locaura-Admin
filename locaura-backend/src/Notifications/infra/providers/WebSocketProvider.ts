import { INotificationProvider, NotificationChannel, NotificationPayload } from '../../domain/interfaces/INotificationProvider';
import { SocketService } from '../socket/SocketService';
import { Logger } from '../../../utils/logger';

/**
 * WebSocket implementation based on SocketService.
 * Handles instant delivery when user is online.
 */
export class WebSocketProvider implements INotificationProvider {
    public readonly channel = NotificationChannel.WEBSOCKET;
    private service = SocketService.get_instance();

    async send(recipientId: string, payload: NotificationPayload): Promise<boolean> {
        try {
            this.service.emit_to_user(recipientId, payload.type, payload);
            Logger.info(`WebSocket ping sent to user ${recipientId} for ${payload.type}`, 'WebSocketProvider');
            return true;
        } catch (error: any) {
            Logger.error(`WebSocket failure: ${error.message}`, 'WebSocketProvider');
            return false;
        }
    }

    async sendToTopic(topic: string, payload: NotificationPayload): Promise<boolean> {
         try {
            // Mapping topic to socket rooms (prefixing store_ to avoid ID clashes)
            // e.g. store_65... ID
            this.service.emit_to_store(topic, payload.type, payload);
            return true;
        } catch (error: any) {
             Logger.error(`Topic failure: ${error.message}`, 'WebSocketProvider');
            return false;
        }
    }
}
