import 'package:fpdart/fpdart.dart';
import 'package:locaura_parter/core/network/api_result.dart';
import '../entities/product.entity.dart';

abstract class ProductRepository {
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
  });

  Future<Either<Failure, List<ProductEntity>>> getStoreProducts({
    required String storeId,
    Map<String, dynamic>? filters,
    int page = 1,
    int limit = 20,
  });

  Future<Either<Failure, ProductEntity>> getProductDetails({
    required String storeId,
    required String productId,
  });

  Future<Either<Failure, ProductEntity>> updateProduct({
    required String storeId,
    required String productId,
    required Map<String, dynamic> updateData,
  });

  Future<Either<Failure, bool>> deleteProduct({
    required String storeId,
    required String productId,
  });

  Future<Either<Failure, ProductVariantEntity>> createVariant({
    required String storeId,
    required String productId,
    required Map<String, dynamic> variantData,
  });

  Future<Either<Failure, List<ProductVariantEntity>>> getProductVariants({
    required String storeId,
    required String productId,
  });

  Future<Either<Failure, ProductVariantEntity>> getVariantById({
    required String storeId,
    required String productId,
    required String variantId,
  });

  Future<Either<Failure, ProductVariantEntity>> updateVariant({
    required String storeId,
    required String productId,
    required String variantId,
    required Map<String, dynamic> updateData,
  });

  Future<Either<Failure, bool>> deleteVariant({
    required String storeId,
    required String productId,
    required String variantId,
  });
}
