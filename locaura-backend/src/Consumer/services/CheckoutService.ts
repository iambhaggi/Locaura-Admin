import { OrderRepository } from '../../Retailer/repositories/OrderRepository';
import { StoreRepository } from '../../Retailer/repositories/StoreRepository';
import { ProductRepository } from '../../Retailer/repositories/ProductRepository';
import { ConsumerRepository } from '../repositories/ConsumerRepository';
import { IOrder, IOrderItem } from '../../Retailer/models/Orders.model';
import { OrderStatus, PaymentStatus } from '../../Retailer/enums/order.enum';
import PaymentModel from '../../Retailer/models/Payment.model';
import { PaymentService } from './PaymentService';
import { Logger } from '../../utils/logger';

import { NotificationUseCase } from '../../Notifications/app/NotificationUseCase';

interface CheckoutResult {
    order: IOrder;
    payment_id: string;
    razorpay_order?: {
        razorpay_order_id: string;
        amount: number | string;
        currency: string;
    };
}

export class CheckoutService {
    private order_repository = new OrderRepository();
    private store_repository = new StoreRepository();
    private product_repository = new ProductRepository();
    private consumer_repository = new ConsumerRepository();
    private payment_service = new PaymentService();

    async process_checkout(consumer_id: string, checkout_payload: any): Promise<CheckoutResult> {
        const { delivery_address_id, payment_method, special_instructions } = checkout_payload;

        // 1. Verify consumer and get the specific address
        const consumer = await this.consumer_repository.find_by_id(consumer_id);
        if (!consumer) throw new Error('Consumer not found');

        if (!consumer.cart || !consumer.cart.items || consumer.cart.items.length === 0) {
            throw new Error('Cart is empty');
        }

        const store_id = consumer.cart.store_id?.toString();
        if (!store_id) throw new Error('Store ID missing on cart');

        const delivery_address = consumer.addresses.find(a => a._id?.toString() === delivery_address_id);
        if (!delivery_address) throw new Error('Delivery address not found for this consumer');

        // 2. Verify Store
        const store = await this.store_repository.find_by_store_id(store_id);
        if (!store) throw new Error('Store not found');

        // 3. Validate Items and Calculate Totals
        const order_items: IOrderItem[] = [];
        let subtotal = 0;

        for (const requested_item of consumer.cart.items) {
            const variant = await this.product_repository.get_variant_by_id(requested_item.variant_id.toString());
            if (!variant) throw new Error(`Product variant ${requested_item.variant_id} not found`);

            // Check if variant belongs to the requested store
            if (variant.store_id.toString() !== store_id) {
                throw new Error(`Variant ${variant._id} does not belong to cart store ${store_id}.`);
            }

            if (variant.stock_quantity < requested_item.quantity) {
                throw new Error(`Insufficient stock for ${variant.variant_label}. Available: ${variant.stock_quantity}`);
            }

            // Lock/Deduct stock immediately (In a production system you might use a 2-phase commit or distinct lock)
            const remaining_stock = variant.stock_quantity - requested_item.quantity;
            await this.product_repository.update_variant(variant._id?.toString() as string, store_id, {
                stock_quantity: remaining_stock
            });

            // Fetch Parent Product for name
            const parent_product = await this.product_repository.get_product_by_id(variant.parent_id.toString());
            const product_name = parent_product ? parent_product.name : 'Unknown Product';

            const item_total = variant.price * requested_item.quantity;
            subtotal += item_total;

            order_items.push({
                product_id: variant.parent_id,
                variant_id: variant._id as any,
                product_name: product_name,
                variant_sku: variant.sku,
                variant_label: variant.variant_label,
                image_url: variant.images && variant.images.length > 0 ? variant.images[0] : undefined,
                quantity: requested_item.quantity,
                unit_price: variant.price,
                total_price: item_total
            });
        }

        // 4. Calculate Final Pricing Logic
        const delivery_fee = 40; // Flat fee for hyper-local Delivery
        const tax_rate = 0.18; // 18% generic tax
        const tax = parseFloat((subtotal * tax_rate).toFixed(2));
        const total = subtotal + delivery_fee + tax;

        const is_cod = payment_method === 'COD';
        const payment_status = is_cod ? PaymentStatus.COMPLETED : PaymentStatus.PENDING;

        // 5. Construct Document
        const order_data: Partial<IOrder> = {
            store_id: store._id as any,
            retailer_id: store.retailer_id,
            consumer_id: consumer._id as any,
            items: order_items,
            pricing: {
                subtotal,
                delivery_fee,
                discount: 0,
                tax,
                total
            },
            delivery_address: {
                line1: delivery_address.line1,
                line2: delivery_address.line2,
                city: delivery_address.city,
                state: delivery_address.state,
                pincode: delivery_address.pincode,
                location: {
                    type: 'Point',
                    coordinates: delivery_address.location?.coordinates || [0, 0] // fallback if corrupted
                }
            },
            payment: {
                method: payment_method,
                status: payment_status,
                paid_at: is_cod ? new Date() : undefined,
                reference: is_cod ? 'COD' : undefined
            },
            status: OrderStatus.PENDING,
            status_history: [{
                status: OrderStatus.PENDING,
                timestamp: new Date(),
                updated_by: consumer._id as any,
                actor_role: 'consumer',
                note: 'Order placed'
            }],
            special_instructions
        };

        const created_order = await this.order_repository.create(order_data);

        // 6. Create Payment Record
        const payment_data = {
            order_id: created_order._id,
            consumer_id: created_order.consumer_id,
            retailer_id: created_order.retailer_id,
            amount: total,
            method: payment_method,
            gateway: is_cod ? 'cod' : 'razorpay',
            status: payment_status
        };

        const payment_doc = await PaymentModel.create(payment_data);

        // Notify retailer immediately for COD
        if (is_cod) {
            NotificationUseCase.notify_new_order(store._id as any, store.retailer_id as any, created_order.order_number);
        }

        let razorpay_order: CheckoutResult['razorpay_order'] = undefined;
        if (!is_cod) {
            const created_razorpay_order = await this.payment_service.create_razorpay_order(
                total,
                'INR',
                created_order.order_number
            );

            razorpay_order = created_razorpay_order;

            // Link razorpay order id to payment doc
            await PaymentModel.findByIdAndUpdate(payment_doc._id, {
                gateway_order_id: created_razorpay_order.razorpay_order_id
            });
        }

        // 7. Clear the cart
        const { CartService } = require('./CartService'); // Lazy load to prevent circular deps
        const cart_service = new CartService();
        await cart_service.clear_cart(consumer_id);

        Logger.info(`Successfully created Order ${created_order.order_number} for consumer ${consumer_id}`, 'CheckoutService');
        return {
            order: created_order,
            payment_id: payment_doc._id.toString(),
            razorpay_order
        };
    }
}
