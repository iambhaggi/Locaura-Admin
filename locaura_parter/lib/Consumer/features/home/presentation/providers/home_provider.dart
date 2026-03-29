import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/category.entity.dart';
import '../../domain/entities/nearby_store.entity.dart';
import '../../data/repositories/home_repository.dart';
import '../../../../../Retailer/features/auth/presentation/controllers/auth_controller.dart';

class HomeState {
  final bool isLoading;
  final String? error;
  final List<CategoryEntity> categories;
  final List<NearbyStoreEntity> nearbyStores;
  HomeState({
    this.isLoading = false,
    this.error,
    this.categories = const [],
    this.nearbyStores = const [],
  });

  HomeState copyWith({
    bool? isLoading,
    String? error,
    List<CategoryEntity>? categories,
    List<NearbyStoreEntity>? nearbyStores,
  }) {
    return HomeState(
      isLoading: isLoading ?? this.isLoading,
      error: error, // overwrite error explicitly
      categories: categories ?? this.categories,
      nearbyStores: nearbyStores ?? this.nearbyStores,
    );
  }
}

final homeNotifierProvider = StateNotifierProvider<HomeNotifier, HomeState>((ref) {
  final repository = ref.watch(homeRepositoryProvider);
  return HomeNotifier(repository, ref);
});

class HomeNotifier extends StateNotifier<HomeState> {
  final HomeRepository _repository;
  final Ref _ref;

  HomeNotifier(this._repository, this._ref) : super(HomeState()) {
    _init();
  }

  Future<void> _init() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      // 1. Fetch categories
      // final categories = await _repository.getCategories();
      
      final address = null; // Removed ref.watch logic here, address should come from arguments or be passed separately to the provider, but for now we fetch generally or use defaults.
      
      // 3. Fetch nearby stores
      List<NearbyStoreEntity> stores = [];
      if (address != null) {
        stores = await _repository.getNearbyStores(
          address.location!.coordinates[0],
          address.location!.coordinates[1],
          category: null,
        );
      }

      state = state.copyWith(
        isLoading: false,
        nearbyStores: stores,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> refresh() async {
    await _init();
  }
}
