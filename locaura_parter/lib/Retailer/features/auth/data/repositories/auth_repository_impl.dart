import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:locaura_parter/Consumer/features/auth/domain/entities/consumer.entity.dart' as c;
import 'package:locaura_parter/Retailer/features/store/domain/entities/store.entity.dart' show AddressEntity;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:fpdart/fpdart.dart';
import 'package:locaura_parter/core/utils/app_constants.dart';
import '../../../../../core/network/api_result.dart';
import '../../domain/entities/retailer.entity.dart';

import '../../../../../Consumer/features/auth/data/models/consumer.model.dart'as c;
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_remote_datasource.dart';
import '../models/retailer.model.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource _remote;
  final FlutterSecureStorage _storage;
  final SharedPreferences _prefs;

  AuthRepositoryImpl(this._remote, this._storage, this._prefs);

  @override
  ApiResult<void> sendOtp(String phone, String actorType) async {
    try {
      await _remote.sendOtp(phone,actorType);
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
  ApiResult<dynamic> verifyOtp(String phone, String otp,String actorType) async {
    try {
      final response = await _remote.verifyOtp(phone, otp,actorType);
      
      if (actorType == AppConstants.actorConsumer) {
        final entity = c.ConsumerModel.fromJson(response.data['consumer']).toEntity(
          token: response.data['token'],
        );

        // Save token
        // Save tokens
        await _storage.write(
          key: AppConstants.accessTokenKey,
          value: response.data['token'],
        );
        await _storage.write(
          key: AppConstants.actorTypeKey,
          value: actorType,
        );

        return Right(entity);
      } else {
        final entity = RetailerModel.fromJson(response.data['retailer']).toEntity(
          token: response.data['token'],
          stores: (response.data['stores'] as List)
              .map((s) => StoreSummaryModel.fromJson(s as Map<String, dynamic>).toEntity())
              .toList(),
        );

        // Save tokens
        await _storage.write(
          key: AppConstants.accessTokenKey,
          value: response.data['token'],
        );
        await _storage.write(
          key: AppConstants.actorTypeKey,
          value: actorType,
        );

        return Right(entity);
      }
    } catch (e) {
      return Left(handleException(e));
    }
  }

  @override
  ApiResult<void> logout() async {
    try {
      await _prefs.remove(AppConstants.accessTokenKey);
      await _prefs.remove(AppConstants.refreshTokenKey);
      await _storage.deleteAll();
      await clearPersistedProfile();
      return const Right(null);
    } catch (e) {
      return Left(ServerFailure(message: 'Logout failed: $e'));
    }
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

      return Right(entity);
    } catch (e) {
      return Left(handleException(e));
    }
  }

  @override
  ApiResult<RetailerEntity> getProfile() async {
    try {
      final response = await _remote.getProfile();
      var entity = response.toEntity();

      return Right(entity);
    } catch (e) {
      return Left(handleException(e));
    }
  }

  @override
  Future<RetailerEntity?> getPersistedProfile() async {
    return null;
  }

  @override
  Future<void> clearPersistedProfile() async {
    await _prefs.remove(AppConstants.retailerProfileKey);
  }

  @override
  ApiResult<c.ConsumerEntity> getConsumerProfile() async {
    try {
      final response = await _remote.getConsumerProfile();
      
      final token = response.token;
      if (token == null) return Left(ServerFailure(message: 'Authentication token missing'));
      
      final entity = response.consumer.toEntity(token: token);

      return Right(entity);
    } catch (e) {
      return Left(handleException(e));
    }
  }

  @override
  Future<c.ConsumerEntity?> getPersistedConsumerProfile() async {
    return null;
  }

  @override
  ApiResult<c.ConsumerEntity> updateConsumerProfile({
    String? name,
    String? email,
  }) async {
    try {
      final response = await _remote.updateConsumerProfile(
        name: name,
        email: email,
      );
      
      final token = response.token ?? '';
      return Right(response.consumer.toEntity(token: token));
    } catch (e) {
      return Left(handleException(e));
    }
  }

  @override
  ApiResult<List<c.AddressEntity>> addConsumerAddress(c.AddressEntity address) async {
    try {
      // Convert entity to model for network request
      final model = c.AddressModel(
        label: address.label,
        line1: address.line1,
        line2: address.line2 ?? '',
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        isDefault: address.isDefault,
        location: address.location != null
            ? c.LocationModel(
                type: address.location!.type,
                coordinates: [address.location!.coordinates[0], address.location!.coordinates[1]],
              )
            : null,
      );

      final response = await _remote.addConsumerAddress(model);
      final entity = response.consumer.toEntity(token: response.token ?? '');

      return Right(entity.addresses);
    } catch (e) {
      return Left(handleException(e));
    }
  }

  @override
  ApiResult<List<c.AddressEntity>> updateConsumerAddress(String addressId, c.AddressEntity address) async {
    try {
      // Convert entity to model
      final model = c.AddressModel(
        id: addressId,
        label: address.label,
        line1: address.line1,
        line2: address.line2 ?? '',
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        isDefault: address.isDefault,
        location: address.location != null
            ? c.LocationModel(
                type: address.location!.type,
                coordinates: [address.location!.coordinates[0], address.location!.coordinates[1]],
              )
            : null,
      );

      final response = await _remote.updateConsumerAddress(addressId, model);
      final entity = response.consumer.toEntity(token: response.token ?? '');

      return Right(entity.addresses);
    } catch (e) {
      return Left(handleException(e));
    }
  }
  @override
  ApiResult<List<c.AddressEntity>> setDefaultAddress(String addressId) async {
    try {
      final response = await _remote.setDefaultAddress(addressId);
      final entity = response.consumer.toEntity(token: response.token ?? '');

      return Right(entity.addresses);
    } catch (e) {
      return Left(handleException(e));
    }
  }

  @override
  ApiResult<List<c.AddressEntity>> deleteConsumerAddress(String addressId) async {
    try {
      final response = await _remote.deleteConsumerAddress(addressId);
      final entity = response.consumer.toEntity(token: response.token ?? '');

      return Right(entity.addresses);
    } catch (e) {
      return Left(handleException(e));
    }
  }
}