/**
 * API Service Layer
 * Handles all HTTP requests to the backend
 */

const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000')
  .replace(/\/+$|\/api$/i, '')
  .replace(/\/+$/, '');
const API_PREFIX = '/api';

/**
 * Generic fetch wrapper with error handling
 */
async function apiCall(endpoint, method = 'GET', body = null, isFormData = false) {
  const normalizedEndpoint = endpoint.startsWith('/api') ? endpoint.slice(4) : endpoint;
  const url = `${API_BASE_URL}${API_PREFIX}${normalizedEndpoint}`;
  
  const headers = {
    'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
  };

  // Add auth token if available
  const token = localStorage.getItem('admin_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method,
      headers: isFormData ? {} : headers,
      body: body ? (isFormData ? body : JSON.stringify(body)) : null,
    });

    // Handle 401 - Unauthorized (token expired)
    if (response.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }

    // Parse response as JSON
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      throw new Error(`Invalid response format. Expected JSON but got ${contentType || 'text/html'}`);
    }

    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return {
      data,
      status: response.status,
      statusText: response.statusText,
    };
  } catch (error) {
    console.error(`API Error [${method} ${endpoint}]:`, error);
    throw error;
  }
}

/**
 * AUTHENTICATION ENDPOINTS
 */
export const authAPI = {
  login: async (email, password) => {
    return apiCall('/auth/login', 'POST', { email, password });
  },
};

/**
 * STORES ENDPOINTS
 */
export const storesAPI = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/app/stores${query ? '?' + query : ''}`, 'GET');
  },

  getPending: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/app/stores/pending${query ? '?' + query : ''}`, 'GET');
  },

  getById: async (storeId) => {
    return apiCall(`/app/stores/${storeId}`, 'GET');
  },

  create: async (storeData) => {
    return apiCall('/app/stores', 'POST', storeData);
  },

  update: async (storeId, storeData) => {
    return apiCall(`/app/stores/${storeId}`, 'PUT', storeData);
  },

  updateStatus: async (storeId, status) => {
    return apiCall(`/app/stores/${storeId}/status`, 'PATCH', { status });
  },

  approve: async (storeId) => {
    return apiCall(`/app/stores/${storeId}/approve`, 'PATCH');
  },

  reject: async (storeId, rejection_reason) => {
    return apiCall(`/app/stores/${storeId}/reject`, 'PATCH', { rejection_reason });
  },

  delete: async (storeId) => {
    return apiCall(`/app/stores/${storeId}`, 'DELETE');
  },
};

/**
 * PRODUCTS ENDPOINTS
 */
export const productsAPI = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/app/products${query ? '?' + query : ''}`, 'GET');
  },

  getByStoreId: async (storeId) => {
    return apiCall(`/app/products?store_id=${storeId}`, 'GET');
  },

  create: async (productData) => {
    return apiCall(`/app/products`, 'POST', productData);
  },

  update: async (productId, productData) => {
    return apiCall(`/app/products/${productId}`, 'PUT', productData);
  },

  delete: async (productId) => {
    return apiCall(`/app/products/${productId}`, 'DELETE');
  },
};

/**
 * PRODUCT VARIANTS ENDPOINTS
 */
export const productVariantsAPI = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/app/product-variants${query ? '?' + query : ''}`, 'GET');
  },
};

/**
 * CATEGORIES ENDPOINTS
 */
