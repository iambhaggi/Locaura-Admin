/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  LOCAURA — PARENT / CHILD PRODUCT ARCHITECTURE  (Amazon-style for clothing)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  HOW AMAZON ACTUALLY WORKS
 *  ─────────────────────────
 *  Amazon calls this the "variation family". One URL = one Parent. Every distinct
 *  purchasable combination (Red/XL, Blue/S) is a separate Child document — a
 *  full first-class product in their catalog, not just a sub-document array.
 *
 *  WHY THIS MATTERS VS A SIMPLE EMBEDDED VARIANTS ARRAY
 *  ─────────────────────────────────────────────────────
 *  Embedded arrays (the old model):
 *    ✗ Can't query "all Red variants across all shirts" efficiently
 *    ✗ Can't index individual variant stock for atomic updates at scale
 *    ✗ Product document grows unboundedly (100 colors × 10 sizes = 1000 subdocs)
 *    ✗ Child can't have its own SEO slug, reviews, or lifecycle
 *    ✗ 16MB BSON document limit becomes real at catalogue scale
 *
 *  Parent/Child (this model):
 *    ✓ Children are separate documents — independently queryable/indexable
 *    ✓ Stock reservation is one atomic findOneAndUpdate on a child doc
 *    ✓ Aggregate "all sizes of this shirt" = { parent_id: X }
 *    ✓ Each child owns its SKU, barcode, price, images, stock
 *    ✓ Parent holds the shared content (description, brand, fit guide)
 *    ✓ Variation axes are declared on Parent, rendered as selectors on UI
 *
 *  DOCUMENT STRUCTURE
 *  ──────────────────
 *
 *  ParentProduct  (1)
 *     name:         "Allen Solly Slim Fit Oxford Shirt"
 *     variation_axes: ['color', 'size']
 *     shared_attributes: [{ name:'Material', value:'100% Cotton' }, ...]
 *     base_price: 1299
 *
 *  ChildProduct (n per parent — one per unique combination)
 *     parent_id → ParentProduct
 *     color: 'Red', color_hex: '#C0392B', size: 'S'
 *     sku: 'SHRT-RED-S', price: 1299, stock_quantity: 45
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IProductAttribute {
    name: string;
    value: string;
}

export interface IProduct extends Document {
    _id: mongoose.Types.ObjectId;
    store_id: mongoose.Types.ObjectId;
    retailer_id: mongoose.Types.ObjectId;
    categories: string[];

    name: string;
    slug: string;
    brand?: string;
    description?: string;


    base_price: number;
    base_compare_at_price?: number;
    product_attributes: IProductAttribute[];
    cover_images: string[];
    gender?: 'men' | 'women' | 'unisex' | 'kids' | 'boys' | 'girls';
    tags: string[];

    status: 'draft' | 'active' | 'inactive';
    is_featured: boolean;

    total_stock: number;
    color_count: number;
    rating: number;
    total_reviews: number;

    createdAt: Date;
    updatedAt: Date;
}

export interface IChildProduct extends Document {
    _id: mongoose.Types.ObjectId;
    parent_id: mongoose.Types.ObjectId;

    store_id: mongoose.Types.ObjectId;
    retailer_id: mongoose.Types.ObjectId;
    categories: string[];

    color?: string;
    color_hex?: string;
    size?: string;
    length?: string;
    custom_variation_attributes: IProductAttribute[];

    sku: string;
    barcode?: string;
    variant_label: string; // This is the label that will be displayed on the product page eg. "Red / S"

    price: number;
    compare_at_price?: number;
    cost_price?: number;

    stock_quantity: number;
    reserved_quantity: number;

    images: string[];
    weight_grams?: number;
    length_cm?: number;
    width_cm?: number;
    height_cm?: number;

