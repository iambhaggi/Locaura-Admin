const { createAuditLogModel } = require('../models/AuditLog');
const { createAdminNotificationModel } = require('../models/AdminNotification');

/**
 * Create an audit log entry
 * @param {Object} params - Audit log parameters
 * @param {string} params.action - Action performed (CREATE, UPDATE, DELETE, etc.)
 * @param {ObjectId} params.actor - User who performed the action
 * @param {string} params.resourceType - Type of resource affected
 * @param {ObjectId} params.resourceId - ID of the resource affected
 * @param {Object} params.changes - Changes made (old and new values)
 * @param {Object} params.metadata - Additional metadata
 * @param {string} params.status - Status of the action (SUCCESS, FAILED, PARTIAL)
 * @param {string} params.severity - Severity level (LOW, MEDIUM, HIGH, CRITICAL)
 * @param {string} params.description - Human-readable description
 * @param {Array} params.tags - Tags for filtering
 */
const createAuditLog = async (params) => {
  try {
    const AuditLog = await createAuditLogModel();

    const auditEntry = {
      action: params.action,
      actor: params.actor,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      changes: params.changes,
      metadata: params.metadata || {},
      status: params.status || 'SUCCESS',
      severity: params.severity || 'LOW',
      description: params.description,
      tags: params.tags || [],
    };

    const savedAuditLog = await AuditLog.create(auditEntry);

    // Create admin notification for database changes
    if (params.action !== 'READ' && params.action !== 'LOGIN' && params.action !== 'LOGOUT') {
      await createAdminNotification({
        recipient_id: params.actor,
        type: 'DATABASE_CHANGE',
        title: `Database ${params.action.toLowerCase()}: ${params.resourceType}`,
        body: params.description,
        data: {
          action: params.action,
          resourceType: params.resourceType,
          resourceId: params.resourceId,
          severity: params.severity
        },
        audit_log_id: savedAuditLog._id,
        priority: params.severity === 'CRITICAL' ? 'HIGH' : params.severity === 'HIGH' ? 'MEDIUM' : 'LOW'
      });
    }

    console.log(`Audit log created: ${params.action} on ${params.resourceType}`);
    return savedAuditLog;
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};

/**
 * Create audit log for database changes
 * @param {string} action - Action performed
 * @param {ObjectId} actor - User who performed the action
 * @param {string} resourceType - Type of resource
 * @param {ObjectId} resourceId - Resource ID
 * @param {Object} oldData - Old data before change
 * @param {Object} newData - New data after change
 * @param {Object} metadata - Additional metadata
 */
const logDatabaseChange = async (action, actor, resourceType, resourceId, oldData, newData, metadata = {}) => {
  const changes = {};
  if (oldData) changes.old = oldData;
  if (newData) changes.new = newData;

  let description = `${action.toLowerCase()} ${resourceType.toLowerCase()}`;
  if (resourceId) description += ` with ID ${resourceId}`;

  const severity = action === 'DELETE' ? 'HIGH' : action === 'CREATE' ? 'MEDIUM' : 'LOW';

  await createAuditLog({
    action,
    actor,
    resourceType,
    resourceId,
    changes,
    metadata,
    severity,
    description,
  });
};

/**
 * Create audit log for user authentication
 * @param {string} action - LOGIN or LOGOUT
 * @param {ObjectId} actor - User ID
 * @param {Object} metadata - Additional metadata (ip, userAgent, etc.)
 */
const logAuthentication = async (action, actor, metadata = {}) => {
  await createAuditLog({
    action,
    actor,
    resourceType: 'User',
    resourceId: actor,
    metadata,
    severity: 'LOW',
    description: `${action.toLowerCase()} by user`,
    tags: ['authentication'],
  });
};

/**
 * Create audit log for settings changes
 * @param {ObjectId} actor - User who made the change
 * @param {string} category - Settings category
 * @param {Object} oldSettings - Old settings
 * @param {Object} newSettings - New settings
 * @param {Object} metadata - Additional metadata
 */
const logSettingsChange = async (actor, category, oldSettings, newSettings, metadata = {}) => {
  await createAuditLog({
    action: 'UPDATE_SETTINGS',
    actor,
    resourceType: 'Settings',
    changes: { old: oldSettings, new: newSettings },
    metadata,
    severity: 'MEDIUM',
    description: `Updated ${category} settings`,
    tags: ['settings', category.toLowerCase()],
  });
};

/**
 * Create an admin notification
 * @param {Object} params - Notification parameters
 */
const createAdminNotification = async (params) => {
  try {
    const AdminNotification = await createAdminNotificationModel();
    await AdminNotification.create(params);
    console.log(`Admin notification created: ${params.title}`);
  } catch (error) {
    console.error('Failed to create admin notification:', error);
  }
};

module.exports = {
  createAuditLog,
  logDatabaseChange,
  logAuthentication,
  logSettingsChange,
  createAdminNotification,
};