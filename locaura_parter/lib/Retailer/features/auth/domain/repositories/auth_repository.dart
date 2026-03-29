import '../../../../../core/network/api_result.dart';
import '../entities/retailer.entity.dart';
import '../../../../../Consumer/features/auth/domain/entities/consumer.entity.dart';

abstract class AuthRepository {
  ApiResult<void> sendOtp(String phone, String actorType);
  ApiResult<dynamic> verifyOtp(String phone, String otp,String actorType);
  ApiResult<void> logout();
  ApiResult<RetailerEntity> updateProfile({
    String? retailerName,
    String? email,
    String? panCard,
  });
  ApiResult<RetailerEntity> getProfile();
  Future<RetailerEntity?> getPersistedProfile();
  Future<void> clearPersistedProfile();

  // Consumer specific
  ApiResult<ConsumerEntity> getConsumerProfile();
  Future<ConsumerEntity?> getPersistedConsumerProfile();

  ApiResult<ConsumerEntity> updateConsumerProfile({
    String? name,
    String? email,
  });

  ApiResult<List<AddressEntity>> addConsumerAddress(AddressEntity address);
  ApiResult<List<AddressEntity>> updateConsumerAddress(String addressId, AddressEntity address);
  ApiResult<List<AddressEntity>> setDefaultAddress(String addressId);
  ApiResult<List<AddressEntity>> deleteConsumerAddress(String addressId);
}