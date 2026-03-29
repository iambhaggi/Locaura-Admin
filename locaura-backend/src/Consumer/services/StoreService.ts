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

    async search_stores_and_products(params: {lat?: number, lng?: number, query: string, radius_km?: number}) {
        const { lat, lng, query, radius_km = 10 } = params;
        
        let queryObj: any = {
            status: 'active',
            is_active: true
        };

        // 1. Spatial filter (Only if coordinates are provided)
        if (lat !== undefined && lng !== undefined) {
            const maxDistanceMeters = radius_km * 1000;
            queryObj.location = {
                $near: {
                    $geometry: { type: "Point", coordinates: [lng, lat] },
                    $maxDistance: maxDistanceMeters
                }
            };
        }

        // 2. Find matching stores (Nearby OR by Address/Name if no coordinates)
        const stores = await StoreModel.find(queryObj).select('_id store_name slug logo_url delivery_fee delivery_radius_km rating total_reviews is_open_now address');

        const searchRegex = new RegExp(query, 'i');
        
        // Filter stores based on Name OR Address components
        const matchingStores = stores.filter(s => 
            searchRegex.test(s.store_name) || 
            (s.address && (
                searchRegex.test(s.address.street || '') || 
                searchRegex.test(s.address.city || '') || 
                searchRegex.test(s.address.state || '') ||
                searchRegex.test(s.address.landmark || '')
            ))
        );

        const storeIds = matchingStores.map(s => s._id);

        // 3. Find matching products
        let productQuery: any = { status: 'active' };
        
        // If location is provided, we only want products from nearby stores.
        // If the location search yielded matching stores, we restrict products to those.
        // Otherwise, if no location, we stay global or use the matching stores found.
        if (storeIds.length > 0) {
            productQuery.store_id = { $in: storeIds };
        } else if (lat !== undefined && lng !== undefined) {
            // Location provided but no stores found nearby
            return { stores: [], products: [] };
        }

        const matchingProducts = await ProductModel.find({
            ...productQuery,
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
