import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../Retailer/features/auth/presentation/controllers/auth_controller.dart';
import '../../../home/data/repositories/home_repository.dart';
import '../../../home/domain/entities/nearby_store.entity.dart';

class SearchState {
  final bool isLoading;
  final String? error;
  final List<NearbyStoreEntity> stores;
  final List<dynamic> products;
  
  SearchState({
    this.isLoading = false,
    this.error,
    this.stores = const [],
    this.products = const [],
  });

  SearchState copyWith({
    bool? isLoading,
    String? error,
    List<NearbyStoreEntity>? stores,
    List<dynamic>? products,
  }) {
    return SearchState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      stores: stores ?? this.stores,
      products: products ?? this.products,
    );
  }
}

final searchNotifierProvider = StateNotifierProvider<SearchNotifier, SearchState>((ref) {
  final repository = ref.watch(homeRepositoryProvider);
  return SearchNotifier(repository, ref);
});

class SearchNotifier extends StateNotifier<SearchState> {
  final HomeRepository _repository;
  final Ref _ref;
  Timer? _debounce;

  SearchNotifier(this._repository, this._ref) : super(SearchState());

  @override
  void dispose() {
    _debounce?.cancel();
    super.dispose();
  }

  void search(String query) {
    if (_debounce?.isActive ?? false) _debounce!.cancel();
    
    if (query.trim().isEmpty) {
      state = SearchState();
      return;
    }

    _debounce = Timer(const Duration(milliseconds: 500), () async {
      state = state.copyWith(isLoading: true, error: null);
      try {
        final authState = _ref.read(authControllerProvider);
        double? lat;
        double? lng;
        
        // Try getting location from selected address
        authState.maybeWhen(
          consumerAuthenticated: (consumer) {
            final address = consumer.selectedAddress;
            if (address != null && address.location != null && address.location!.coordinates.length >= 2) {
              lng = address.location!.coordinates[0];
              lat = address.location!.coordinates[1];
            }
          },
          orElse: () {},
        );

        if (lat == null || lng == null) {
          throw Exception("Please set your location first to search.");
        }

        final data = await _repository.searchNearby(lat!, lng!, query);
        
        final storesJson = data['stores'] as List? ?? [];
        final stores = storesJson.map((json) => NearbyStoreEntity.fromJson(json as Map<String, dynamic>)).toList();
        final products = data['products'] as List? ?? [];

        state = state.copyWith(
          isLoading: false,
          stores: stores,
          products: products,
        );
      } catch (e) {
        state = state.copyWith(isLoading: false, error: e.toString());
      }
    });
  }
}
