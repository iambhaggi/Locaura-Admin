import '../../../../../core/network/api_client.dart';
import '../../../../../core/network/api_endpoints.dart';
import '../domain/entities/cart.entity.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final cartRepositoryProvider = Provider((ref) => CartRepository(ref.watch(apiClientProvider)));

class CartRepository {
  final ApiClient _apiClient;

  CartRepository(this._apiClient);

  Future<CartEntity> getCart() async {
    final response = await _apiClient.get(ApiEndpoints.consumerCart);
    if (response.data['success'] == true) {
      return CartEntity.fromJson(response.data['data']['cart']);
    } else {
      throw Exception(response.data['message'] ?? 'Failed to fetch cart');
    }
  }

  Future<CartEntity> addToCart(String variantId, int quantity) async {
    final response = await _apiClient.post(
      ApiEndpoints.consumerCartAdd,
      data: {'variant_id': variantId, 'quantity': quantity},
    );
    if (response.data['success'] == true) {
      return CartEntity.fromJson(response.data['data']['cart']);
    } else {
      throw Exception(response.data['message'] ?? 'Failed to add to cart');
    }
  }

  Future<CartEntity> updateQuantity(String variantId, int quantity) async {
    final response = await _apiClient.put(
      ApiEndpoints.consumerCartUpdate(variantId),
      data: {'quantity': quantity},
    );
    if (response.data['success'] == true) {
      return CartEntity.fromJson(response.data['data']['cart']);
    } else {
      throw Exception(response.data['message'] ?? 'Failed to update quantity');
    }
  }

  Future<CartEntity> removeFromCart(String variantId) async {
    final response = await _apiClient.delete(ApiEndpoints.consumerCartRemove(variantId));
    if (response.data['success'] == true) {
      return CartEntity.fromJson(response.data['data']['cart']);
    } else {
      throw Exception(response.data['message'] ?? 'Failed to remove from cart');
    }
  }

  Future<void> clearCart() async {
    final response = await _apiClient.post(ApiEndpoints.consumerCartClear);
    if (response.data['success'] != true) {
      throw Exception(response.data['message'] ?? 'Failed to clear cart');
    }
  }
}
