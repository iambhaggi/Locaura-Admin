import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:json_annotation/json_annotation.dart';
import '../../domain/entities/product.entity.dart';

part 'product.model.freezed.dart';
part 'product.model.g.dart';

@freezed
class ProductModel with _$ProductModel {
  const factory ProductModel({
    @JsonKey(name: '_id') required String id,
    @JsonKey(name: 'store_id') required String storeId,
    @JsonKey(name: 'retailer_id') required String retailerId,
    required String name,
    String? slug,
    String? brand,
    String? description,
    @JsonKey(name: 'base_price') required double basePrice,
    @JsonKey(name: 'base_compare_at_price') double? baseCompareAtPrice,
    @Default([]) List<String> categories,
    @JsonKey(name: 'product_attributes') @Default([]) List<ProductAttributeModel> productAttributes,
    @JsonKey(name: 'cover_images') @Default([]) List<String> coverImages,
    String? gender,
    @Default([]) List<String> tags,
    @Default('draft') String status,
    @JsonKey(name: 'is_featured') @Default(false) bool isFeatured,
    @JsonKey(name: 'total_stock') @Default(0) int totalStock,
    @JsonKey(name: 'color_count') @Default(0) int colorCount,
    @Default(0.0) double rating,
    @JsonKey(name: 'total_reviews') @Default(0) int totalReviews,
  }) = _ProductModel;

  factory ProductModel.fromJson(Map<String, dynamic> json) =>
      _$ProductModelFromJson(json);
}

extension ProductModelX on ProductModel {
  ProductEntity toEntity() => ProductEntity(
        id: id,
        storeId: storeId,
        retailerId: retailerId,
        name: name,
        slug: slug,
        brand: brand,
        description: description,
        basePrice: basePrice,
        baseCompareAtPrice: baseCompareAtPrice,
        categories: categories,
        productAttributes: productAttributes.map((e) => e.toEntity()).toList(),
        coverImages: coverImages,
        gender: gender,
        tags: tags,
        status: status,
        isFeatured: isFeatured,
        totalStock: totalStock,
        colorCount: colorCount,
        rating: rating,
        totalReviews: totalReviews,
      );
}

@freezed
class ProductVariantModel with _$ProductVariantModel {
  const factory ProductVariantModel({
    @JsonKey(name: '_id') required String id,
    @JsonKey(name: 'parent_id') required String parentId,
    @JsonKey(name: 'store_id') required String storeId,
    @JsonKey(name: 'retailer_id') required String retailerId,
    String? color,
    @JsonKey(name: 'color_hex') String? colorHex,
    String? size,
    String? length,
    @JsonKey(name: 'custom_variation_attributes') @Default([]) List<ProductAttributeModel> customVariationAttributes,
    required String sku,
    String? barcode,
    @JsonKey(name: 'variant_label') @Default('') String variantLabel,
    required double price,
    @JsonKey(name: 'compare_at_price') double? compareAtPrice,
    @JsonKey(name: 'stock_quantity') required int stockQuantity,
    @JsonKey(name: 'reserved_quantity') @Default(0) int reservedQuantity,
    @Default([]) List<String> images,
    @JsonKey(name: 'is_active') @Default(true) bool isActive,
    @JsonKey(name: 'weight_grams') double? weightGrams,
    @JsonKey(name: 'length_cm') double? lengthCm,
    @JsonKey(name: 'width_cm') double? widthCm,
    @JsonKey(name: 'height_cm') double? heightCm,
  }) = _ProductVariantModel;

  factory ProductVariantModel.fromJson(Map<String, dynamic> json) =>
      _$ProductVariantModelFromJson(json);
}

extension ProductVariantModelX on ProductVariantModel {
  ProductVariantEntity toEntity() => ProductVariantEntity(
        id: id,
        parentId: parentId,
        storeId: storeId,
        retailerId: retailerId,
        color: color,
        colorHex: colorHex,
        size: size,
        length: length,
        customVariationAttributes: customVariationAttributes.map((e) => e.toEntity()).toList(),
        sku: sku,
        barcode: barcode,
        variantLabel: variantLabel,
        price: price,
        compareAtPrice: compareAtPrice,
        stockQuantity: stockQuantity,
        reservedQuantity: reservedQuantity,
        images: images,
        isActive: isActive,
        weightGrams: weightGrams,
        lengthCm: lengthCm,
        widthCm: widthCm,
        heightCm: heightCm,
      );
}

@freezed
class ProductAttributeModel with _$ProductAttributeModel {
  const factory ProductAttributeModel({
    required String name,
    required String value,
  }) = _ProductAttributeModel;

  factory ProductAttributeModel.fromJson(Map<String, dynamic> json) =>
      _$ProductAttributeModelFromJson(json);
}

extension ProductAttributeModelX on ProductAttributeModel {
  ProductAttributeEntity toEntity() => ProductAttributeEntity(
        name: name,
        value: value,
      );
}
