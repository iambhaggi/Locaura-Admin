import 'dart:io';
import 'package:image_picker/image_picker.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:freezed_annotation/freezed_annotation.dart';
import '../../../../../core/di/locator.dart';
import '../../../../../core/network/upload_repository.dart';
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
  const factory ProductState.imageUploading() = _ImageUploading;
  const factory ProductState.imageUploaded(String url) = _ImageUploaded;
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
  final GetVariantDetails _getVariantDetails;
  final UpdateVariant _updateVariant;
  final DeleteVariant _deleteVariant;
  final UploadRepository _uploadRepository;
  final ImagePicker _picker = ImagePicker();

  ProductController({
    required CreateProduct createProduct,
    required GetStoreProducts getStoreProducts,
    required GetProductDetails getProductDetails,
    required UpdateProduct updateProduct,
    required DeleteProduct deleteProduct,
    required CreateVariant createVariant,
    required GetProductVariants getProductVariants,
    required GetVariantDetails getVariantDetails,
    required UpdateVariant updateVariant,
    required DeleteVariant deleteVariant,
    required UploadRepository uploadRepository,
  })  : _createProduct = createProduct,
        _getStoreProducts = getStoreProducts,
        _getProductDetails = getProductDetails,
        _updateProduct = updateProduct,
        _deleteProduct = deleteProduct,
        _createVariant = createVariant,
        _getProductVariants = getProductVariants,
        _getVariantDetails = getVariantDetails,
        _updateVariant = updateVariant,
        _deleteVariant = deleteVariant,
        _uploadRepository = uploadRepository,
        super(const ProductState.initial());

  Future<void> fetchProductDetails(String storeId, String productId) async {
    state = const ProductState.loading();
    final result = await _getProductDetails(storeId: storeId, productId: productId);
    result.fold(
      (failure) => state = ProductState.error(failure.message),
      (product) => state = ProductState.productLoaded(product),
    );
  }

  Future<ProductEntity?> getProductDetailsData(String storeId, String productId) async {
    final result = await _getProductDetails(storeId: storeId, productId: productId);
    return result.fold(
      (failure) {
        state = ProductState.error(failure.message);
        return null;
      },
      (product) => product,
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

  Future<ProductEntity?> createProductData(String storeId, {
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
    return result.fold(
      (failure) {
        state = ProductState.error(failure.message);
        return null;
      },
      (product) {
        fetchStoreProducts(storeId);
        return product;
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

  Future<ProductEntity?> updateProductData(String storeId, String productId, Map<String, dynamic> updateData) async {
    final result = await _updateProduct(storeId: storeId, productId: productId, updateData: updateData);
    return result.fold(
      (failure) {
        state = ProductState.error(failure.message);
        return null;
      },
      (product) {
        fetchStoreProducts(storeId);
        return product;
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

  Future<List<ProductVariantEntity>?> getProductVariantsData(String storeId, String productId) async {
    final result = await _getProductVariants(storeId: storeId, productId: productId);
    return result.fold(
      (failure) {
        state = ProductState.error(failure.message);
        return null;
      },
      (variants) => variants,
    );
  }

  Future<ProductVariantEntity?> fetchVariantDetails(
    String storeId,
    String productId,
    String variantId,
  ) async {
    final result = await _getVariantDetails(
      storeId: storeId,
      productId: productId,
      variantId: variantId,
    );

    return result.fold(
      (failure) {
        state = ProductState.error(failure.message);
        return null;
      },
      (variant) => variant,
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

  Future<ProductVariantEntity?> createVariantData(String storeId, String productId, Map<String, dynamic> variantData) async {
    final result = await _createVariant(storeId: storeId, productId: productId, variantData: variantData);
    return result.fold(
      (failure) {
        state = ProductState.error(failure.message);
        return null;
      },
      (variant) => variant,
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

  Future<ProductVariantEntity?> updateVariantData(String storeId, String productId, String variantId, Map<String, dynamic> updateData) async {
    final result = await _updateVariant(
      storeId: storeId,
      productId: productId,
      variantId: variantId,
      updateData: updateData,
    );
    return result.fold(
      (failure) {
        state = ProductState.error(failure.message);
        return null;
      },
      (variant) => variant,
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

  Future<bool> deleteVariantData(String storeId, String productId, String variantId) async {
    final result = await _deleteVariant(
      storeId: storeId,
      productId: productId,
      variantId: variantId,
    );
    return result.fold(
      (failure) {
        state = ProductState.error(failure.message);
        return false;
      },
      (_) => true,
    );
  }

  Future<String?> pickAndUploadImage() async {
    try {
      final XFile? image = await _picker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 80,
      );

      if (image == null) return null;

      state = const ProductState.imageUploading();
      
      final result = await _uploadRepository.uploadImage(File(image.path));

      return result.fold(
        (failure) {
          state = ProductState.error(failure.message);
          return null;
        },
        (url) {
          state = ProductState.imageUploaded(url);
          return url;
        },
      );
    } catch (e) {
      state = ProductState.error(e.toString());
      return null;
    }
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
    getVariantDetails: getIt<GetVariantDetails>(),
    updateVariant: getIt<UpdateVariant>(),
    deleteVariant: getIt<DeleteVariant>(),
    uploadRepository: ref.watch(uploadRepositoryProvider),
  );
});
