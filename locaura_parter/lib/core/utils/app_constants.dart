abstract class AppConstants {
  // API
  static const baseUrl = 'http://10.0.2.2:3000'; // Local development URL (Android emulator)
  static const connectTimeout = Duration(seconds: 15);
  static const receiveTimeout = Duration(seconds: 20);

  // Storage keys
  static const accessTokenKey = 'access_token';
  static const refreshTokenKey = 'refresh_token';
  static const retailerProfileKey = 'retailer_profile';
  static const retailerIdKey = 'retailer_id';
  static const actorTypeKey = 'actor_type';
  static const consumerProfileKey = 'consumer_profile';
  static const consumerIdKey = 'consumer_id';
  static const savedAddressesKey = 'saved_addresses';

  // Actor types
  static const actorRetailer = 'retailer';
  static const actorConsumer = 'consumer';

  // OTP
  static const otpLength = 6;
  static const otpResendCooldown = 30; // seconds

  // Pagination
  static const defaultPageSize = 20;
}