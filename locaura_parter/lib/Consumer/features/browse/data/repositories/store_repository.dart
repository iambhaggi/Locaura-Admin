import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:locaura_parter/Consumer/features/product/domain/entities/consumer_product.entity.dart';
import '../../../../../core/network/api_client.dart';
import '../../../../../core/network/api_endpoints.dart';

final storeRepositoryProvider = Provider<StoreRepository>((ref) {
  final dio = ref.watch(apiClientProvider).dio;
  return StoreRepository(dio);
});

class StoreRepository {
  final Dio _dio;

  StoreRepository(this._dio);

  Future<List<ConsumerProductEntity>> getStoreProducts(String storeId, {String? categoryId}) async {
    try {
      final Map<String, dynamic> query = {};
      if (categoryId != null && categoryId.isNotEmpty) {
        query['category'] = categoryId;
      }
      
      final response = await _dio.get(
        ApiEndpoints.consumerStoreProducts(storeId),
        queryParameters: query,
      );
      if (response.data['success'] == true) {
        final List data = response.data['data']['products'];
        return data.map((e) => ConsumerProductEntity.fromJson(e)).toList();
      }
      throw Exception('Failed to load store products');
    } catch (e) {
      throw Exception('Store Products API error: $e');
    }
  }
}
