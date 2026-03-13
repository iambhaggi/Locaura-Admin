import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../utils/app_constants.dart';

class AuthInterceptor extends Interceptor {
  final Dio dio;
  final FlutterSecureStorage storage;

  AuthInterceptor(this.dio, this.storage);

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await storage.read(key: AppConstants.accessTokenKey);
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
        final token = await storage.read(key: AppConstants.accessTokenKey);
        err.requestOptions.headers['Authorization'] = 'Bearer $token';
        final response = await dio.fetch(err.requestOptions);
        return handler.resolve(response);
      }
    }
    handler.next(err);
  }

  Future<bool> _refreshToken() async {
    try {
      final refreshToken = await storage.read(key: AppConstants.refreshTokenKey);
      if (refreshToken == null) return false;

      final response = await dio.post(
        '/api/v1/consumers/auth/refresh',
        data: {'refresh_token': refreshToken},
      );

      final newAccess = response.data['access_token'] as String?;
      final newRefresh = response.data['refresh_token'] as String?;
      if (newAccess == null) return false;

      await storage.write(key: AppConstants.accessTokenKey, value: newAccess);
      if (newRefresh != null) {
        await storage.write(key: AppConstants.refreshTokenKey, value: newRefresh);
      }
      return true;
    } catch (_) {
      return false;
    }
  }
}