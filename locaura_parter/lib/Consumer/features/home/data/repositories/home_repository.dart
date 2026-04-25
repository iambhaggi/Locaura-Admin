import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../core/network/api_client.dart';
import '../../../../../core/network/api_endpoints.dart';
import '../../domain/entities/category.entity.dart';
import '../../domain/entities/nearby_store.entity.dart';

final homeRepositoryProvider = Provider<HomeRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return HomeRepository(apiClient);
});

class HomeRepository {
  final ApiClient _apiClient;

  HomeRepository(this._apiClient);

  Future<List<CategoryEntity>> getCategories() async {
    try {
      final response = await _apiClient.get(ApiEndpoints.consumerCategories);
      if (response.data['success'] == true) {
        final List data = response.data['data']['categories'] ?? [];
        return data.map((json) => CategoryEntity.fromJson(json as Map<String, dynamic>)).toList();
      }
      throw Exception('Failed to load categories');
    } catch (e) {
      throw Exception('Category API error: $e');
    }
  }

  Future<List<NearbyStoreEntity>> getNearbyStores(double lat, double lng, {double radius = 10, String? category}) async {
    try {
      final response = await _apiClient.get(
        ApiEndpoints.consumerNearbyStores(lat, lng, radius: radius, category: category),
      );
      if (response.data['success'] == true) {
        final List data = response.data['data']['stores'] ?? [];
        return data.map((json) => NearbyStoreEntity.fromJson(json as Map<String, dynamic>)).toList();
      }
      throw Exception('Failed to load nearby stores');
    } catch (e) {
      throw Exception('Nearby Stores API error: $e');
    }
  }

  Future<Map<String, dynamic>> searchNearby(String query, {double? lat, double? lng, double radius = 10}) async {
    try {
      final response = await _apiClient.get(
        ApiEndpoints.consumerSearchStoresAndProducts(query, lat: lat, lng: lng, radius: radius),
      );
      if (response.data['success'] == true) {
        return response.data['data'] as Map<String, dynamic>;
      }
      throw Exception('Failed to search');
    } catch (e) {
      throw Exception('Search API error: $e');
    }
  }
}
