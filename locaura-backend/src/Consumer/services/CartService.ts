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
            return { store_id: cart?.store_id, items: [], subtotal: 0, total: 0, delivery_fee: 0, platform_fee: 0 };
        }

        // Backward compatibility: If fields like product_name are missing, perform enrichment manually once (optional but recommended)
        const needs_enrichment = cart.items.some(item => !item.product_name || !item.price) || (cart.store_id && !cart.store_name);
        
        if (needs_enrichment) {
            // Re-use logic from add_item to populate missing fields and save
            if (cart.store_id && !cart.store_name) {
                const Store = require('../../Retailer/models/Store.model').default;
                const store = await Store.findById(cart.store_id).select('store_name');
                cart.store_name = store?.store_name || "Partner Store";
            }

            for (const item of cart.items) {
                if (!item.product_name) {
                   const variant = await this.product_repository.get_variant_by_id(item.variant_id.toString());
                   if (variant) {
                       const parent = await require('../../Retailer/models/Product.model').Product.findById(variant.parent_id);
                       item.product_id = new mongoose.Types.ObjectId(variant.parent_id.toString());
                       item.product_name = parent?.name;
                       item.brand_name = parent?.brand;
                       item.price = variant.price;
                       item.thumb_url = variant.images?.[0] || parent?.cover_images?.[0];
                   }
                }
            }
            this._calculate_cart_totals(cart);
            await this.consumer_repository.update(consumer_id, { cart: cart });
        }

        return {
            store_id: cart.store_id,
            store_name: cart.store_name,
            items: cart.items.map(i => ({
                product_id: i.product_id,
                variant_id: i.variant_id,
                quantity: i.quantity,
                product_name: i.product_name,
                brand_name: i.brand_name,
                price: i.price,
                thumb_url: i.thumb_url,
                variant_sku: i.variant_sku,
                variant_label: i.variant_label,
                size: i.size,
                color: i.color,
                total_price: (i.price || 0) * i.quantity
            })),
            subtotal: cart.subtotal || 0,
            delivery_fee: cart.delivery_fee || 0,
            platform_fee: cart.platform_fee || 0,
            total: cart.total || 0
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
            const Store = require('../../Retailer/models/Store.model').default;
            const store = await Store.findById(store_id).select('store_name');
            current_cart.store_name = store?.store_name || "Partner Store";
        } else if (!current_cart.store_id) {
            current_cart.store_id = new mongoose.Types.ObjectId(store_id);
            const Store = require('../../Retailer/models/Store.model').default;
            const store = await Store.findById(store_id).select('store_name');
            current_cart.store_name = store?.store_name || "Partner Store";
        }

        // Check if item already exists in cart, if so, update quantity instead
        const existing_item_index = current_cart.items.findIndex(i => i.variant_id.toString() === variant_id);

        const { Product } = require('../../Retailer/models/Product.model');
        const parent = await Product.findById(variant.parent_id);

        const item_data = {
            variant_id: new mongoose.Types.ObjectId(variant_id),
            quantity,
            product_id: new mongoose.Types.ObjectId(variant.parent_id.toString()),
            product_name: parent?.name || "Product",
            brand_name: parent?.brand || "",
            price: variant.price,
            thumb_url: variant.images?.[0] || parent?.cover_images?.[0],
            variant_sku: variant.sku,
            variant_label: variant.variant_label,
            size: variant.size,
            color: variant.color
        };

        if (existing_item_index >= 0) {
            const new_qty = current_cart.items[existing_item_index].quantity + quantity;
            if (variant.stock_quantity < new_qty) {
                throw new Error(`Insufficient stock. Cannot add ${quantity} more.`);
            }
            current_cart.items[existing_item_index].quantity = new_qty;
            // Update cached fields in case they changed
            current_cart.items[existing_item_index].price = variant.price;
            current_cart.items[existing_item_index].product_name = item_data.product_name;
        } else {
            current_cart.items.push(item_data);
        }

        this._calculate_cart_totals(current_cart);

        return await this.consumer_repository.update(consumer_id, { cart: current_cart });
    }

    private _calculate_cart_totals(cart: IConsumerCart) {
        let subtotal = 0;
        for (const item of cart.items) {
            subtotal += (item.price || 0) * item.quantity;
        }

        cart.subtotal = subtotal; // The Subtotal is the total cost of all product items in your cart before extra fees like delivery or platform charges are added.
        cart.platform_fee = 17; // Configurable
        cart.delivery_fee = subtotal > 3000 ? 0 : 40; // Example dynamic logic
        cart.total = subtotal + cart.platform_fee + cart.delivery_fee;
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
        this._calculate_cart_totals(consumer.cart);
        return await this.consumer_repository.update(consumer_id, { cart: consumer.cart });
    }

    async remove_item(consumer_id: string, variant_id: string): Promise<IConsumer | null> {
        const consumer = await this.consumer_repository.find_by_id(consumer_id);
        if (!consumer) throw new Error("Consumer not found");

        consumer.cart.items = consumer.cart.items.filter(i => i.variant_id.toString() !== variant_id);
        
        if (consumer.cart.items.length === 0) {
            consumer.cart.store_id = undefined;
            consumer.cart.subtotal = 0;
            consumer.cart.total = 0;
        } else {
            this._calculate_cart_totals(consumer.cart);
        }

        return await this.consumer_repository.update(consumer_id, { cart: consumer.cart });
    }

    async clear_cart(consumer_id: string): Promise<IConsumer | null> {
        return await this.consumer_repository.update(consumer_id, { 
            cart: { items: [], store_id: undefined, subtotal: 0, total: 0, delivery_fee: 0, platform_fee: 0 } 
        });
    }
}
