import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../utils/app_constants.dart';

class AuthInterceptor extends Interceptor {
  final Dio dio;

  AuthInterceptor(this.dio);

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(AppConstants.accessTokenKey);
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    if (err.response?.statusCode == 401) {
      final refreshed = await _refreshToken();
      if (refreshed) {
        final prefs = await SharedPreferences.getInstance();
        final token = prefs.getString(AppConstants.accessTokenKey);
        err.requestOptions.headers['Authorization'] = 'Bearer $token';
        final response = await dio.fetch(err.requestOptions);
        return handler.resolve(response);
      }
    }
    handler.next(err);
  }

  Future<bool> _refreshToken() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final refreshToken = prefs.getString(AppConstants.refreshTokenKey);
      if (refreshToken == null) return false;

      final response = await dio.post(
        '/api/v1/consumers/auth/refresh',
        data: {'refresh_token': refreshToken},
      );

      final newAccess = response.data['access_token'] as String?;
      final newRefresh = response.data['refresh_token'] as String?;
      if (newAccess == null) return false;

      await prefs.setString(AppConstants.accessTokenKey, newAccess);
      if (newRefresh != null) {
        await prefs.setString(AppConstants.refreshTokenKey, newRefresh);
      }
      return true;
    } catch (_) {
      return false;
    }
  }
}