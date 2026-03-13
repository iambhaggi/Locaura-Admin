abstract class AppConstants {
  // API
  static const baseUrl = 'http://10.0.2.2:3000/'; // Local development URL (Android emulator)
  static const connectTimeout = Duration(seconds: 15);
  static const receiveTimeout = Duration(seconds: 20);

  // Storage keys
  static const accessTokenKey = 'access_token';
  static const refreshTokenKey = 'refresh_token';
  static const consumerIdKey = 'consumer_id';

  // OTP
  static const otpLength = 6;
  static const otpResendCooldown = 30; // seconds

  // Pagination
  static const defaultPageSize = 20;
}