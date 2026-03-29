class ApiEndpoints {
  static const String _base = '/api/v1';

  // Auth — Shared OTP Endpoints (If you have a global one) 
  // Wait, backend divides them. 
  // Retailer Auth
  static const String sendOtp = '$_base/auth/send-otp';
  static const String verifyOtp = '$_base/auth/verify-otp';
  static const String getProfile = '$_base/auth/profile';
  static const String updateProfile = '$_base/auth/complete-profile';
  
  // Consumer Auth
  static const String consumerSendOtp = '$_base/consumers/auth/send-otp';
  static const String consumerVerifyOtp = '$_base/consumers/auth/verify-otp';
  static const String consumerMe = '$_base/consumers/auth/me';
  static const String consumerUpdateProfile = '$_base/consumers/auth/update-profile';
  static const String consumerCompleteProfile = '$_base/consumers/auth/complete-profile';
  static const String consumerAddAddress = '$_base/consumers/auth/addresses';
  
  // Consumer Addresses
  static const String consumerAddresses = '$_base/consumers/auth/addresses';
  static String consumerAddressDetail(String id) => '$_base/consumers/auth/addresses/$id';

  // Stores (Retailer)
  static String storeDetails(String id) => '$_base/stores/$id';
  static const String registerStore = '$_base/stores/register';
  static const String myStores = '$_base/stores/me';

  // Consumer Discovery
  static String consumerNearbyStores(double lat, double lng, {double radius = 10, String? category}) {
    String url = '$_base/consumers/stores/nearby?lat=$lat&lng=$lng&radius_km=$radius';
    if (category != null) url += '&category=$category';
    return url;
  }
  static String consumerSearchStoresAndProducts(String query, {double? lat, double? lng, double radius = 10}) {
    String url = '$_base/consumers/stores/search?query=$query&radius_km=$radius';
    if (lat != null) url += '&lat=$lat';
    if (lng != null) url += '&lng=$lng';
    return url;
  }
  static String consumerStoreDetails(String storeId) => '$_base/consumers/stores/$storeId';
  static String consumerStoreProducts(String storeId) => '$_base/consumers/stores/$storeId/products';
  static String consumerProductDetails(String productId) => '$_base/consumers/stores/products/$productId';

  // Categories (Consumer)
  static const String consumerCategories = '$_base/consumers/categories';
  static String consumerSubcategories(String id) => '$_base/consumers/categories/$id/subcategories';

  // Cart (Consumer)
  static const String consumerCart = '$_base/consumers/cart';
  static const String consumerCartAdd = '$_base/consumers/cart/add';
  static const String consumerCartClear = '$_base/consumers/cart/clear';
  static String consumerCartUpdate(String variantId) => '$_base/consumers/cart/update/$variantId';
  static String consumerCartRemove(String variantId) => '$_base/consumers/cart/remove/$variantId';

  // Checkout (Consumer)
  static const String consumerCheckout = '$_base/consumers/checkout';

  // Orders (Consumer)
  static const String consumerOrders = '$_base/consumers/orders';
  static String consumerOrderDetail(String id) => '$_base/consumers/orders/$id';

  // Products & Variants (Retailer)
  static String products(String storeId) => '$_base/stores/$storeId/products';
  static String productDetails(String storeId, String productId) =>
      '$_base/stores/$storeId/products/$productId';
  static String variants(String storeId, String productId) =>
      '$_base/stores/$storeId/products/$productId/variants';
  static String variantDetails(String storeId, String productId, String variantId) =>
      '$_base/stores/$storeId/products/$productId/variants/$variantId';
}
