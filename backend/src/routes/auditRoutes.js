const express = require('express');
const router = express.Router();
const { createAuditLogModel } = require('../models/AuditLog');

// Get all audit logs with pagination and filtering
router.get('/audit-logs', async (req, res) => {
  try {
    const { page = 1, limit = 50, action, resourceType, actor, severity } = req.query;

    const AuditLog = await createAuditLogModel();

    const filter = {};
    if (action) filter.action = action;
    if (resourceType) filter.resourceType = resourceType;
    if (actor) filter['actor.name'] = new RegExp(actor, 'i');
    if (severity) filter.severity = severity;

    const auditLogs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('actor', 'name email')
      .exec();

    const total = await AuditLog.countDocuments(filter);

    res.json({
      success: true,
      data: auditLogs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs',
      error: error.message
    });
  }
});

// Get audit log by ID
router.get('/audit-logs/:id', async (req, res) => {
  try {
    const AuditLog = await createAuditLogModel();
    const auditLog = await AuditLog.findById(req.params.id)
      .populate('actor', 'name email')
      .exec();

    if (!auditLog) {
      return res.status(404).json({
        success: false,
        message: 'Audit log not found'
      });
    }

    res.json({
      success: true,
      data: auditLog
    });
  } catch (error) {
    console.error('Error fetching audit log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit log',
      error: error.message
    });
  }
});

// Get audit logs for a specific resource
router.get('/audit-logs/resource/:resourceId', async (req, res) => {
  try {
    const { resourceId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const AuditLog = await createAuditLogModel();

    const auditLogs = await AuditLog.find({ 'resourceId': resourceId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('actor', 'name email')
      .exec();

    const total = await AuditLog.countDocuments({ 'resourceId': resourceId });

    res.json({
      success: true,
      data: auditLogs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching resource audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resource audit logs',
      error: error.message
    });
  }
});

// Get audit statistics
router.get('/audit-logs/stats', async (req, res) => {
  try {
    const AuditLog = await createAuditLogModel();

    const stats = await AuditLog.aggregate([
      {
        $group: {
          _id: {
            action: '$action',
            resourceType: '$resourceType',
            severity: '$severity'
          },
          count: { $sum: 1 },
          lastActivity: { $max: '$createdAt' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const totalLogs = await AuditLog.countDocuments();
    const recentLogs = await AuditLog.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    res.json({
      success: true,
      data: {
        totalLogs,
        recentLogs,
        breakdown: stats
      }
    });
  } catch (error) {
    console.error('Error fetching audit stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit statistics',
      error: error.message
    });
  }
});

module.exports = router;