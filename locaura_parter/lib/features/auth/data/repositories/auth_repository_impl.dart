import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:fpdart/fpdart.dart';
import 'package:locaura_parter/core/utils/app_constants.dart';
import '../../../../core/network/api_result.dart';
import '../../domain/entities/retailer.entity.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_remote_datasource.dart';
import '../models/retailer.model.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource _remote;
  final FlutterSecureStorage _storage;

  AuthRepositoryImpl(this._remote, this._storage);

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
  @override
ApiResult<RetailerEntity> verifyOtp(String phone, String otp) async {
  try {
    final response = await _remote.verifyOtp(phone, otp);
    await _storage.write(
      key: AppConstants.accessTokenKey,
      value: response.token,
    );
    return Right(response.toEntity());
  } catch (e) {
    return Left(handleException(e));
  }
}

  @override
  ApiResult<void> logout() async {
    await _storage.deleteAll();
    return const Right(null);
  }
}