export const categoriesAPI = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/app/categories${query ? '?' + query : ''}`, 'GET');
  },
};

/**
 * CONSUMERS ENDPOINTS
 */
export const consumersAPI = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/app/consumers${query ? '?' + query : ''}`, 'GET');
  },

  create: async (consumerData) => {
    return apiCall('/app/consumers', 'POST', consumerData);
  },

  delete: async (consumerId) => {
    return apiCall(`/app/consumers/${consumerId}`, 'DELETE');
  },

  sendOTP: async (phone) => {
    return apiCall('/consumers/auth/send-otp', 'POST', { phone });
  },

  verifyOTP: async (phone, otp) => {
    return apiCall('/consumers/auth/verify-otp', 'POST', { phone, otp });
  },

  getProfile: async () => {
    return apiCall('/consumers/auth/me', 'GET');
  },

  updateProfile: async (profileData) => {
    return apiCall('/consumers/auth/profile', 'PATCH', profileData);
  },

  getAddresses: async () => {
    return apiCall('/consumers/auth/addresses', 'GET');
  },

  addAddress: async (addressData) => {
    return apiCall('/consumers/auth/addresses', 'POST', addressData);
  },

  getCart: async () => {
    return apiCall('/consumers/cart/', 'GET');
  },

  addToCart: async (cartData) => {
    return apiCall('/consumers/cart/add', 'POST', cartData);
  },
};

/**
 * RIDERS ENDPOINTS
 */
export const ridersAPI = {
  sendOTP: async (phone) => {
    return apiCall('/riders/auth/send-otp', 'POST', { phone });
  },

  verifyOTP: async (phone, otp) => {
    return apiCall('/riders/auth/verify-otp', 'POST', { phone, otp });
  },

  getProfile: async () => {
    return apiCall('/riders/auth/me', 'GET');
  },

  getAvailableDeliveries: async () => {
    return apiCall('/riders/auth/deliveries', 'GET');
  },

  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/app/riders${query ? '?' + query : ''}`, 'GET');
  },

  create: async (riderData) => {
    return apiCall('/app/riders', 'POST', riderData);
  },

  getPending: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/app/riders/pending${query ? '?' + query : ''}`, 'GET');
  },

  updateStatus: async (riderId, status) => {
    return apiCall(`/app/riders/${riderId}/status`, 'PATCH', { status });
  },

  approve: async (riderId) => {
    return apiCall(`/app/riders/${riderId}/approve`, 'PATCH');
  },

  reject: async (riderId, rejection_reason) => {
    return apiCall(`/app/riders/${riderId}/reject`, 'PATCH', { rejection_reason });
  },

  delete: async (riderId) => {
    return apiCall(`/app/riders/${riderId}`, 'DELETE');
  },
};

/**
 * ORDERS ENDPOINTS
 */
export const ordersAPI = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/app/orders${query ? '?' + query : ''}`, 'GET');
  },

  getById: async (orderId) => {
    return apiCall(`/app/orders/${orderId}`, 'GET');
  },

  updateStatus: async (orderId, status) => {
    return apiCall(`/app/orders/${orderId}/status`, 'PATCH', { status });
  },

  create: async (orderData) => {
    return apiCall('/app/orders', 'POST', orderData);
  },

  update: async (orderId, orderData) => {
    return apiCall(`/app/orders/${orderId}`, 'PUT', orderData);
  },

  delete: async (orderId) => {
    return apiCall(`/app/orders/${orderId}`, 'DELETE');
  },
};

/**
 * RETAILERS ENDPOINTS
 */
export const retailersAPI = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/app/retailers${query ? '?' + query : ''}`, 'GET');
  },

  getById: async (retailerId) => {
    return apiCall(`/app/retailers/${retailerId}`, 'GET');
  },

  create: async (retailerData) => {
    return apiCall('/app/retailers', 'POST', retailerData);
  },

  update: async (retailerId, retailerData) => {
    return apiCall(`/app/retailers/${retailerId}`, 'PUT', retailerData);
  },

  updateStatus: async (retailerId, status) => {
    return apiCall(`/app/retailers/${retailerId}/status`, 'PATCH', { status });
  },

  delete: async (retailerId) => {
    return apiCall(`/app/retailers/${retailerId}`, 'DELETE');
  },
};

/**
 * PAYMENTS ENDPOINTS
 */
