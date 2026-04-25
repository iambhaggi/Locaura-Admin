import '../../../../../core/network/api_client.dart';
import '../../../../../core/network/api_endpoints.dart';
import '../../domain/entities/consumer_product.entity.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final productRepositoryProvider = Provider((ref) => ProductRepository(ref.watch(apiClientProvider)));

class ProductRepository {
  final ApiClient _apiClient;

  ProductRepository(this._apiClient);

  Future<ConsumerProductEntity> getProductDetails(String productId) async {
    final response = await _apiClient.get(ApiEndpoints.consumerProductDetails(productId));
    if (response.data['success'] == true) {
      return ConsumerProductEntity.fromJson(response.data['data']['product']);
    } else {
      throw Exception(response.data['message'] ?? 'Failed to fetch product details');
    }
  }
}
