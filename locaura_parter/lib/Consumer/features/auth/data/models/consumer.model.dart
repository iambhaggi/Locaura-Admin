// ignore_for_file: invalid_annotation_target

import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:locaura_parter/Consumer/features/auth/domain/entities/consumer.entity.dart';

part 'consumer.model.freezed.dart';
part 'consumer.model.g.dart';

@freezed
class ConsumerModel with _$ConsumerModel {
  const factory ConsumerModel({
    @JsonKey(name: '_id') required String id,
    required String phone,
    @JsonKey(name: 'phone_verified') required bool phoneVerified,
    @JsonKey(name: 'consumer_name') String? name,
    String? email,
    @JsonKey(name: 'avatar_url') String? avatarUrl,
    @Default([]) List<AddressModel> addresses,
    CartModel? cart,
  }) = _ConsumerModel;

  factory ConsumerModel.fromJson(Map<String, dynamic> json) =>
      _$ConsumerModelFromJson(json);
}

extension ConsumerModelX on ConsumerModel {
  ConsumerEntity toEntity({required String token}) => ConsumerEntity(
        id: id,
        phone: phone,
        phoneVerified: phoneVerified,
        name: name,
        email: email,
        avatarUrl: avatarUrl,
        token: token,
        addresses: addresses.map((a) => a.toEntity()).toList(),
        cart: cart?.toEntity(),
      );
}



@freezed
class ConsumerProfileResponse with _$ConsumerProfileResponse {
  const factory ConsumerProfileResponse({
    String? token,
    required ConsumerModel consumer,
  }) = _ConsumerProfileResponse;

  factory ConsumerProfileResponse.fromJson(Map<String, dynamic> json) =>
      _$ConsumerProfileResponseFromJson(json);
}

extension ConsumerProfileResponseX on ConsumerProfileResponse {
  ConsumerEntity toEntity() => consumer.toEntity(token: token!);
}

@freezed
class AddressModel with _$AddressModel {
  const factory AddressModel({
    @JsonKey(name: '_id') String? id,
    required String label,
    required String line1,
    String? line2,
    required String city,
    required String state,
    required String pincode,
    @JsonKey(name: 'is_default') required bool isDefault,
    LocationModel? location,
  }) = _AddressModel;

  factory AddressModel.fromJson(Map<String, dynamic> json) =>
      _$AddressModelFromJson(json);
}

extension AddressModelX on AddressModel {
  AddressEntity toEntity() => AddressEntity(
        id: id,
        label: label,
        line1: line1,
        line2: line2,
        city: city,
        state: state,
        pincode: pincode,
        isDefault: isDefault,
        location: location?.toEntity(),
      );
}
  
extension LocationModelX on LocationModel {
  LocationEntity toEntity() => LocationEntity(
        type: type,
        coordinates: coordinates,
      );
}


@freezed
class LocationModel with _$LocationModel {
  const factory LocationModel({
    @Default('Point') String type,
    required List<double> coordinates,
  }) = _LocationModel;

  factory LocationModel.fromJson(Map<String, dynamic> json) =>
      _$LocationModelFromJson(json);
}

@freezed
class CartModel with _$CartModel {
  const factory CartModel({
    @JsonKey(name: 'store_id') String? storeId,
    @JsonKey(name: 'store_name') String? storeName,
    @Default([]) List<CartItemModel> items,
    @Default(0.0) double subtotal,
    @Default(0.0) double total,
    @Default(0.0) double delivery_fee,
    @Default(0.0) double platform_fee,
  }) = _CartModel;

  factory CartModel.fromJson(Map<String, dynamic> json) =>
      _$CartModelFromJson(json);
}

extension CartModelX on CartModel {
  ConsumerCartEntity toEntity() => ConsumerCartEntity(
        storeId: storeId,
        storeName: storeName,
        items: items.map((i) => i.toEntity()).toList(),
        subtotal: subtotal.toDouble(),
        total: total.toDouble(),
        delivery_fee: delivery_fee.toDouble(),
        platform_fee: platform_fee.toDouble(),
      );
}

@freezed
class CartItemModel with _$CartItemModel {
  const factory CartItemModel({
    @JsonKey(name: 'variant_id') required String variantId,
    required int quantity,
    @JsonKey(name: 'product_id') String? productId,
    @JsonKey(name: 'product_name') String? productName,
    @JsonKey(name: 'brand_name') String? brandName,
    String? size,
    String? color,
    double? price,
    @JsonKey(name: 'original_price') double? originalPrice,
    @JsonKey(name: 'thumb_url') String? thumbUrl,
    @JsonKey(name: 'variant_sku') String? variantSku,
    @JsonKey(name: 'variant_label') String? variantLabel,
    @JsonKey(name: 'total_price') double? totalPrice,
    @JsonKey(name: 'stock_available') int? stockAvailable,
  }) = _CartItemModel;

  factory CartItemModel.fromJson(Map<String, dynamic> json) =>
      _$CartItemModelFromJson(json);
}

extension CartItemModelX on CartItemModel {
  ConsumerCartItemEntity toEntity() => ConsumerCartItemEntity(
        variantId: variantId,
        quantity: quantity,
        productId: productId??'',
        productName: productName ?? 'Unknown Product',
        brandName: brandName ?? '',
        size: size ?? '',
        color: color ?? '',
        price: price?.toDouble() ?? 0.0,
        originalPrice: originalPrice?.toDouble(),
        thumbUrl: thumbUrl,
        variantSku: variantSku,
        variantLabel: variantLabel,
        totalPrice: totalPrice?.toDouble() ?? ((price?.toDouble() ?? 0.0) * quantity),
        stockAvailable: stockAvailable,
      );
}
