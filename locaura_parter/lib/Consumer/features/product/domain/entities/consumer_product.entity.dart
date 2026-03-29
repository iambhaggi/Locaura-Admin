import 'package:freezed_annotation/freezed_annotation.dart';

part 'consumer_product.entity.freezed.dart';
part 'consumer_product.entity.g.dart';

@freezed
class ConsumerProductVariant with _$ConsumerProductVariant {
  const factory ConsumerProductVariant({
    @JsonKey(name: '_id') required String id,
    String? sku,
    String? size,
    String? color,
    @JsonKey(name: 'price') required double price,
    @JsonKey(name: 'compare_at_price') double? compare_at_price,
    @JsonKey(name: 'stock_quantity') @Default(0) int stock,
    @JsonKey(name: 'is_active') @Default(true) bool is_active,
  }) = _ConsumerProductVariant;

  factory ConsumerProductVariant.fromJson(Map<String, dynamic> json) => _$ConsumerProductVariantFromJson(json);
}

@freezed
class ConsumerProductEntity with _$ConsumerProductEntity {
  const factory ConsumerProductEntity({
    @JsonKey(name: '_id') required String id,
    @JsonKey(name: 'store_id') required dynamic store, // Can be String or Map (NearbyStoreEntity)
    required String name,
    String? brand,
    String? description,
    @JsonKey(name: 'category_id') String? category_id,
    @Default([]) List<ConsumerProductVariant> variants,
    @Default([]) List<String> cover_images,
    @Default(0.0) double base_price,
    double? base_compare_at_price,
    @Default(0.0) double rating,
    @Default(0) int total_reviews,
    @Default(true) bool is_active,
  }) = _ConsumerProductEntity;

  factory ConsumerProductEntity.fromJson(Map<String, dynamic> json) => _$ConsumerProductEntityFromJson(json);
}
