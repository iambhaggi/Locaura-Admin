class ApiEndpoints {
  static const String _base = '/api/v1';

  // Auth
  static const String retailerLogin = '$_base/auth/retailer/login';
  static const String sendOtp = '$_base/auth/send-otp';
  static const String verifyOtp = '$_base/auth/verify-otp';
  static const String getProfile = '$_base/auth/retailer/me';

  // Stores
  static const String stores = '$_base/stores';
  static const String registerStore = '$_base/stores/register';
  static const String myStores = '$_base/stores/me';
  
  static String storeDetails(String id) => '$_base/stores/$id';

  // Products
  static String products(String storeId) => '$_base/stores/$storeId/products';
  static String productDetails(String storeId, String productId) => 
      '$_base/stores/$storeId/products/$productId';

  // Variants
  static String variants(String storeId, String productId) => 
      '$_base/stores/$storeId/products/$productId/variants';
  static String variantDetails(String storeId, String productId, String variantId) => 
      '$_base/stores/$storeId/products/$productId/variants/$variantId';
}
