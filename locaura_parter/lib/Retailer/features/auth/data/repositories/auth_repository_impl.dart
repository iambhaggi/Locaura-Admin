import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:fpdart/fpdart.dart';
import 'package:locaura_parter/core/utils/app_constants.dart';
import '../../../../../core/network/api_result.dart';
import '../../domain/entities/retailer.entity.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_remote_datasource.dart';
import '../models/retailer.model.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource _remote;
  final FlutterSecureStorage _storage;
  final SharedPreferences _prefs;

  AuthRepositoryImpl(this._remote, this._storage, this._prefs);

  @override
  ApiResult<void> sendOtp(String phone) async {
    try {
      await _remote.sendOtp(phone);
      return const Right(null);
    } on DioException catch (e) {
      return Left(ServerFailure(
        message: e.response?.data?['message'] ?? 'Failed to send OTP',
        statusCode: e.response?.statusCode,
      ));
    } catch (_) {
      return const Left(NetworkFailure(message: 'Network error. Check your connection.'));
    }
  }

  @override
  ApiResult<RetailerEntity> verifyOtp(String phone, String otp) async {
    try {
      final response = await _remote.verifyOtp(phone, otp);
      final entity = response.toEntity();

      // Save token
      await _storage.write(
        key: AppConstants.accessTokenKey,
        value: response.token,
      );

      // Save profile
      await _prefs.setString(
        AppConstants.retailerProfileKey,
        jsonEncode(entity.toJson()),
      );

      return Right(entity);
    } catch (e) {
      return Left(handleException(e));
    }
  }

  @override
  ApiResult<void> logout() async {
    await _storage.deleteAll();
    await clearPersistedProfile();
    return const Right(null);
  }

  @override
  ApiResult<RetailerEntity> updateProfile({
    String? retailerName,
    String? email,
    String? panCard,
  }) async {
    try {
      final currentProfile = await getPersistedProfile();
      if (currentProfile == null) return Left(ServerFailure(message: 'Profile not found'));

      final response = await _remote.updateProfile(
        retailerName: retailerName,
        email: email,
        panCard: panCard,
      );
      final entity = response.toEntity(
        token: currentProfile.token,
        stores: currentProfile.stores,
      );

      // Update persisted profile
      await _prefs.setString(
        AppConstants.retailerProfileKey,
        jsonEncode(entity.toJson()),
      );

      return Right(entity);
    } catch (e) {
      return Left(handleException(e));
    }
  }

  @override
  Future<RetailerEntity?> getPersistedProfile() async {
    final profileJson = _prefs.getString(AppConstants.retailerProfileKey);
    if (profileJson != null) {
      try {
        return RetailerEntity.fromJson(jsonDecode(profileJson));
      } catch (_) {
        return null;
      }
    }
    return null;
  }

  @override
  Future<void> clearPersistedProfile() async {
    await _prefs.remove(AppConstants.retailerProfileKey);
  }
}