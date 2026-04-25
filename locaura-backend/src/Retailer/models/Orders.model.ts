import mongoose, { Schema, Document } from 'mongoose';
import { OrderStatus, PaymentStatus } from '../enums/order.enum';

// ─── Order Line Item (Snapshotting Variants) ─────────────────────────────
export interface IOrderItem {
  product_id:    mongoose.Types.ObjectId;
  variant_id:    mongoose.Types.ObjectId;  // Deeply scoped to variant
  product_name:  string;                   // snapshot at time of order
  variant_sku:   string;
  variant_label: string;                   // e.g. "Red / XL / Cotton"
  image_url?:    string;
  quantity:      number;
  unit_price:    number;                   // price at time of order (immutable)
  total_price:   number;
}

// ─── Order Status History ────────────────────────────────────────────────
export interface IStatusEvent {
  status:     OrderStatus;
  timestamp:  Date;
  note?:      string;
  updated_by: mongoose.Types.ObjectId;
  actor_role: string;
}

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  order_number:    string;             // human-readable: LAUR-20240315-00042
  store_id:        mongoose.Types.ObjectId;
  retailer_id:     mongoose.Types.ObjectId;
  consumer_id:     mongoose.Types.ObjectId; // Kept interface name, ref mapped to User
  delivery_partner_id?: mongoose.Types.ObjectId;

  items: IOrderItem[];

  pricing: {
    subtotal:       number;
    delivery_fee:   number;
    discount:       number;
    tax:            number;
    total:          number;
  };

  delivery_address: {
    line1:       string;
    line2?:      string;
    city:        string;
    state:       string;
    pincode:     string;
    location: {
      type:        'Point';
      coordinates: [number, number];
    };
  };

  payment: {
    method:     'COD' | 'UPI' | 'CARD' | 'WALLET' | 'NETBANKING';
    status:     PaymentStatus;
    reference?: string;             // gateway txn id
    paid_at?:   Date;
  };

  status:          OrderStatus;
  status_history:  IStatusEvent[];

  special_instructions?: string;
  estimated_delivery_at?: Date;
  delivered_at?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product_id:    { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variant_id:    { type: Schema.Types.ObjectId, required: true },
    product_name:  { type: String, required: true },
    variant_sku:   { type: String, required: true },
    variant_label: { type: String, required: true },
    image_url:     { type: String },
    quantity:      { type: Number, required: true, min: 1 },
    unit_price:    { type: Number, required: true, min: 0 },
    total_price:   { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const StatusEventSchema = new Schema<IStatusEvent>(
  {
    status:     { type: String, enum: Object.values(OrderStatus), required: true },
    timestamp:  { type: Date, default: Date.now },
    note:       { type: String },
    updated_by: { type: Schema.Types.ObjectId, required: true },
    actor_role: { type: String, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    order_number:        { type: String, unique: true, required: true },
    store_id:            { type: Schema.Types.ObjectId, ref: 'Store',    required: true, index: true },
    retailer_id:         { type: Schema.Types.ObjectId, ref: 'Retailer', required: true, index: true },
    consumer_id:         { type: Schema.Types.ObjectId, ref: 'Consumer', required: true, index: true },
    delivery_partner_id: { type: Schema.Types.ObjectId, ref: 'Rider', default: null },

    items: { type: [OrderItemSchema], default: () => [], required: true },

    pricing: {
      subtotal:     { type: Number, required: true },
      delivery_fee: { type: Number, default: 0 },
      discount:     { type: Number, default: 0 },
      tax:          { type: Number, default: 0 },
      total:        { type: Number, required: true },
    },

    delivery_address: {
      line1:    { type: String, required: true },
      line2:    { type: String },
      city:     { type: String, required: true },
      state:    { type: String, required: true },
      pincode:  { type: String, required: true },
      location: {
        type:        { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true },
      },
    },

    payment: {
      method:    { type: String, enum: ['COD', 'UPI', 'CARD', 'WALLET', 'NETBANKING'], required: true },
      status:    { type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.PENDING },
      reference: { type: String },
      paid_at:   { type: Date },
    },

    status:          { type: String, enum: Object.values(OrderStatus), default: OrderStatus.PENDING },
    status_history:  { type: [StatusEventSchema], default: () => [] },

    special_instructions:    { type: String },
    estimated_delivery_at:   { type: Date },
    delivered_at:            { type: Date },
  },
  { timestamps: true }
);

// ─── Indexes ─────────────────────────────────────────────────────────────
OrderSchema.index({ store_id: 1, status: 1 });
OrderSchema.index({ consumer_id: 1, createdAt: -1 });
OrderSchema.index({ delivery_partner_id: 1, status: 1 });
OrderSchema.index({ store_id: 1, createdAt: -1 });
OrderSchema.index({ 'delivery_address.location': '2dsphere' });

// ─── Auto-generate order number ──────────────────────────────────────────
OrderSchema.pre('validate', async function () {
  if (!this.order_number) {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand     = Math.floor(Math.random() * 90000) + 10000;
    this.order_number = `LAUR-${datePart}-${rand}`;
  }
});

export default mongoose.model<IOrder>('Order', OrderSchema);