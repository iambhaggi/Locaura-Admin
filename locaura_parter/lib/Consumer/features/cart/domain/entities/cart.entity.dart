import 'package:freezed_annotation/freezed_annotation.dart';

part 'cart.entity.freezed.dart';
part 'cart.entity.g.dart';

@freezed
class CartItemEntity with _$CartItemEntity {
  const factory CartItemEntity({
    required String variant_id,
    required String product_id,
    required String product_name,
    required String brand_name,
    required String size,
    required String color,
    required double price,
    double? original_price,
    String? thumb_url,
    required int quantity,
    required String store_id,
  }) = _CartItemEntity;

  factory CartItemEntity.fromJson(Map<String, dynamic> json) => _$CartItemEntityFromJson(json);
}

@freezed
class CartEntity with _$CartEntity {
  const factory CartEntity({
    @JsonKey(name: '_id') String? id,
    required String consumer_id,
    @Default([]) List<CartItemEntity> items,
    @Default(0.0) double subtotal,
    @Default(0.0) double total,
    @Default(0.0) double delivery_fee,
    @Default(0.0) double platform_fee,
  }) = _CartEntity;

  factory CartEntity.fromJson(Map<String, dynamic> json) => _$CartEntityFromJson(json);
}
