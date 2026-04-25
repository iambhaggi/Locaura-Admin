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

  ApiResult<ConsumerEntity> addConsumerAddress(AddressEntity address);
  ApiResult<ConsumerEntity> updateConsumerAddress(String addressId, AddressEntity address);
  ApiResult<ConsumerEntity> setDefaultAddress(String addressId);
  ApiResult<ConsumerEntity> deleteConsumerAddress(String addressId);

  // Cart operations (Integrated into Consumer profile)
  ApiResult<ConsumerEntity> addToCart(String storeId, String variantId, int quantity);
  ApiResult<ConsumerCartEntity> updateCartQuantity(String variantId, int quantity);
  ApiResult<ConsumerEntity> removeFromCart(String variantId);
  ApiResult<void> clearCart();
}