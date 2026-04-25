import 'package:fpdart/fpdart.dart';
import '../../../../../core/network/api_result.dart';
import '../../domain/entities/product.entity.dart';
import '../../domain/repositories/product_repository.dart';
import '../datasources/product_remote_datasource.dart';
import '../models/product.model.dart';

class ProductRepositoryImpl implements ProductRepository {
  final ProductRemoteDataSource remoteDataSource;
  ProductRepositoryImpl(this.remoteDataSource);

  @override
  Future<Either<Failure, ProductEntity>> createProduct({
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
  }) async {
    try {
      final product = await remoteDataSource.createProduct(
        storeId: storeId,
        productData: {
          'name': name,
          'brand': brand,
          'description': description,
          'base_price': basePrice,
          'categories': categories,
          'product_attributes': productAttributes.map((e) => {'name': e.name, 'value': e.value}).toList(),
          'cover_images': coverImages,
          'gender': gender,
          'tags': tags,
        },
      );
      return Right(product.toEntity());
    } catch (e) {
      return Left(handleException(e));
    }
  }

  @override
  Future<Either<Failure, List<ProductEntity>>> getStoreProducts({
    required String storeId,
    Map<String, dynamic>? filters,
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final products = await remoteDataSource.getStoreProducts(
        storeId: storeId,
        filters: filters,
        page: page,
        limit: limit,
      );
      return Right(products.map((e) => e.toEntity()).toList());
    } catch (e) {
      return Left(handleException(e));
    }
  }

  @override
  Future<Either<Failure, ProductEntity>> getProductDetails({
    required String storeId,
    required String productId,
  }) async {
    try {
      final product = await remoteDataSource.getProductDetails(
        storeId: storeId,
        productId: productId,
      );
      return Right(product.toEntity());
    } catch (e) {
      return Left(handleException(e));
    }
  }

  @override
  Future<Either<Failure, ProductEntity>> updateProduct({
    required String storeId,
    required String productId,
    required Map<String, dynamic> updateData,
  }) async {
    try {
      final product = await remoteDataSource.updateProduct(
        storeId: storeId,
        productId: productId,
        updateData: updateData,
      );
      return Right(product.toEntity());
    } catch (e) {
      return Left(handleException(e));
    }
  }

  @override
  Future<Either<Failure, bool>> deleteProduct({
    required String storeId,
    required String productId,
  }) async {
    try {
      final success = await remoteDataSource.deleteProduct(
        storeId: storeId,
        productId: productId,
      );
      return Right(success);
    } catch (e) {
      return Left(handleException(e));
    }
  }

  @override
  Future<Either<Failure, ProductVariantEntity>> createVariant({
    required String storeId,
    required String productId,
    required Map<String, dynamic> variantData,
  }) async {
    try {
      final variant = await remoteDataSource.createVariant(
        storeId: storeId,
        productId: productId,
        variantData: variantData,
      );
      return Right(variant.toEntity());
    } catch (e) {
      return Left(handleException(e));
    }
  }

  @override
  Future<Either<Failure, List<ProductVariantEntity>>> getProductVariants({
    required String storeId,
    required String productId,
  }) async {
    try {
      final variants = await remoteDataSource.getProductVariants(
        storeId: storeId,
        productId: productId,
      );
      return Right(variants.map((e) => e.toEntity()).toList());
    } catch (e) {
      return Left(handleException(e));
    }
  }

  @override
  Future<Either<Failure, ProductVariantEntity>> getVariantById({
    required String storeId,
    required String productId,
    required String variantId,
  }) async {
    try {
      final variant = await remoteDataSource.getVariantDetails(
        storeId: storeId,
        productId: productId,
        variantId: variantId,
      );
      return Right(variant.toEntity());
    } catch (e) {
      return Left(handleException(e));
    }
  }

  @override
  Future<Either<Failure, ProductVariantEntity>> updateVariant({
    required String storeId,
    required String productId,
    required String variantId,
    required Map<String, dynamic> updateData,
  }) async {
    try {
      final variant = await remoteDataSource.updateVariant(
        storeId: storeId,
        productId: productId,
        variantId: variantId,
        updateData: updateData,
      );
      return Right(variant.toEntity());
    } catch (e) {
      return Left(handleException(e));
    }
  }

  @override
  Future<Either<Failure, bool>> deleteVariant({
    required String storeId,
    required String productId,
    required String variantId,
  }) async {
    try {
      final success = await remoteDataSource.deleteVariant(
        storeId: storeId,
        productId: productId,
        variantId: variantId,
      );
      return Right(success);
    } catch (e) {
      return Left(handleException(e));
    }
  }
}
