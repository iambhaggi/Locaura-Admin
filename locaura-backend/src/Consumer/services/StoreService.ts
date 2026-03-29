import { Request, Response } from 'express';
import StoreModel from '../../Retailer/models/Store.model';
import { Product as ProductModel } from '../../Retailer/models/Product.model';
import mongoose from 'mongoose';

export class StoreService {
    
    async get_nearby_stores(lat: number, lng: number, maxDistanceKm: number = 10, category?: string) {
        // GeoJSON uses meters for $maxDistance
        const maxDistanceMeters = maxDistanceKm * 1000;
        
        const query: any = {
            status: 'active', // Assuming RetailerStatus.ACTIVE
            is_active: true,   // Store owner hasn't paused the store
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [lng, lat]
                    },
                    $maxDistance: maxDistanceMeters
                }
            }
        };

        if (category) {
            query.categories = category;
        }

        // Only return basic display fields to consumer
        return await StoreModel.find(query)
            .select('store_name slug description logo_url banner_url business_hours rating total_reviews delivery_radius_km min_order_amount delivery_fee is_delivery_available is_open_now categories location')
            .limit(50);
    }
    
    async get_store_details(store_id: string) {
        const store = await StoreModel.findById(store_id)
            .select('-bank_details -gstin -pan_card'); // Sensitive info stripped
            
        if (!store || !store.is_active || store.status !== 'active') {
            throw new Error("Store not found or unavailable");
        }
        
        return store;
    }

    async get_store_products(store_id: string, category?: string) {
        const query: any = { 
            store_id: new mongoose.Types.ObjectId(store_id),
            status: 'active'
        };
        
        if (category) {
            query.categories = category;
        }
        
        // Return Parent products. The client can fetch Child variants later or we populate them.
        return await ProductModel.find(query).sort({ is_featured: -1, createdAt: -1 });
    }

    async get_product_details(product_id: string) {
        const product = await ProductModel.findById(product_id);
        if (!product || product.status !== 'active') {
            throw new Error("Product not found or unavailable");
        }

        // Fetch all active child variants for this parent
        const variants = await mongoose.model('ChildProduct').find({
            parent_id: product._id,
            is_active: true
        });

        return {
            ...product.toObject(),
            variants
        };
    }

    async search_stores_and_products(params: {lat: number, lng: number, query: string, radius_km: number}) {
        const { lat, lng, query, radius_km } = params;
        const maxDistanceMeters = radius_km * 1000;
        
        // Find nearby active stores
        const nearbyStores = await StoreModel.find({
            status: 'active',
            is_active: true,
            location: {
                $near: {
                    $geometry: { type: "Point", coordinates: [lng, lat] },
                    $maxDistance: maxDistanceMeters
                }
            }
        }).select('_id store_name slug logo_url delivery_fee delivery_radius_km rating total_reviews is_open_now');

        const storeIds = nearbyStores.map(s => s._id);

        if (storeIds.length === 0) {
            return { stores: [], products: [] };
        }

        const searchRegex = new RegExp(query, 'i');
        const matchingStores = nearbyStores.filter(s => searchRegex.test(s.store_name));

        const matchingProducts = await ProductModel.find({
            store_id: { $in: storeIds },
            status: 'active',
            $or: [
                { name: { $regex: searchRegex } },
                { description: { $regex: searchRegex } },
                { tags: { $regex: searchRegex } },
                { brand: { $regex: searchRegex } },
                { categories: { $regex: searchRegex } }
            ]
        })
        .select('_id name description base_price base_compare_at_price cover_images store_id categories brand rating total_reviews slug')
        .populate({
            path: 'store_id',
            select: 'store_name slug logo_url delivery_fee delivery_radius_km rating total_reviews'
        })
        .limit(50);

        return {
            stores: matchingStores,
            products: matchingProducts
        };
    }
}
