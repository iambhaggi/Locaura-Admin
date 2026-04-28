const { createCategoryModel } = require('../models/AppCategory');
const { createNotificationModel } = require('../models/AppNotification');
const { createOrderModel } = require('../models/AppOrder');
const { createPaymentModel } = require('../models/AppPayment');
const { createPayoutModel } = require('../models/AppPayout');
const { createProductModel, createChildProductModel } = require('../models/AppProduct');
const { createRetailerModel } = require('../models/AppRetailer');
const { createReviewModel } = require('../models/AppReview');
const { createStoreModel } = require('../models/AppStore');
const { createConsumerModel } = require('../models/AppConsumer');
const { createRiderEarningModel, createRiderPayoutModel } = require('../models/AppRiderEarnings');
const mongoose = require('mongoose');

const toObjectId = (value) => {
  if (!value) return null;
  if (value instanceof mongoose.Types.ObjectId) return value;
  return mongoose.Types.ObjectId.isValid(value) ? new mongoose.Types.ObjectId(value) : null;
};

const toNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const buildStoreQuery = (search = '', extraFilters = {}) => {
  const query = {
    ...extraFilters,
  };

  if (search) {
    query.$or = [
      { store_name: new RegExp(search, 'i') },
      { store_email: new RegExp(search, 'i') },
    ];
  }

  return query;
};

const buildStoreCreatePayload = (body = {}) => {
  const categories = Array.isArray(body.categories)
    ? body.categories
    : typeof body.categories === 'string' && body.categories.trim()
      ? body.categories.split(',').map((category) => category.trim()).filter(Boolean)
      : [];

  return {
    retailer_id: body.retailer_id,
    store_name: body.store_name,
    slug: body.slug,
    store_phone: body.store_phone,
    store_email: body.store_email,
    description: body.description,
    business_type: body.business_type,
    logo_url: body.logo_url,
    banner_url: body.banner_url,
    social_links: body.social_links || {
      instagram: body.instagram || '',
      whatsapp: body.whatsapp || '',
    },
    address: body.address || {
      shop_number: body.shop_number || '',
      building_name: body.building_name || '',
      street: body.street,
      city: body.city,
      state: body.state,
      zip_code: body.zip_code,
      landmark: body.landmark || '',
    },
    location: body.location,
    gstin: body.gstin,
    fssai_license: body.fssai_license,
    bank_details: body.bank_details || {
      account_number: body.account_number || '',
      ifsc_code: body.ifsc_code || '',
      account_holder_name: body.account_holder_name || '',
    },
    store_images: Array.isArray(body.store_images) ? body.store_images : [],
    categories,
    business_hours: Array.isArray(body.business_hours) ? body.business_hours : [],
    delivery_radius_km: body.delivery_radius_km,
    min_order_amount: body.min_order_amount,
    delivery_fee: body.delivery_fee,
    is_delivery_available: body.is_delivery_available,
    is_active: typeof body.is_active === 'boolean' ? body.is_active : undefined,
    status: body.status,
    is_approved: typeof body.is_approved === 'boolean' ? body.is_approved : undefined,
    approved_at: body.approved_at,
    approved_by_admin_id: body.approved_by_admin_id,
    rejection_reason: body.rejection_reason,
    rating: body.rating,
    total_reviews: body.total_reviews,
  };
};

