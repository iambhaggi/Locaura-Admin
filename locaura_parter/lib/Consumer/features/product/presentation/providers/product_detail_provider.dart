import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/consumer_product.entity.dart';
import '../../data/repositories/product_repository.dart';

class ProductDetailState {
  final ConsumerProductEntity? product;
  final bool isLoading;
  final String? error;

  ProductDetailState({this.product, this.isLoading = false, this.error});

  ProductDetailState copyWith({
    ConsumerProductEntity? product,
    bool? isLoading,
    String? error,
  }) {
    return ProductDetailState(
      product: product ?? this.product,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

final productDetailNotifierProvider = StateNotifierProvider.family<ProductDetailNotifier, ProductDetailState, String>((ref, productId) {
  return ProductDetailNotifier(ref.watch(productRepositoryProvider), productId);
});

class ProductDetailNotifier extends StateNotifier<ProductDetailState> {
  final ProductRepository _repository;
  final String _productId;

  ProductDetailNotifier(this._repository, this._productId) : super(ProductDetailState(isLoading: true)) {
    fetchProductDetails();
  }

  Future<void> fetchProductDetails() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final product = await _repository.getProductDetails(_productId);
      state = state.copyWith(product: product, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }
}
