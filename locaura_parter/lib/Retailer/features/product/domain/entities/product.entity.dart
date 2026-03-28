import 'package:freezed_annotation/freezed_annotation.dart';

part 'product.entity.freezed.dart';
part 'product.entity.g.dart';

@freezed
class ProductEntity with _$ProductEntity {
  const factory ProductEntity({
    required String id,
    required String storeId,
    required String retailerId,
    required String name,
    String? slug,
    String? brand,
    String? description,
    required double basePrice,
    double? baseCompareAtPrice,
    @Default([]) List<String> categories,
    @Default([]) List<ProductAttributeEntity> productAttributes,
    @Default([]) List<String> coverImages,
    String? gender,
    @Default([]) List<String> tags,
    @Default('draft') String status,
    @Default(false) bool isFeatured,
    @Default(0) int totalStock,
    @Default(0) int colorCount,
    @Default(0.0) double rating,
    @Default(0) int totalReviews,
  }) = _ProductEntity;

  factory ProductEntity.fromJson(Map<String, dynamic> json) =>
      _$ProductEntityFromJson(json);
}

@freezed
class ProductVariantEntity with _$ProductVariantEntity {
  const factory ProductVariantEntity({
    required String id,
    required String parentId,
    required String storeId,
    required String retailerId,
    String? color,
    String? colorHex,
    String? size,
    String? length,
    @Default([]) List<ProductAttributeEntity> customVariationAttributes,
    required String sku,
    String? barcode,
    @Default('') String variantLabel,
    required double price,
    double? compareAtPrice,
    required int stockQuantity,
    @Default(0) int reservedQuantity,
    @Default([]) List<String> images,
    @Default(true) bool isActive,
    double? weightGrams,
    double? lengthCm,
    double? widthCm,
    double? heightCm,
  }) = _ProductVariantEntity;

  factory ProductVariantEntity.fromJson(Map<String, dynamic> json) =>
      _$ProductVariantEntityFromJson(json);
}

@freezed
class ProductAttributeEntity with _$ProductAttributeEntity {
  const factory ProductAttributeEntity({
    required String name,
    required String value,
  }) = _ProductAttributeEntity;

  factory ProductAttributeEntity.fromJson(Map<String, dynamic> json) =>
      _$ProductAttributeEntityFromJson(json);
}
