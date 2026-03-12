import { ConsumerRepository } from '../repositories/ConsumerRepository';
import { ProductRepository } from '../../Retailer/repositories/ProductRepository';
import { IConsumerCart, IConsumer } from '../models/Consumer.model';
import mongoose from 'mongoose';
import { size } from 'zod';

export class CartService {
    private consumer_repository = new ConsumerRepository();
    private product_repository = new ProductRepository();

    async get_cart(consumer_id: string) {
        const consumer = await this.consumer_repository.find_by_id(consumer_id);
        if (!consumer) throw new Error("Consumer not found");

        const cart = consumer.cart;
        
        if (!cart || !cart.items || cart.items.length === 0) {
            return { store_id: cart?.store_id, items: [], subtotal: 0 };
        }

        // 1. Fetch all variants in one go to prevent N+1 queries using Mongoose model directly
        const { ChildProduct, Product } = require('../../Retailer/models/Product.model');
        const variant_ids = cart.items.map(i => i.variant_id);
        const variants = await ChildProduct.find({ _id: { $in: variant_ids } }).lean();

        // 2. Fetch all parent products in one go
        const parent_ids = Array.from(new Set(variants.map((v: any) => v.parent_id)));
        const parents = await Product.find({ _id: { $in: parent_ids } }).select('name').lean();
        const parent_map = new Map(parents.map((p: any) => [p._id.toString(), p.name]));

        const enriched_items = [];
        let subtotal = 0;

        for (const item of cart.items) {
            const variant = variants.find((v: any) => v._id.toString() === item.variant_id.toString());
            if (variant) {
                const item_total = variant.price * item.quantity;
                subtotal += item_total;

                enriched_items.push({
                    variant_id: variant._id,
                    product_name: parent_map.get(variant.parent_id.toString()) || "Unknown Product",
                    variant_sku: variant.sku,
                    variant_label: variant.variant_label,
                    image_url: variant.images && variant.images.length > 0 ? variant.images[0] : undefined,
                    unit_price: variant.price,
                    size: variant.size,
                    quantity: item.quantity,
                    total_price: item_total,
                    stock_available: variant.stock_quantity
                });
            }
        }

        return {
            store_id: cart.store_id,
            items: enriched_items,
            subtotal
        };
    }

    async add_item(consumer_id: string, store_id: string, variant_id: string, quantity: number): Promise<IConsumer | null> {
        const consumer = await this.consumer_repository.find_by_id(consumer_id);
        if (!consumer) throw new Error("Consumer not found");

        const variant = await this.product_repository.get_variant_by_id(variant_id);
        if (!variant || variant.store_id.toString() !== store_id) {
            throw new Error("Invalid variant or store mismatch");
        }

        if (variant.stock_quantity < quantity) {
            throw new Error(`Insufficient stock. Only ${variant.stock_quantity} available.`);
        }

        let current_cart = consumer.cart;

        // SINGLE-STORE RESTRICTION LOGIC (The Zomato / Swiggy behavior)
        if (current_cart.store_id && current_cart.store_id.toString() !== store_id && current_cart.items.length > 0) {
            // They are adding an item from a new store. Wipe the old cart.
            current_cart.items = [];
            current_cart.store_id = new mongoose.Types.ObjectId(store_id);
        } else if (!current_cart.store_id) {
            current_cart.store_id = new mongoose.Types.ObjectId(store_id);
        }

        // Check if item already exists in cart, if so, update quantity instead
        const existing_item_index = current_cart.items.findIndex(i => i.variant_id.toString() === variant_id);
        if (existing_item_index >= 0) {
            const new_qty = current_cart.items[existing_item_index].quantity + quantity;
            if (variant.stock_quantity < new_qty) {
                throw new Error(`Insufficient stock. Cannot add ${quantity} more.`);
            }
            current_cart.items[existing_item_index].quantity = new_qty;
        } else {
            current_cart.items.push({
                variant_id: new mongoose.Types.ObjectId(variant_id),
                quantity
            });
        }

        return await this.consumer_repository.update(consumer_id, { cart: current_cart });
    }

    async update_item_quantity(consumer_id: string, variant_id: string, quantity: number): Promise<IConsumer | null> {
        const consumer = await this.consumer_repository.find_by_id(consumer_id);
        if (!consumer) throw new Error("Consumer not found");

        const variant = await this.product_repository.get_variant_by_id(variant_id);
        if (!variant) throw new Error("Variant not found");

        if (variant.stock_quantity < quantity) {
            throw new Error(`Insufficient stock. Only ${variant.stock_quantity} available.`);
        }

        const items = consumer.cart.items;
        const index = items.findIndex(i => i.variant_id.toString() === variant_id);

        if (index === -1) {
            throw new Error("Item not in cart");
        }

        items[index].quantity = quantity;
        return await this.consumer_repository.update(consumer_id, { cart: consumer.cart });
    }

    async remove_item(consumer_id: string, variant_id: string): Promise<IConsumer | null> {
        const consumer = await this.consumer_repository.find_by_id(consumer_id);
        if (!consumer) throw new Error("Consumer not found");

        consumer.cart.items = consumer.cart.items.filter(i => i.variant_id.toString() !== variant_id);
        
        if (consumer.cart.items.length === 0) {
            consumer.cart.store_id = undefined;
        }

        return await this.consumer_repository.update(consumer_id, { cart: consumer.cart });
    }

    async clear_cart(consumer_id: string): Promise<IConsumer | null> {
        return await this.consumer_repository.update(consumer_id, { 
            cart: { items: [], store_id: undefined } 
        });
    }
}