    is_active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ProductAttributeSchema = new Schema<IProductAttribute>(
    { name: { type: String, required: true, trim: true }, value: { type: String, required: true, trim: true } },
    { _id: false }
);

const ParentProductSchema = new Schema<IProduct>(
    {
        // === CORE RELATIONS ===
        store_id: { type: Schema.Types.ObjectId, ref: 'Store', required: true }, // Links product to a specific store instance
        retailer_id: { type: Schema.Types.ObjectId, ref: 'Retailer', required: true }, // Links product to the business owner
        categories: { type: [String], default: [] }, // Broad organizational buckets (e.g., ['Clothing', 'Men'])

        // === GLOBAL PRODUCT DETAILS ===
        name: { type: String, required: true, trim: true }, // Primary display name
        slug: { type: String, required: true, lowercase: true, trim: true }, // URL-friendly identifier derived from name
        brand: { type: String, trim: true }, // Brand attribution (e.g. 'Roadster')
        description: { type: String }, // Long-form rich text or HTML description

        // === SHARED / GLOBAL ATTRIBUTES ===
        product_attributes: { type: [ProductAttributeSchema], default: [] }, // Non-variant specs (e.g., {name: 'Material', value: 'Cotton'})

        // === PRICING (Defaults) ===
        base_price: { type: Number, required: true, min: 0 }, // Master selling price (used if variant has no override)
        base_compare_at_price: { type: Number, min: 0 }, // Master 'original' strikethrough price to show discounts
        
        // === MEDIA ===
        cover_images: { type: [String], default: [] }, // General product gallery images shown on category/search pages

        // === METADATA & DISCOVERABILITY ===
        gender: { type: String, enum: ['men', 'women', 'unisex', 'kids', 'boys', 'girls'] }, // Target demographic for filtering
        tags: [{ type: String, lowercase: true, trim: true }], // Tags for internal organization, SEO, or search (e.g. 'summer-sale')

        // === LIFECYCLE ===
        status: { type: String, enum: ['draft', 'active', 'inactive'], default: 'draft' }, // Controls visibility on storefront
        is_featured: { type: Boolean, default: false }, // Pin to top/featured collections on storefront

        // === AGGREGATED CACHE (Usually updated via hooks/cron) ===
        total_stock: { type: Number, default: 0 }, // Sum of all child products' stock_quantity
        color_count: { type: Number, default: 0 }, // Quantity of unique color variants (used for "Available in 3 colors" UI)
        rating: { type: Number, default: 0, min: 0, max: 5 }, // Average review score
        total_reviews: { type: Number, default: 0 }, // Total number of reviews received for this parent
    },
    { timestamps: true }
);

const ChildProductSchema = new Schema<IChildProduct>(
    {
        // === CORE RELATIONS ===
        parent_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true }, // Links to the master Product document
        store_id: { type: Schema.Types.ObjectId, ref: 'Store', required: true }, // Denormalized for faster direct queries and security
        retailer_id: { type: Schema.Types.ObjectId, ref: 'Retailer', required: true }, // Denormalized for authorization checks
        categories: { type: [String], default: [] }, // Denormalized from parent for independent variant filtering

        // === VARIATION PERMUTATION DEFS ===
        color: { type: String, trim: true }, // e.g., 'Red'
        color_hex: { type: String, trim: true }, // e.g., '#FF0000' (used to draw color swatches in UI)
        size: { type: String, trim: true }, // e.g., 'XL'
        length: { type: String, trim: true }, // e.g., 'Long', '32' (often used in pants)
        custom_variation_attributes: { type: [ProductAttributeSchema], default: [] }, // For any axis not covered above

        // === IDENTIFIERS ===
        sku: { type: String, required: true, trim: true }, // UNIQUE Stock Keeping Unit for this exact variation
        barcode: { type: String, trim: true }, // UPC/EAN for physical scanning
        variant_label: { type: String, default: '' }, // Auto-generated human-readable label: "Red / XL"

        // === EXPLICIT VARIANT PRICING ===
        price: { type: Number, required: true, min: 0 }, // Actual selling cost of this specific variant
        compare_at_price: { type: Number, min: 0 }, // Original price for this variant
        cost_price: { type: Number, min: 0, select: false }, // Internal cost to retailer (hidden from API by default via select: false)

        // === INVENTORY MANAGEMENT ===
        stock_quantity: { type: Number, required: true, default: 0, min: 0 }, // Total physical units sitting in warehouse
        reserved_quantity: { type: Number, default: 0, min: 0 }, // Units placed in active checkouts/carts but not yet deducted

        // === OVERRIDES ===
        images: { type: [String], default: [] }, // Specific images ONLY for this variant (e.g. photos of the Red shirt)

        // === PHYSICAL DIMENSIONS (For Shipping Calculations) ===
        weight_grams: { type: Number },
        length_cm: { type: Number },
        width_cm: { type: Number },
        height_cm: { type: Number },

        // === LIFECYCLE ===
        is_active: { type: Boolean, default: true }, // If false, this variant is hidden from users even if Parent is Active
    },
    { timestamps: true }
);

