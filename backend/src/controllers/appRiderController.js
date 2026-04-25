const { createRiderModel } = require('../models/AppRider');
const { createRiderEarningModel, createRiderPayoutModel } = require('../models/AppRiderEarnings');
const { createOrderModel } = require('../models/AppOrder');
const mongoose = require('mongoose');

const buildRiderQuery = (search = '', extraFilters = {}) => {
  const query = {
    is_approved: { $ne: false },
    ...extraFilters,
  };

  if (search) {
    query.$or = [
      { name: new RegExp(search, 'i') },
      { phone: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
    ];
  }

  return query;
};

// Create rider in app DB
exports.createRider = async (req, res) => {
  try {
    const Rider = await createRiderModel();
    const body = req.body || {};

    if (!body.name || !body.phone) {
      return res.status(400).json({ success: false, message: 'name and phone are required' });
    }

    const existing = await Rider.findOne({ phone: body.phone }).lean();
    if (existing) {
      return res.status(409).json({ success: false, message: 'Rider already exists with this phone' });
    }

    const rider = new Rider({
      name: body.name,
      phone: body.phone,
      email: body.email || '',
      profile_photo: body.profile_photo || '',
      date_of_birth: body.date_of_birth || null,
      phone_verified: Boolean(body.phone_verified),
      otp: body.otp || '',
      otp_expiry: body.otp_expiry || null,
      aadhaar_number: body.aadhaar_number || '',
      pan_number: body.pan_number || '',
      vehicle_type: body.vehicle_type || 'bike',
      vehicle_number: body.vehicle_number || '',
      vehicle_rc: body.vehicle_rc || '',
      driving_license_number: body.driving_license_number || body.driving_license || '',
      driving_license_expiry: body.driving_license_expiry || null,
      kyc_status: body.kyc_status || 'pending',
      fcm_token: body.fcm_token || '',
      status: body.status || 'PENDING',
      is_online: Boolean(body.is_online),
      is_available: Boolean(body.is_available),
      service_radius: Number(body.service_radius || 5),
      assigned_zones: Array.isArray(body.assigned_zones)
        ? body.assigned_zones.filter((zoneId) => mongoose.Types.ObjectId.isValid(zoneId))
        : [],
      average_rating: Number(body.average_rating || 0),
      total_deliveries: Number(body.total_deliveries || 0),
      total_earnings: Number(body.total_earnings || 0),
      current_order_id: mongoose.Types.ObjectId.isValid(body.current_order_id) ? body.current_order_id : null,
      bank_account_number: body.bank_account_number || '',
      ifsc_code: body.ifsc_code || '',
      upi_id: body.upi_id || '',
      total_ratings: Number(body.total_ratings || 0),
      cancellation_rate: Number(body.cancellation_rate || 0),
      late_delivery_rate: Number(body.late_delivery_rate || 0),
      current_location: {
        type: 'Point',
        coordinates: Array.isArray(body.current_location?.coordinates)
          ? body.current_location.coordinates
          : [0, 0],
      },
      is_approved: Boolean(body.is_approved),
      approved_at: body.is_approved ? new Date() : null,
      approved_by_admin_id: body.is_approved && mongoose.Types.ObjectId.isValid(req.user?.id)
        ? req.user.id
        : null,
      onboarded_at: body.onboarded_at || new Date(),
      last_active_at: body.last_active_at || null,
      rejection_reason: body.rejection_reason || '',
    });

    const saved = await rider.save();
    res.status(201).json({ success: true, message: 'Rider created successfully', data: saved.toObject() });
  } catch (error) {
    console.error('Error creating rider:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// Get all riders from app
exports.getRiders = async (req, res) => {
  try {
    const Rider = await createRiderModel();
    const { page = 1, limit = 10, search = '', kyc_status, is_online } = req.query;
    const skip = (page - 1) * limit;

    const query = buildRiderQuery(search);
    if (kyc_status) query.kyc_status = kyc_status;
    if (is_online === 'true') query.is_online = true;
    if (is_online === 'false') query.is_online = false;

    const riders = await Rider.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Rider.countDocuments(query);

    res.json({
      success: true,
      data: riders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching riders:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get pending riders for admin approval
exports.getPendingRiders = async (req, res) => {
  try {
    const Rider = await createRiderModel();
    const { page = 1, limit = 10, search = '', kyc_status, is_online } = req.query;
    const skip = (page - 1) * limit;

    const query = {
      $and: [
        search
          ? {
              $or: [
                { name: new RegExp(search, 'i') },
                { phone: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') },
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

    if (kyc_status) query.$and.push({ kyc_status });
    if (is_online === 'true') query.$and.push({ is_online: true });
    if (is_online === 'false') query.$and.push({ is_online: false });

    const riders = await Rider.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Rider.countDocuments(query);

    res.json({
      success: true,
      data: riders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching pending riders:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Approve a rider
exports.approveRider = async (req, res) => {
  try {
    const Rider = await createRiderModel();
    const rider = await Rider.findByIdAndUpdate(
      req.params.id,
      {
        is_approved: true,
        status: 'APPROVED',
        approved_at: new Date(),
        approved_by_admin_id: req.user?.id,
        rejection_reason: null,
      },
      { new: true }
    ).lean();

    if (!rider) {
      return res.status(404).json({ success: false, message: 'Rider not found' });
    }

    res.json({ success: true, message: 'Rider approved successfully', data: rider });
  } catch (error) {
    console.error('Error approving rider:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Reject a rider
exports.rejectRider = async (req, res) => {
  try {
    const Rider = await createRiderModel();
    const { rejection_reason = 'Rejected by admin' } = req.body || {};

    const rider = await Rider.findByIdAndUpdate(
      req.params.id,
      {
        is_approved: false,
        status: 'REJECTED',
        approved_at: null,
        approved_by_admin_id: req.user?.id,
        rejection_reason,
      },
      { new: true }
    ).lean();

    if (!rider) {
      return res.status(404).json({ success: false, message: 'Rider not found' });
    }

    res.json({ success: true, message: 'Rider rejected successfully', data: rider });
  } catch (error) {
    console.error('Error rejecting rider:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get single rider details
exports.getRiderById = async (req, res) => {
  try {
    const Rider = await createRiderModel();
    const RiderEarning = await createRiderEarningModel();
    await createOrderModel();
    const RiderPayout = await createRiderPayoutModel();

    const rider = await Rider.findById(req.params.id).lean();
    if (!rider) {
      return res.status(404).json({ success: false, message: 'Rider not found' });
    }

    // Get recent earnings
    const recentEarnings = await RiderEarning.find({
      rider_id: req.params.id
    })
      .populate('order_id', 'order_number')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Get recent payouts
    const recentPayouts = await RiderPayout.find({
      rider_id: req.params.id
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.json({
      success: true,
      data: {
        ...rider,
        recent_earnings: recentEarnings,
        recent_payouts: recentPayouts
      }
    });
  } catch (error) {
    console.error('Error fetching rider:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get rider earnings
exports.getRiderEarnings = async (req, res) => {
  try {
    const RiderEarning = await createRiderEarningModel();
    await createOrderModel();
    const { rider_id, page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const query = { rider_id };
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
    console.error('Error fetching earnings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get rider payouts
exports.getRiderPayouts = async (req, res) => {
  try {
    const RiderPayout = await createRiderPayoutModel();
    const { rider_id, page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const query = { rider_id };
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
    console.error('Error fetching payouts:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get earnings summary
exports.getEarningsSummary = async (req, res) => {
  try {
    const RiderEarning = await createRiderEarningModel();
    const { rider_id } = req.query;

    const summary = await RiderEarning.aggregate([
      { $match: { rider_id: mongoose.Types.ObjectId(rider_id) } },
      {
        $group: {
          _id: '$status',
          total_earned: { $sum: '$delivery_fee_earned' },
          total_bonus: { $sum: '$bonus' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({ success: true, data: summary });
  } catch (error) {
    console.error('Error fetching earnings summary:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
// Delete rider
exports.deleteRider = async (req, res) => {
  try {
    const Rider = await createRiderModel();
    const { riderId } = req.params;

    if (!riderId) {
      return res.status(400).json({ success: false, message: 'Rider ID is required' });
    }

    const riderObjectId = toObjectId(riderId);
    if (!riderObjectId) {
      return res.status(400).json({ success: false, message: 'Invalid rider ID format' });
    }

    const deleted = await Rider.findByIdAndDelete(riderObjectId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Rider not found' });
    }

    res.json({ success: true, message: 'Rider deleted successfully' });
  } catch (error) {
    console.error('Error deleting rider:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};