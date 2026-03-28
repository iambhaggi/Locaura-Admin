import '../../../../../core/network/api_result.dart';
import '../entities/retailer.entity.dart';

abstract class AuthRepository {
  ApiResult<void> sendOtp(String phone);
  ApiResult<RetailerEntity> verifyOtp(String phone, String otp);
  ApiResult<void> logout();
  ApiResult<RetailerEntity> updateProfile({
    String? retailerName,
    String? email,
    String? panCard,
  });
  Future<RetailerEntity?> getPersistedProfile();
  Future<void> clearPersistedProfile();
}