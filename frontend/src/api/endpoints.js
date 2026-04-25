import apiClient from './axiosConfig';

// Auth APIs
export const loginUser = (email, password) =>
  apiClient.post('/auth/login', { email, password });

export const registerAdmin = (data) =>
  apiClient.post('/auth/register', data);

export const logoutUser = () =>
  apiClient.post('/auth/logout');

// User APIs
export const getUsers = (params) =>
  apiClient.get('/users', { params });

export const getUserById = (id) =>
  apiClient.get(`/users/${id}`);

export const updateUserStatus = (id, status) =>
  apiClient.patch(`/users/${id}/status`, { status });

export const deleteUser = (id) =>
  apiClient.delete(`/users/${id}`);

export const sendNotification = (id, message) =>
  apiClient.post(`/users/${id}/notify`, { message });

// Retailer APIs
export const getRetailers = (params) =>
  apiClient.get('/app/retailers', { params });

export const getRetailerById = (id) =>
  apiClient.get(`/app/retailers/${id}`);

export const approveRetailer = (id) =>
  apiClient.post(`/app/retailers/${id}/approve`);

export const rejectRetailer = (id, reason) =>
  apiClient.post(`/app/retailers/${id}/reject`, { reason });

export const getRetailerProducts = (id) =>
  apiClient.get(`/app/retailers/${id}/products`);

export const deleteRetailer = (id) =>
  apiClient.delete(`/app/retailers/${id}`);

// Delivery Partner APIs
export const getRiders = (params) =>
  apiClient.get('/app/riders', { params });

export const getRiderById = (id) =>
  apiClient.get(`/app/riders/${id}`);

export const verifyRider = (id, documents) =>
  apiClient.post(`/app/riders/${id}/verify`, { documents });

export const rejectRider = (id, reason) =>
  apiClient.post(`/app/riders/${id}/reject`, { reason });

export const toggleRiderStatus = (id, status) =>
  apiClient.post(`/app/riders/${id}/toggle-status`, { status });

export const getRiderAssignments = (id) =>
  apiClient.get(`/app/riders/${id}/assignments`);

// Product APIs
export const getProducts = (params) =>
  apiClient.get('/app/products', { params });

export const getProductById = (id) =>
  apiClient.get(`/app/products/${id}`);

export const approveProduct = (id) =>
  apiClient.post(`/app/products/${id}/approve`);

export const rejectProduct = (id, reason) =>
  apiClient.post(`/app/products/${id}/reject`, { reason });

export const updateProduct = (id, data) =>
  apiClient.put(`/app/products/${id}`, data);

export const deleteProduct = (id) =>
  apiClient.delete(`/app/products/${id}`);

export const bulkUploadProducts = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post('/app/products/bulk/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getCategories = () =>
  apiClient.get('/app/categories');

// Order APIs
export const getOrders = (params) =>
  apiClient.get('/app/orders', { params });

export const getOrderById = (id) =>
  apiClient.get(`/app/orders/${id}`);

export const updateOrderStatus = (id, status) =>
  apiClient.put(`/app/orders/${id}/status`, { status });

export const cancelOrder = (id, reason) =>
  apiClient.post(`/app/orders/${id}/cancel`, { reason });

export const reassignRider = (id, riderId) =>
  apiClient.post(`/app/orders/${id}/reassign-rider`, { riderId });

export const issueRefund = (id, amount, reason) =>
  apiClient.post(`/app/orders/${id}/refund`, { amount, reason });

export const getOrderAnalytics = () =>
  apiClient.get('/app/orders/analytics/dashboard');

// Payment APIs
export const getPaymentDashboard = () =>
  apiClient.get('/app/payments/dashboard');

export const getPayouts = (params) =>
  apiClient.get('/app/payments/payouts', { params });

export const markPayoutAsPaid = (id) =>
  apiClient.put(`/app/payments/payouts/${id}/paid`);

export const issueAdjustment = (data) =>
  apiClient.post('/app/payments/adjustments', data);

export const processRefund = (data) =>
  apiClient.post('/app/payments/refunds', data);

export const exportPayoutsCsv = () =>
  apiClient.get('/app/payments/export/csv');

// Support APIs
export const getSupportTickets = (params) =>
  apiClient.get('/support/tickets', { params });

export const getTicketById = (id) =>
  apiClient.get(`/support/tickets/${id}`);

export const createTicketReply = (id, reply) =>
  apiClient.post(`/support/tickets/${id}/reply`, { reply });

export const updateTicketStatus = (id, status) =>
  apiClient.put(`/support/tickets/${id}/status`, { status });

export const assignTicket = (id, assignedTo) =>
  apiClient.post(`/support/tickets/${id}/assign`, { assignedTo });

export const sendAnnouncement = (data) =>
  apiClient.post('/support/announcements', data);

export const sendDirectMessage = (data) =>
  apiClient.post('/support/messages', data);

// Settings APIs
export const getSettings = () =>
  apiClient.get('/settings');

export const getSettingByKey = (key) =>
  apiClient.get(`/settings/${key}`);

export const updateSetting = (key, value) =>
  apiClient.put(`/settings/${key}`, { value });

export const updateDeliveryFees = (fees) =>
  apiClient.post('/settings/delivery-fees', fees);

export const updateCommission = (commission) =>
  apiClient.post('/settings/commission', commission);

export const manageBanners = (data) =>
  apiClient.post('/settings/banners', data);

export const manageFAQs = (data) =>
  apiClient.post('/settings/faqs', data);

// App Data APIs
export const getAppConsumers = (params) =>
  apiClient.get('/app/consumers', { params });

export const getAppCategories = (params) =>
  apiClient.get('/app/categories', { params });

export const getAppRetailers = (params) =>
  apiClient.get('/app/retailers', { params });

export const getAppStores = (params) =>
  apiClient.get('/app/stores', { params });

export const getAppProducts = (params) =>
  apiClient.get('/app/products', { params });

export const getAppOrders = (params) =>
  apiClient.get('/app/orders', { params });

export const getAppPayments = (params) =>
  apiClient.get('/app/payments', { params });

export const getAppReviews = (params) =>
  apiClient.get('/app/reviews', { params });

export const getAppPayouts = (params) =>
  apiClient.get('/app/payouts', { params });

export const getAppRiders = (params) =>
  apiClient.get('/app/riders', { params });

export const getAppRiderEarnings = (params) =>
  apiClient.get('/app/riderearnings', { params });

export const getAppRiderPayouts = (params) =>
  apiClient.get('/app/riderpayouts', { params });

export const getNotifications = (params) =>
  apiClient.get('/notifications', { params });

export const getNotificationStats = () =>
  apiClient.get('/notifications/stats');

export const sendTestNotification = (data) =>
  apiClient.post('/notifications/test', data);

export const cleanupNotifications = (days) =>
  apiClient.delete('/notifications/cleanup', { params: { days } });