// ─────────────────────────────────────────────────────────────────────────────
//  INDEXES
// ─────────────────────────────────────────────────────────────────────────────

// Parent — all listing/browse queries
ParentProductSchema.index({ store_id: 1, status: 1 });
// ParentProductSchema.index({ store_id: 1, slug: 1 });
ParentProductSchema.index({ store_id: 1, brand: 1, status: 1 });
ParentProductSchema.index({ store_id: 1, gender: 1, status: 1 });
ParentProductSchema.index({ store_id: 1, is_featured: 1, status: 1 });
ParentProductSchema.index({ store_id: 1, tags: 1 });
ParentProductSchema.index({ store_id: 1, total_stock: 1 });
ParentProductSchema.index({ store_id: 1, base_price: 1 });
ParentProductSchema.index({ store_id: 1, rating: -1 });
ParentProductSchema.index({
    name: 'text', brand: 'text', tags: 'text', 'shared_attributes.value': 'text'
});

// Child — variant resolution and stock ops
ChildProductSchema.index({ parent_id: 1, is_active: 1 });
ChildProductSchema.index({ parent_id: 1, color: 1, is_active: 1 });
ChildProductSchema.index({ parent_id: 1, size: 1, is_active: 1 });
ChildProductSchema.index({ store_id: 1, sku: 1 }, { unique: true });
ChildProductSchema.index({ store_id: 1, is_active: 1 });
ChildProductSchema.index({ store_id: 1, color: 1, is_active: 1 });
ChildProductSchema.index({ barcode: 1 }, { sparse: true });
// Hot path for atomic stock reservation
ChildProductSchema.index({ _id: 1, stock_quantity: 1, reserved_quantity: 1 });

// ─────────────────────────────────────────────────────────────────────────────
//  HOOKS
// ─────────────────────────────────────────────────────────────────────────────

ChildProductSchema.pre('save', function (this: IChildProduct) {
    const parts: string[] = [];
    if (this.color) parts.push(this.color);
    if (this.size) parts.push(this.size);
    if (this.length) parts.push(this.length);
    this.custom_variation_attributes.forEach((a) => parts.push(a.value));
    if (parts.length > 0) this.variant_label = parts.join(' / ');
});

// ─────────────────────────────────────────────────────────────────────────────
//  PARENT HOOKS
// ─────────────────────────────────────────────────────────────────────────────

ParentProductSchema.pre('validate', function (this: IProduct, next) {
    if (this.name && !this.slug) {
        // Simple slugify: lowercase, remove non-alphanumeric, replace spaces with hyphens
        this.slug = this.name
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
    }
});

// ─────────────────────────────────────────────────────────────────────────────
//  EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export const Product = mongoose.model<IProduct>('Product', ParentProductSchema);
export const ChildProduct = mongoose.model<IChildProduct>('ChildProduct', ChildProductSchema);