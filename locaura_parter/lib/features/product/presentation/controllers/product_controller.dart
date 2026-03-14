import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:freezed_annotation/freezed_annotation.dart';
import '../../../../core/di/locator.dart';
import '../../domain/entities/product.entity.dart';
import '../../domain/usecases/product_usecases.dart';

part 'product_controller.freezed.dart';

@freezed
class ProductState with _$ProductState {
  const factory ProductState.initial() = _Initial;
  const factory ProductState.loading() = _Loading;
  const factory ProductState.success(List<ProductEntity> products) = _Success;
  const factory ProductState.productCreated(ProductEntity product) = _ProductCreated;
  const factory ProductState.productUpdated(ProductEntity product) = _ProductUpdated;
  const factory ProductState.productDeleted() = _ProductDeleted;
  const factory ProductState.productLoaded(ProductEntity product) = _ProductLoaded;
  const factory ProductState.variantsLoaded(List<ProductVariantEntity> variants) = _VariantsLoaded;
  const factory ProductState.variantCreated(ProductVariantEntity variant) = _VariantCreated;
  const factory ProductState.variantUpdated(ProductVariantEntity variant) = _VariantUpdated;
  const factory ProductState.variantDeleted() = _ProductDeletedVariant;
  const factory ProductState.error(String message) = _Error;
}

class ProductController extends StateNotifier<ProductState> {
  final CreateProduct _createProduct;
  final GetStoreProducts _getStoreProducts;
  final GetProductDetails _getProductDetails;
  final UpdateProduct _updateProduct;
  final DeleteProduct _deleteProduct;
  final CreateVariant _createVariant;
  final GetProductVariants _getProductVariants;
  final UpdateVariant _updateVariant;
  final DeleteVariant _deleteVariant;

  ProductController({
    required CreateProduct createProduct,
    required GetStoreProducts getStoreProducts,
    required GetProductDetails getProductDetails,
    required UpdateProduct updateProduct,
    required DeleteProduct deleteProduct,
    required CreateVariant createVariant,
    required GetProductVariants getProductVariants,
    required UpdateVariant updateVariant,
    required DeleteVariant deleteVariant,
  })  : _createProduct = createProduct,
        _getStoreProducts = getStoreProducts,
        _getProductDetails = getProductDetails,
        _updateProduct = updateProduct,
        _deleteProduct = deleteProduct,
        _createVariant = createVariant,
        _getProductVariants = getProductVariants,
        _updateVariant = updateVariant,
        _deleteVariant = deleteVariant,
        super(const ProductState.initial());

  Future<void> fetchProductDetails(String storeId, String productId) async {
    state = const ProductState.loading();
    final result = await _getProductDetails(storeId: storeId, productId: productId);
    result.fold(
      (failure) => state = ProductState.error(failure.message),
      (product) => state = ProductState.productLoaded(product),
    );
  }

  Future<void> fetchStoreProducts(String storeId, {Map<String, dynamic>? filters}) async {
    state = const ProductState.loading();
    final result = await _getStoreProducts(storeId: storeId, filters: filters);
    result.fold(
      (failure) => state = ProductState.error(failure.message),
      (products) => state = ProductState.success(products),
    );
  }

  Future<void> createNewProduct(String storeId, {
    required String name,
    String? brand,
    String? description,
    required double basePrice,
    required List<String> categories,
    required List<ProductAttributeEntity> productAttributes,
    required List<String> coverImages,
    String? gender,
    required List<String> tags,
  }) async {
    state = const ProductState.loading();
    final result = await _createProduct(
      storeId: storeId,
      name: name,
      brand: brand,
      description: description,
      basePrice: basePrice,
      categories: categories,
      productAttributes: productAttributes,
      coverImages: coverImages,
      gender: gender,
      tags: tags,
    );
    result.fold(
      (failure) => state = ProductState.error(failure.message),
      (product) {
        state = ProductState.productCreated(product);
        fetchStoreProducts(storeId);
      },
    );
  }

  Future<void> updateExistingProduct(String storeId, String productId, Map<String, dynamic> updateData) async {
    state = const ProductState.loading();
    final result = await _updateProduct(storeId: storeId, productId: productId, updateData: updateData);
    result.fold(
      (failure) => state = ProductState.error(failure.message),
      (product) {
        state = ProductState.productUpdated(product);
        fetchStoreProducts(storeId);
      },
    );
  }

  Future<void> deleteExistingProduct(String storeId, String productId) async {
    state = const ProductState.loading();
    final result = await _deleteProduct(storeId: storeId, productId: productId);
    result.fold(
      (failure) => state = ProductState.error(failure.message),
      (_) {
        state = const ProductState.productDeleted();
        fetchStoreProducts(storeId);
      },
    );
  }

  Future<void> fetchVariants(String storeId, String productId) async {
    state = const ProductState.loading();
    final result = await _getProductVariants(storeId: storeId, productId: productId);
    result.fold(
      (failure) => state = ProductState.error(failure.message),
      (variants) => state = ProductState.variantsLoaded(variants),
    );
  }

  Future<void> addVariant(String storeId, String productId, Map<String, dynamic> variantData) async {
    state = const ProductState.loading();
    final result = await _createVariant(storeId: storeId, productId: productId, variantData: variantData);
    result.fold(
      (failure) => state = ProductState.error(failure.message),
      (variant) {
        state = ProductState.variantCreated(variant);
        fetchVariants(storeId, productId);
      },
    );
  }

  Future<void> updateExistingVariant(String storeId, String productId, String variantId, Map<String, dynamic> updateData) async {
    state = const ProductState.loading();
    final result = await _updateVariant(
      storeId: storeId,
      productId: productId,
      variantId: variantId,
      updateData: updateData,
    );
    result.fold(
      (failure) => state = ProductState.error(failure.message),
      (variant) {
        state = ProductState.variantUpdated(variant);
        fetchVariants(storeId, productId);
      },
    );
  }

  Future<void> deleteExistingVariant(String storeId, String productId, String variantId) async {
    state = const ProductState.loading();
    final result = await _deleteVariant(
      storeId: storeId,
      productId: productId,
      variantId: variantId,
    );
    result.fold(
      (failure) => state = ProductState.error(failure.message),
      (_) {
        state = const ProductState.variantDeleted();
        fetchVariants(storeId, productId);
      },
    );
  }
}

final productControllerProvider =
    StateNotifierProvider<ProductController, ProductState>((ref) {
  return ProductController(
    getProductDetails: getIt<GetProductDetails>(),
    createProduct: getIt<CreateProduct>(),
    getStoreProducts: getIt<GetStoreProducts>(),
    updateProduct: getIt<UpdateProduct>(),
    deleteProduct: getIt<DeleteProduct>(),
    createVariant: getIt<CreateVariant>(),
    getProductVariants: getIt<GetProductVariants>(),
    updateVariant: getIt<UpdateVariant>(),
    deleteVariant: getIt<DeleteVariant>(),
  );
});
