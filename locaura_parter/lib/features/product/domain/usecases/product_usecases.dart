import 'package:fpdart/fpdart.dart';
import '../../../../core/network/api_result.dart';
import '../entities/product.entity.dart';
import '../repositories/product_repository.dart';

class CreateProduct {
  final ProductRepository repository;
  CreateProduct(this.repository);

  Future<Either<Failure, ProductEntity>> call({
    required String storeId,
    required String name,
    String? brand,
    String? description,
    required double basePrice,
    required List<String> categories,
    required List<ProductAttributeEntity> productAttributes,
    required List<String> coverImages,
    String? gender,
    required List<String> tags,
  }) {
    return repository.createProduct(
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
  }
}

class GetStoreProducts {
  final ProductRepository repository;
  GetStoreProducts(this.repository);

  Future<Either<Failure, List<ProductEntity>>> call({
    required String storeId,
    Map<String, dynamic>? filters,
    int page = 1,
    int limit = 20,
  }) {
    return repository.getStoreProducts(
      storeId: storeId,
      filters: filters,
      page: page,
      limit: limit,
    );
  }
}

class CreateVariant {
  final ProductRepository repository;
  CreateVariant(this.repository);

  Future<Either<Failure, ProductVariantEntity>> call({
    required String storeId,
    required String productId,
    required Map<String, dynamic> variantData,
  }) {
    return repository.createVariant(
      storeId: storeId,
      productId: productId,
      variantData: variantData,
    );
  }
}

class GetProductVariants {
  final ProductRepository repository;
  GetProductVariants(this.repository);

  Future<Either<Failure, List<ProductVariantEntity>>> call({
    required String storeId,
    required String productId,
  }) {
    return repository.getProductVariants(
      storeId: storeId,
      productId: productId,
    );
  }
}

class GetProductDetails {
  final ProductRepository repository;
  GetProductDetails(this.repository);

  Future<Either<Failure, ProductEntity>> call({
    required String storeId,
    required String productId,
  }) {
    return repository.getProductDetails(
      storeId: storeId,
      productId: productId,
    );
  }
}

class UpdateProduct {
  final ProductRepository repository;
  UpdateProduct(this.repository);

  Future<Either<Failure, ProductEntity>> call({
    required String storeId,
    required String productId,
    required Map<String, dynamic> updateData,
  }) {
    return repository.updateProduct(
      storeId: storeId,
      productId: productId,
      updateData: updateData,
    );
  }
}

class DeleteProduct {
  final ProductRepository repository;
  DeleteProduct(this.repository);

  Future<Either<Failure, bool>> call({
    required String storeId,
    required String productId,
  }) {
    return repository.deleteProduct(
      storeId: storeId,
      productId: productId,
    );
  }
}

class UpdateVariant {
  final ProductRepository repository;
  UpdateVariant(this.repository);

  Future<Either<Failure, ProductVariantEntity>> call({
    required String storeId,
    required String productId,
    required String variantId,
    required Map<String, dynamic> updateData,
  }) {
    return repository.updateVariant(
      storeId: storeId,
      productId: productId,
      variantId: variantId,
      updateData: updateData,
    );
  }
}

class DeleteVariant {
  final ProductRepository repository;
  DeleteVariant(this.repository);

  Future<Either<Failure, bool>> call({
    required String storeId,
    required String productId,
    required String variantId,
  }) {
    return repository.deleteVariant(
      storeId: storeId,
      productId: productId,
      variantId: variantId,
    );
  }
}
