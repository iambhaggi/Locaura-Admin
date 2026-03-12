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
        store_id: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
        retailer_id: { type: Schema.Types.ObjectId, ref: 'Retailer', required: true },
        categories: { type: [String], default: [] },

        name: { type: String, required: true, trim: true },
        slug: { type: String, required: true, lowercase: true, trim: true },
        brand: { type: String, trim: true },
        description: { type: String },

        product_attributes: { type: [ProductAttributeSchema], default: [] },

        base_price: { type: Number, required: true, min: 0 },
        base_compare_at_price: { type: Number, min: 0 },
        

        cover_images: { type: [String], default: [] },

        gender: { type: String, enum: ['men', 'women', 'unisex', 'kids', 'boys', 'girls'] },
        tags: [{ type: String, lowercase: true, trim: true }],

        status: { type: String, enum: ['draft', 'active', 'inactive'], default: 'draft' },
        is_featured: { type: Boolean, default: false },

        total_stock: { type: Number, default: 0 },
        color_count: { type: Number, default: 0 },
        rating: { type: Number, default: 0, min: 0, max: 5 },
        total_reviews: { type: Number, default: 0 },
    },
    { timestamps: true }
);

const ChildProductSchema = new Schema<IChildProduct>(
    {
        parent_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        store_id: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
        retailer_id: { type: Schema.Types.ObjectId, ref: 'Retailer', required: true },
        categories: { type: [String], default: [] },

        color: { type: String, trim: true },
        color_hex: { type: String, trim: true },
        size: { type: String, trim: true },
        length: { type: String, trim: true },
        custom_variation_attributes: { type: [ProductAttributeSchema], default: [] },

        sku: { type: String, required: true, trim: true },
        barcode: { type: String, trim: true },
        variant_label: { type: String, default: '' },

        price: { type: Number, required: true, min: 0 },
        compare_at_price: { type: Number, min: 0 },
        cost_price: { type: Number, min: 0, select: false },

        stock_quantity: { type: Number, required: true, default: 0, min: 0 },
        reserved_quantity: { type: Number, default: 0, min: 0 },

        images: { type: [String], default: [] },

        weight_grams: { type: Number },
        length_cm: { type: Number },
        width_cm: { type: Number },
        height_cm: { type: Number },

        is_active: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// ─────────────────────────────────────────────────────────────────────────────
//  INDEXES
// ─────────────────────────────────────────────────────────────────────────────

// Parent — all listing/browse queries
ParentProductSchema.index({ store_id: 1, status: 1 });
ParentProductSchema.index({ store_id: 1, category_id: 1, status: 1 });
ParentProductSchema.index({ store_id: 1, slug: 1 }, { unique: true });
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
//  EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export const Product = mongoose.model<IProduct>('Product', ParentProductSchema);
export const ChildProduct = mongoose.model<IChildProduct>('ChildProduct', ChildProductSchema);