// Get all consumers from app
exports.getConsumers = async (req, res) => {
  try {
    const Consumer = await createConsumerModel();
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;

    const query = search ? {
      $or: [
        { consumer_name: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ]
    } : {};

    const consumers = await Consumer.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Consumer.countDocuments(query);

    res.json({
      success: true,
      data: consumers,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching consumers:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all categories from app
exports.getCategories = async (req, res) => {
  try {
    const Category = await createCategoryModel();
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;

    const query = search ? { name: new RegExp(search, 'i') } : {};
    const categories = await Category.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Category.countDocuments(query);

    res.json({
      success: true,
      data: categories,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all retailers from app
exports.getRetailers = async (req, res) => {
  try {
    const Retailer = await createRetailerModel();
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;

    const query = search ? {
      $or: [
        { retailer_name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') }
      ]
    } : {};

    const retailers = await Retailer.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Retailer.countDocuments(query);

    res.json({
      success: true,
      data: retailers,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching retailers:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create a new store submission (retailer-side)
exports.createStore = async (req, res) => {
  try {
    const Store = await createStoreModel();
    const Retailer = await createRetailerModel();
    const payload = buildStoreCreatePayload(req.body || {});

    if (!payload.retailer_id) {
      return res.status(400).json({ success: false, message: 'retailer_id is required' });
    }

    if (!payload.store_name || !payload.store_phone || !payload.store_email || !payload.address?.street || !payload.address?.city || !payload.address?.state || !payload.address?.zip_code) {
      return res.status(400).json({
        success: false,
        message: 'Store name, contact details, and address fields are required',
      });
    }

    const retailerExists = await Retailer.findById(payload.retailer_id).lean();
    if (!retailerExists) {
      return res.status(404).json({ success: false, message: 'Retailer not found' });
    }

    const existingStore = await Store.findOne({
      retailer_id: payload.retailer_id,
      store_name: payload.store_name,
    }).lean();

    if (existingStore) {
      return res.status(409).json({ success: false, message: 'A store with this name already exists for the retailer' });
    }

    const store = new Store({
      ...payload,
      status: payload.status || 'PENDING',
      is_active: typeof payload.is_active === 'boolean' ? payload.is_active : false,
      is_approved: typeof payload.is_approved === 'boolean' ? payload.is_approved : false,
    });

    const savedStore = await store.save();

    res.status(201).json({
      success: true,
      message: 'Store submitted for approval',
      data: savedStore.toObject(),
    });
  } catch (error) {
    console.error('Error creating store:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all stores from app
exports.getStores = async (req, res) => {
  try {
    const Store = await createStoreModel();
    const page = toNumber(req.query.page, 1);
    const limit = toNumber(req.query.limit, 1000);
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    const query = buildStoreQuery(search);

    const stores = await Store.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('+bank_details')
      .lean();

    const total = await Store.countDocuments(query);

    res.json({
      success: true,
      data: stores,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get pending stores for admin approval
exports.getPendingStores = async (req, res) => {
  try {
    const Store = await createStoreModel();
    const page = toNumber(req.query.page, 1);
    const limit = toNumber(req.query.limit, 1000);
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    const query = {
      $and: [
        search
          ? {
              $or: [
                { store_name: new RegExp(search, 'i') },
                { store_email: new RegExp(search, 'i') },
              ],
            }
          : {},
        {
          $or: [
            { is_approved: false },
            { is_approved: { $exists: false } },
            { status: 'PENDING' },
            { status: 'pending' },
          ],
        },
      ].filter((part) => Object.keys(part).length > 0),
    };

    const stores = await Store.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('+bank_details')
      .lean();

    const total = await Store.countDocuments(query);

    res.json({
      success: true,
      data: stores,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching pending stores:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Approve or reject a store
exports.approveStore = async (req, res) => {
  try {
    const Store = await createStoreModel();
    const { storeId } = req.params;
    const statusValue = String(req.body?.status || 'active').trim().toLowerCase();

    const isActive = statusValue === 'active' || statusValue === 'approved';
    const isRejected = statusValue === 'rejected' || statusValue === 'reject';

    if (!isActive && !isRejected) {
      return res.status(400).json({ success: false, message: 'Invalid status value. Use "active" or "rejected".' });
    }

    const updatePayload = {
      is_approved: isActive,
      is_active: isActive,
      status: isActive ? 'active' : 'rejected',
      approved_at: isActive ? new Date() : null,
      approved_by_admin_id: req.user?.id,
      rejection_reason: isRejected ? (req.body?.rejection_reason || 'Rejected by admin') : null,
    };

    const updatedStore = await Store.findByIdAndUpdate(
      storeId,
      updatePayload,
      { new: true }
    ).lean();

    if (!updatedStore) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    res.json({
      success: true,
      message: isActive ? 'Store approved successfully' : 'Store rejected successfully',
      data: updatedStore,
    });
  } catch (error) {
    console.error('Error approving store:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Reject a store
exports.rejectStore = async (req, res) => {
  try {
    const Store = await createStoreModel();
    const { storeId } = req.params;
    const { rejection_reason = 'Rejected by admin' } = req.body || {};

    const updatedStore = await Store.findByIdAndUpdate(
      storeId,
      {
        is_approved: false,
        status: 'REJECTED',
        is_active: false,
        approved_at: null,
        approved_by_admin_id: req.user?.id,
        rejection_reason,
      },
      { new: true }
    ).lean();

    if (!updatedStore) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    res.json({
      success: true,
      message: 'Store rejected successfully',
      data: updatedStore,
    });
  } catch (error) {
    console.error('Error rejecting store:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all products from app
exports.getProducts = async (req, res) => {
  try {
    const Product = await createProductModel();
    const { page = 1, limit = 10, search = '', store_id } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { brand: new RegExp(search, 'i') }
      ];
    }
    if (store_id) query.store_id = store_id;

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all orders from app
exports.getOrders = async (req, res) => {
  try {
    const Order = await createOrderModel();
    const { page = 1, limit = 10, status, store_id } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (status) query.status = status;
    if (store_id) query.store_id = store_id;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all payments from app
exports.getPayments = async (req, res) => {
  try {
    const Payment = await createPaymentModel();
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const query = status ? { status } : {};

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      data: payments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all reviews from app
exports.getReviews = async (req, res) => {
  try {
    const Review = await createReviewModel();
    const { page = 1, limit = 10, store_id, rating } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (store_id) query.store_id = store_id;
    if (rating) query.rating = parseInt(rating);

    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Review.countDocuments(query);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all payouts from app
exports.getPayouts = async (req, res) => {
  try {
    const Payout = await createPayoutModel();
    const { page = 1, limit = 10, status, retailer_id } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (status) query.status = status;
    if (retailer_id) query.retailer_id = retailer_id;

    const payouts = await Payout.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Payout.countDocuments(query);

    res.json({
      success: true,
      data: payouts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching payouts:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all rider earnings from app
exports.getRiderEarnings = async (req, res) => {
  try {
    const RiderEarning = await createRiderEarningModel();
    await createOrderModel();
    const { rider_id, page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (rider_id) query.rider_id = rider_id;
    if (status) query.status = status;

    const earnings = await RiderEarning.find(query)
      .populate('order_id', 'order_number')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await RiderEarning.countDocuments(query);

    res.json({
      success: true,
      data: earnings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching rider earnings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all rider payouts from app
exports.getRiderPayouts = async (req, res) => {
  try {
    const RiderPayout = await createRiderPayoutModel();
    const { rider_id, page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (rider_id) query.rider_id = rider_id;
    if (status) query.status = status;

    const payouts = await RiderPayout.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await RiderPayout.countDocuments(query);

    res.json({
      success: true,
      data: payouts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching rider payouts:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all child product variants from app
exports.getProductVariants = async (req, res) => {
  try {
    const ChildProduct = await createChildProductModel();
    const { page = 1, limit = 10, search = '', parent_id, store_id } = req.query;
    const skip = (page - 1) * limit;

    const match = {};
    if (parent_id) match.parent_id = new require('mongoose').Types.ObjectId(parent_id);
    if (store_id) match.store_id = new require('mongoose').Types.ObjectId(store_id);
    if (search) {
      match.$or = [
        { sku: new RegExp(search, 'i') },
        { variant_label: new RegExp(search, 'i') },
        { color: new RegExp(search, 'i') },
        { barcode: new RegExp(search, 'i') }
      ];
    }

    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: 'products',
          localField: 'parent_id',
          foreignField: '_id',
          as: 'parent_product'
        }
      },
      {
        $addFields: {
          parent_name: { $ifNull: [{ $arrayElemAt: ['$parent_product.name', 0] }, null] }
        }
      },
      { $project: { parent_product: 0 } },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit, 10) }
    ];

    const variants = await ChildProduct.aggregate(pipeline);
    const total = await ChildProduct.countDocuments(match);

    res.json({
      success: true,
      data: variants,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching product variants:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create a new consumer in app DB
exports.createConsumer = async (req, res) => {
  try {
    const Consumer = await createConsumerModel();
    const {
      consumer_name,
      email,
      phone,
      otp,
      otp_expiry,
      phone_verified = false,
      status = 'active',
      addresses = [],
      cart,
      fcm_token,
    } = req.body || {};

    if (!consumer_name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'consumer_name, email and phone are required',
      });
    }

    const existing = await Consumer.findOne({ phone }).lean();
    if (existing) {
      return res.status(409).json({ success: false, message: 'Consumer already exists with this phone' });
    }

    const consumer = new Consumer({
      consumer_name,
      email,
      phone,
      otp,
      otp_expiry,
      phone_verified,
      status,
      addresses: Array.isArray(addresses) ? addresses : [],
      cart: cart && typeof cart === 'object' ? cart : undefined,
      fcm_token: fcm_token || '',
    });

    const saved = await consumer.save();
    res.status(201).json({ success: true, message: 'Consumer created successfully', data: saved.toObject() });
  } catch (error) {
    console.error('Error creating consumer:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create a new retailer in app DB
exports.createRetailer = async (req, res) => {
  try {
    const Retailer = await createRetailerModel();
    const {
      retailer_name,
      pan_card,
      email,
      phone,
      phone_verified = false,
      email_verified = false,
      otp,
      otp_expiry,
      fcm_token,
    } = req.body || {};

    if (!retailer_name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'retailer_name, email and phone are required',
      });
    }

    const duplicatePhone = await Retailer.findOne({ phone }).lean();
    if (duplicatePhone) {
      return res.status(409).json({ success: false, message: 'Retailer already exists with this phone' });
    }

    const retailer = new Retailer({
      retailer_name,
      pan_card,
      email,
      phone,
      phone_verified,
      email_verified,
      otp,
      otp_expiry,
      fcm_token: fcm_token || '',
    });

    const saved = await retailer.save();
    res.status(201).json({ success: true, message: 'Retailer created successfully', data: saved.toObject() });
  } catch (error) {
    console.error('Error creating retailer:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Upsert consumer cart in app DB
exports.createCart = async (req, res) => {
  try {
    const Consumer = await createConsumerModel();
    const {
      consumer_id,
      store_id,
      store_name,
      items = [],
      items_count,
      total_value,
      subtotal,
      platform_fee,
      delivery_fee,
      total,
    } = req.body || {};

    if (!consumer_id || !store_id || !store_name) {
      return res.status(400).json({
        success: false,
        message: 'consumer_id, store_id and store_name are required',
      });
    }

    const consumerObjectId = toObjectId(consumer_id);
    const storeObjectId = toObjectId(store_id);
    if (!consumerObjectId || !storeObjectId) {
      return res.status(400).json({ success: false, message: 'consumer_id and store_id must be valid ObjectId values' });
    }

    const mappedItems = Array.isArray(items) && items.length > 0
      ? items.map((item) => ({
          product_id: toObjectId(item.product_id) || new mongoose.Types.ObjectId(),
          variant_id: toObjectId(item.variant_id) || new mongoose.Types.ObjectId(),
          quantity: Math.max(1, toNumber(item.quantity, 1)),
          product_name: item.product_name || '',
          brand_name: item.brand_name || '',
          price: toNumber(item.price, 0),
          thumb_url: item.thumb_url || '',
          variant_sku: item.variant_sku || '',
          variant_label: item.variant_label || '',
          size: item.size || '',
          color: item.color || '',
        }))
      : [
          {
            product_id: new mongoose.Types.ObjectId(),
            variant_id: new mongoose.Types.ObjectId(),
            quantity: Math.max(1, toNumber(items_count, 1)),
            product_name: 'Cart Item',
            price: toNumber(total_value, 0),
            variant_label: 'Default',
            variant_sku: 'N/A',
          },
        ];

    const cartTotals = {
      subtotal: toNumber(subtotal, toNumber(total_value, 0)),
      platform_fee: toNumber(platform_fee, 0),
      delivery_fee: toNumber(delivery_fee, 0),
      total: toNumber(total, toNumber(total_value, 0)),
    };

    const updated = await Consumer.findByIdAndUpdate(
      consumerObjectId,
      {
        $set: {
          cart: {
            store_id: storeObjectId,
            store_name,
            items: mappedItems,
            ...cartTotals,
          },
        },
      },
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Consumer not found' });
    }

    res.status(201).json({ success: true, message: 'Cart saved successfully', data: updated.cart });
  } catch (error) {
    console.error('Error saving cart:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create a new order in app DB
exports.createOrder = async (req, res) => {
  try {
    const Order = await createOrderModel();
    const body = req.body || {};

    const requiredKeys = ['store_id', 'retailer_id', 'consumer_id', 'delivery_address', 'payment'];
    const missing = requiredKeys.filter((key) => !body[key]);
    if (missing.length > 0) {
      return res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(', ')}` });
    }

    const storeId = toObjectId(body.store_id);
    const retailerId = toObjectId(body.retailer_id);
    const consumerId = toObjectId(body.consumer_id);
    if (!storeId || !retailerId || !consumerId) {
      return res.status(400).json({ success: false, message: 'store_id, retailer_id and consumer_id must be valid ObjectId values' });
    }

    const orderNumber = body.order_number || `ORD-${Date.now()}`;
    const items = Array.isArray(body.items) && body.items.length > 0
      ? body.items.map((item) => ({
          product_id: toObjectId(item.product_id) || new mongoose.Types.ObjectId(),
          variant_id: toObjectId(item.variant_id) || new mongoose.Types.ObjectId(),
          product_name: item.product_name || 'Product',
          variant_sku: item.variant_sku || 'SKU',
          variant_label: item.variant_label || 'Variant',
          image_url: item.image_url || '',
          quantity: Math.max(1, toNumber(item.quantity, 1)),
          unit_price: toNumber(item.unit_price, 0),
          total_price: toNumber(item.total_price, toNumber(item.unit_price, 0) * Math.max(1, toNumber(item.quantity, 1))),
        }))
      : [
          {
            product_id: new mongoose.Types.ObjectId(),
            variant_id: new mongoose.Types.ObjectId(),
            product_name: body.item_name || 'Order Item',
            variant_sku: 'N/A',
            variant_label: 'Default',
            quantity: Math.max(1, toNumber(body.items_count, 1)),
            unit_price: toNumber(body.total_price, 0),
            total_price: toNumber(body.total_price, 0),
          },
        ];

    const total = toNumber(body.pricing?.total, toNumber(body.total_price, 0));
    const pricing = {
      subtotal: toNumber(body.pricing?.subtotal, total),
      delivery_fee: toNumber(body.pricing?.delivery_fee, 0),
      discount: toNumber(body.pricing?.discount, 0),
      tax: toNumber(body.pricing?.tax, 0),
      total,
    };

    const deliveryAddress = {
      line1: body.delivery_address?.line1 || body.delivery_address_line1 || body.delivery_address || 'Not provided',
      line2: body.delivery_address?.line2 || body.delivery_address_line2 || '',
      city: body.delivery_address?.city || body.delivery_city || 'NA',
      state: body.delivery_address?.state || body.delivery_state || 'NA',
      pincode: body.delivery_address?.pincode || body.delivery_pincode || '000000',
      location: {
        type: 'Point',
        coordinates: Array.isArray(body.delivery_address?.location?.coordinates)
          ? body.delivery_address.location.coordinates
          : [0, 0],
      },
    };

    const payment = {
      method: (body.payment?.method || body.payment_method || 'UPI').toUpperCase(),
      status: body.payment?.status || 'pending',
      reference: body.payment?.reference || '',
      paid_at: body.payment?.paid_at || null,
    };

    const actorId = toObjectId(req.user?.id) || new mongoose.Types.ObjectId();
    const status = body.status || 'pending';

    const order = new Order({
      order_number: orderNumber,
      store_id: storeId,
      retailer_id: retailerId,
      consumer_id: consumerId,
      delivery_partner_id: toObjectId(body.delivery_partner_id),
      items,
      pricing,
      delivery_address: deliveryAddress,
      payment,
      status,
      status_history: [
        {
          status,
          note: body.status_note || 'Order created by admin',
          updated_by: actorId,
          actor_role: req.user?.role || 'admin',
        },
      ],
      special_instructions: body.special_instructions || '',
      estimated_delivery_at: body.estimated_delivery_at || null,
    });

    const saved = await order.save();
    res.status(201).json({ success: true, message: 'Order created successfully', data: saved.toObject() });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// Create a new payment in app DB
exports.createPayment = async (req, res) => {
  try {
    const Payment = await createPaymentModel();
    const body = req.body || {};

    const orderId = toObjectId(body.order_id);
    const consumerId = toObjectId(body.consumer_id);
    const retailerId = toObjectId(body.retailer_id);

    if (!orderId || !consumerId || !retailerId) {
      return res.status(400).json({
        success: false,
        message: 'order_id, consumer_id and retailer_id are required and must be valid ObjectId values',
      });
    }

    const payment = new Payment({
      order_id: orderId,
      consumer_id: consumerId,
      retailer_id: retailerId,
      amount: toNumber(body.amount, 0),
      currency: body.currency || 'INR',
      method: (body.method || 'UPI').toUpperCase(),
      gateway: (body.gateway || 'manual').toLowerCase(),
      gateway_order_id: body.gateway_order_id || '',
      gateway_payment_id: body.gateway_payment_id || '',
      gateway_signature: body.gateway_signature || '',
      status: body.status || 'pending',
      failure_reason: body.failure_reason || '',
      refund_id: body.refund_id || '',
      refunded_at: body.refunded_at || null,
      refund_amount: toNumber(body.refund_amount, 0),
      metadata: body.metadata || {},
    });

    const saved = await payment.save();
    res.status(201).json({ success: true, message: 'Payment created successfully', data: saved.toObject() });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// Create a new payout in app DB
exports.createPayout = async (req, res) => {
  try {
    const Payout = await createPayoutModel();
    const body = req.body || {};

    const retailerId = toObjectId(body.retailer_id);
    const storeId = toObjectId(body.store_id);
    if (!retailerId || !storeId) {
      return res.status(400).json({
        success: false,
        message: 'retailer_id and store_id are required and must be valid ObjectId values',
      });
    }

    const fromDate = body.period?.from || body.period_from;
    const toDate = body.period?.to || body.period_to;
    if (!fromDate || !toDate) {
      return res.status(400).json({ success: false, message: 'period.from and period.to are required' });
    }

    const payout = new Payout({
      retailer_id: retailerId,
      store_id: storeId,
      period: {
        from: new Date(fromDate),
        to: new Date(toDate),
      },
      total_orders: toNumber(body.total_orders, 0),
      total_revenue: toNumber(body.total_revenue, 0),
      platform_fee: toNumber(body.platform_fee, 0),
      net_payout: toNumber(body.net_payout, 0),
      status: body.status || 'pending',
      payout_reference: body.payout_reference || '',
      paid_at: body.paid_at || null,
    });

    const saved = await payout.save();
    res.status(201).json({ success: true, message: 'Payout created successfully', data: saved.toObject() });
  } catch (error) {
    console.error('Error creating payout:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// Delete consumer
exports.deleteConsumer = async (req, res) => {
  try {
    const Consumer = await createConsumerModel();
    const { consumerId } = req.params;

    if (!consumerId) {
      return res.status(400).json({ success: false, message: 'Consumer ID is required' });
    }

    const consumerObjectId = toObjectId(consumerId);
    if (!consumerObjectId) {
      return res.status(400).json({ success: false, message: 'Invalid consumer ID format' });
    }

    const deleted = await Consumer.findByIdAndDelete(consumerObjectId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Consumer not found' });
    }

    res.json({ success: true, message: 'Consumer deleted successfully' });
  } catch (error) {
    console.error('Error deleting consumer:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// Delete retailer
exports.deleteRetailer = async (req, res) => {
  try {
    const Retailer = await createRetailerModel();
    const { retailerId } = req.params;

    if (!retailerId) {
      return res.status(400).json({ success: false, message: 'Retailer ID is required' });
    }

    const retailerObjectId = toObjectId(retailerId);
    if (!retailerObjectId) {
      return res.status(400).json({ success: false, message: 'Invalid retailer ID format' });
    }

    const deleted = await Retailer.findByIdAndDelete(retailerObjectId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Retailer not found' });
    }

    res.json({ success: true, message: 'Retailer deleted successfully' });
  } catch (error) {
    console.error('Error deleting retailer:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// Delete store
exports.deleteStore = async (req, res) => {
  try {
    const Store = await createStoreModel();
    const { storeId } = req.params;

    if (!storeId) {
      return res.status(400).json({ success: false, message: 'Store ID is required' });
    }

    const storeObjectId = toObjectId(storeId);
    if (!storeObjectId) {
      return res.status(400).json({ success: false, message: 'Invalid store ID format' });
    }

    const deleted = await Store.findByIdAndDelete(storeObjectId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    res.json({ success: true, message: 'Store deleted successfully' });
  } catch (error) {
    console.error('Error deleting store:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// Delete order
exports.deleteOrder = async (req, res) => {
  try {
    const Order = await createOrderModel();
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
    }

    const orderObjectId = toObjectId(orderId);
    if (!orderObjectId) {
      return res.status(400).json({ success: false, message: 'Invalid order ID format' });
    }

    const deleted = await Order.findByIdAndDelete(orderObjectId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// Delete payment
exports.deletePayment = async (req, res) => {
  try {
    const Payment = await createPaymentModel();
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({ success: false, message: 'Payment ID is required' });
    }

    const paymentObjectId = toObjectId(paymentId);
    if (!paymentObjectId) {
      return res.status(400).json({ success: false, message: 'Invalid payment ID format' });
    }

    const deleted = await Payment.findByIdAndDelete(paymentObjectId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    res.json({ success: true, message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// Delete payout
exports.deletePayout = async (req, res) => {
  try {
    const Payout = await createPayoutModel();
    const { payoutId } = req.params;

    if (!payoutId) {
      return res.status(400).json({ success: false, message: 'Payout ID is required' });
    }

    const payoutObjectId = toObjectId(payoutId);
    if (!payoutObjectId) {
      return res.status(400).json({ success: false, message: 'Invalid payout ID format' });
    }

    const deleted = await Payout.findByIdAndDelete(payoutObjectId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Payout not found' });
    }

    res.json({ success: true, message: 'Payout deleted successfully' });
  } catch (error) {
    console.error('Error deleting payout:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// Delete cart (clear consumer's cart)
exports.deleteCart = async (req, res) => {
  try {
    const Consumer = await createConsumerModel();
    const { consumerId } = req.params;

    if (!consumerId) {
      return res.status(400).json({ success: false, message: 'Consumer ID is required' });
    }

    const consumerObjectId = toObjectId(consumerId);
    if (!consumerObjectId) {
      return res.status(400).json({ success: false, message: 'Invalid consumer ID format' });
    }

    const updated = await Consumer.findByIdAndUpdate(
      consumerObjectId,
      { $set: { cart: { items: [] } } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Consumer not found' });
    }

    res.json({ success: true, message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};