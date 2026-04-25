import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:locaura_parter/Consumer/features/browse/data/repositories/store_repository.dart';
import 'package:locaura_parter/Consumer/features/product/domain/entities/consumer_product.entity.dart';

class StoreProductsState {
  final bool isLoading;
  final String? error;
  final List<ConsumerProductEntity> products;

  StoreProductsState({
    this.isLoading = false,
    this.error,
    this.products = const [],
  });
}

// Pass storeId via family
final storeProductsProvider = StateNotifierProvider.family<StoreProductsNotifier, StoreProductsState, String>((ref, storeId) {
  final repository = ref.watch(storeRepositoryProvider);
  return StoreProductsNotifier(repository, storeId);
});

class StoreProductsNotifier extends StateNotifier<StoreProductsState> {
  final StoreRepository _repository;
  final String _storeId;

  StoreProductsNotifier(this._repository, this._storeId) : super(StoreProductsState()) {
    _init();
  }

  Future<void> _init({String? categoryId}) async {
    state = StoreProductsState(isLoading: true, products: state.products);
    try {
      final products = await _repository.getStoreProducts(_storeId, categoryId: categoryId);
      state = StoreProductsState(isLoading: false, products: products);
    } catch (e) {
      state = StoreProductsState(isLoading: false, error: e.toString());
    }
  }

  Future<void> filterByCategory(String categoryId) async {
    await _init(categoryId: categoryId);
  }
}
