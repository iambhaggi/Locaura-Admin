export enum NotificationChannel {
    WEBSOCKET = 'WEBSOCKET',
    FCM = 'FCM',
    PUSH = 'PUSH', // General push bucket
    SMS = 'SMS',   // Future extension
}

export interface NotificationPayload {
    title: string;
    body: string;
    data?: Record<string, any>;
    type: string; // e.g., 'ORDER_CREATED', 'STATUS_UPDATE'
}

export interface INotificationProvider {
    readonly channel: NotificationChannel;
    send(recipientId: string, payload: NotificationPayload): Promise<boolean>;
    sendToTopic(topic: string, payload: NotificationPayload): Promise<boolean>;
}