export const paymentsAPI = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/app/payments${query ? '?' + query : ''}`, 'GET');
  },

  getById: async (paymentId) => {
    return apiCall(`/app/payments/${paymentId}`, 'GET');
  },

  updateStatus: async (paymentId, status) => {
    return apiCall(`/app/payments/${paymentId}/status`, 'PATCH', { status });
  },

  create: async (paymentData) => {
    return apiCall('/app/payments', 'POST', paymentData);
  },

  update: async (paymentId, paymentData) => {
    return apiCall(`/app/payments/${paymentId}`, 'PUT', paymentData);
  },

  refund: async (paymentId, refundData) => {
    return apiCall(`/app/payments/${paymentId}/refund`, 'POST', refundData);
  },

  delete: async (paymentId) => {
    return apiCall(`/app/payments/${paymentId}`, 'DELETE');
  },
};

/**
 * CARTS ENDPOINTS
 */
export const cartsAPI = {
  create: async (cartData) => {
    return apiCall('/app/carts', 'POST', cartData);
  },
};

/**
 * PAYOUTS ENDPOINTS
 */
export const payoutsAPI = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/app/payouts${query ? '?' + query : ''}`, 'GET');
  },

  create: async (payoutData) => {
    return apiCall('/app/payouts', 'POST', payoutData);
  },

  delete: async (payoutId) => {
    return apiCall(`/app/payouts/${payoutId}`, 'DELETE');
  },
};

/**
 * UPLOAD ENDPOINTS
 */
export const uploadAPI = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const url = `${API_BASE_URL}${API_PREFIX}/upload/image`;
    const token = localStorage.getItem('admin_token');
    
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      return data;
    } catch (error) {
      console.error('Upload Error:', error);
      throw error;
    }
  },
};

/**
 * UTILITY FUNCTIONS
 */

// Format API response for table display
export const formatStoreForTable = (store) => {
  return {
    id: store._id,
    name: store.store_name,
    retailer: store.retailer_name,
    city: store.address?.city,
    status: store.status,
    rating: store.rating,
    reviews: store.total_reviews,
    delivery: store.is_delivery_available ? '✓' : '✗',
    email: store.retailer_email,
    phone: store.retailer_phone,
    createdAt: new Date(store.createdAt).toLocaleDateString(),
  };
};

// Format API response for product table display
export const formatProductForTable = (product) => {
  return {
    id: product._id,
    name: product.name,
    price: `₹${product.price}`,
    discountPrice: product.discount_price ? `₹${product.discount_price}` : 'N/A',
    stock: product.stock_quantity,
    status: product.status,
    rating: product.rating,
    reviews: product.total_reviews,
    createdAt: new Date(product.createdAt).toLocaleDateString(),
  };
};

// Format API response for consumer table display
export const formatConsumerForTable = (consumer) => {
  return {
    id: consumer._id,
    name: consumer.consumer_name || 'N/A',
    phone: consumer.phone,
    verified: consumer.phone_verified ? '✓' : '✗',
    status: consumer.status,
    addresses: consumer.addresses?.length || 0,
    createdAt: new Date(consumer.createdAt).toLocaleDateString(),
  };
};

// Format API response for rider table display
export const formatRiderForTable = (rider) => {
  return {
    id: rider._id,
    name: rider.name,
    phone: rider.phone,
    status: rider.status,
    deliveries: rider.total_deliveries,
    earnings: `₹${rider.total_earnings || 0}`,
    rating: rider.average_rating.toFixed(1),
    online: rider.is_online ? '🟢 Online' : '🔴 Offline',
    createdAt: new Date(rider.createdAt).toLocaleDateString(),
  };
};

export default {
  authAPI,
  storesAPI,
  productsAPI,
  productVariantsAPI,
  categoriesAPI,
  consumersAPI,
  retailersAPI,
  ridersAPI,
  ordersAPI,
  paymentsAPI,
  payoutsAPI,
  cartsAPI,
  uploadAPI,
};
