import 'package:locaura_parter/Consumer/features/auth/domain/entities/consumer.entity.dart';

import '../../../../../core/network/api_client.dart';
import '../../../../../core/network/api_endpoints.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';


final cartRepositoryProvider = Provider((ref) => CartRepository(ref.watch(apiClientProvider)));

class CartRepository {
  final ApiClient _apiClient;

  CartRepository(this._apiClient);

  Future<ConsumerCartEntity> getCart() async {
    final response = await _apiClient.get(ApiEndpoints.consumerCart);
    if (response.data['success'] == true) {
      return ConsumerCartEntity.fromJson(response.data['data']);
    } else {
      throw Exception(response.data['message'] ?? 'Failed to fetch cart');
    }
  }

  Future<ConsumerCartEntity> addToCart(String storeId, String variantId, int quantity) async {
    final response = await _apiClient.post(
      ApiEndpoints.consumerCartAdd,
      data: {
        'store_id': storeId,
        'variant_id': variantId,
        'quantity': quantity,
      },
    );
    if (response.data['success'] == true) {
      return ConsumerCartEntity.fromJson(response.data['data']);
    } else {
      throw Exception(response.data['message'] ?? 'Failed to add to cart');
    }
  }

  Future<ConsumerCartEntity> updateQuantity(String variantId, int quantity) async {
    final response = await _apiClient.patch(
      ApiEndpoints.consumerCartUpdate(variantId),
      data: {'quantity': quantity},
    );
    if (response.data['success'] == true) {
      return ConsumerCartEntity.fromJson(response.data['data']);
    } else {
      throw Exception(response.data['message'] ?? 'Failed to update quantity');
    }
  }

  Future<ConsumerCartEntity> removeFromCart(String variantId) async {
    final response = await _apiClient.delete(ApiEndpoints.consumerCartRemove(variantId));
    if (response.data['success'] == true) {
      return ConsumerCartEntity.fromJson(response.data['data']);
    } else {
      throw Exception(response.data['message'] ?? 'Failed to remove from cart');
    }
  }

  Future<void> clearCart() async {
    final response = await _apiClient.delete(ApiEndpoints.consumerCartClear);
    if (response.data['success'] != true) {
      throw Exception(response.data['message'] ?? 'Failed to clear cart');
    }
  }
}
