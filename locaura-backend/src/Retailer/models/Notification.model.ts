import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    _id: mongoose.Types.ObjectId;
    recipient_id: mongoose.Types.ObjectId;
    recipient_role: 'consumer' | 'retailer' | 'rider';
    
    type: 'ORDER_PLACED' | 'ORDER_ACCEPTED' | 'ORDER_PACKED' | 'ORDER_SHIPPED' | 'ORDER_DELIVERED' | 'PAYMENT_CONFIRMED' | 'NEW_DELIVERY_AVAILABLE';
    
    title: string;
    body: string;
    data?: Map<string, any>; // Deep link payload e.g. { order_id: "..." }
    
    is_read: boolean;
    read_at?: Date;
    sent_via_fcm: boolean;
    
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
    {
        recipient_id: { type: Schema.Types.ObjectId, required: true, index: true },
        recipient_role: { type: String, enum: ['consumer', 'retailer', 'rider'], required: true },
        
        type: { 
            type: String, 
            enum: [
                'ORDER_PLACED', 'ORDER_ACCEPTED', 'ORDER_PACKED', 
                'ORDER_SHIPPED', 'ORDER_DELIVERED', 'PAYMENT_CONFIRMED', 
                'NEW_DELIVERY_AVAILABLE'
            ], 
            required: true 
        },
        
        title: { type: String, required: true },
        body: { type: String, required: true },
        data: { type: Map, of: Schema.Types.Mixed },
        
        is_read: { type: Boolean, default: false, index: true },
        read_at: { type: Date },
        sent_via_fcm: { type: Boolean, default: false }
    },
    { timestamps: true }
);

NotificationSchema.index({ recipient_id: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
