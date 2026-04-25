const { createConsumerModel } = require('../models/Consumer');
const syncService = require('../services/syncService');

// Get all consumers (read from admin DB - synced from app DB)
exports.getAllConsumers = async (req, res) => {
  try {
    const Consumer = await createConsumerModel();
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery = {};
    if (search) {
      searchQuery.$or = [
        { phone: new RegExp(search, 'i') },
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }
    if (status) {
      searchQuery.status = status;
    }

    // Get consumers from admin database (synced from app DB)
    const consumers = await Consumer.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Consumer.countDocuments(searchQuery);

    res.json({
      success: true,
      consumers,
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

// Get single consumer details
exports.getConsumerById = async (req, res) => {
  try {
    const Consumer = await createConsumerModel();
    const consumer = await Consumer.findById(req.params.id).lean();
    if (!consumer) {
      return res.status(404).json({ success: false, message: 'Consumer not found' });
    }

    res.json({ success: true, data: consumer });
  } catch (error) {
    console.error('Error fetching consumer:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Sync consumer data from app to admin database
exports.syncConsumerData = async (req, res) => {
  try {
    // Trigger manual sync
    const syncStatus = syncService.getStatus();

    if (!syncStatus.isRunning) {
      return res.status(400).json({
        success: false,
        message: 'Sync service is not running'
      });
    }

    // The sync service runs continuously, so we just return current status
    res.json({
      success: true,
      message: 'Continuous sync is active',
      status: syncStatus
    });
  } catch (error) {
    console.error('Error checking sync status:', error);
    res.status(500).json({ success: false, message: 'Server error during sync check' });
  }
};