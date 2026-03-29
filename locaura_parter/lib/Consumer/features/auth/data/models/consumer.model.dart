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
    @Default([]) List<CartItemModel> items,
  }) = _CartModel;

  factory CartModel.fromJson(Map<String, dynamic> json) =>
      _$CartModelFromJson(json);
}

extension CartModelX on CartModel {
  ConsumerCartEntity toEntity() => ConsumerCartEntity(
        storeId: storeId,
        items: items.map((i) => i.toEntity()).toList(),
      );
}

@freezed
class CartItemModel with _$CartItemModel {
  const factory CartItemModel({
    @JsonKey(name: 'variant_id') required String variantId,
    required int quantity,
  }) = _CartItemModel;

  factory CartItemModel.fromJson(Map<String, dynamic> json) =>
      _$CartItemModelFromJson(json);
}

extension CartItemModelX on CartItemModel {
  ConsumerCartItemEntity toEntity() => ConsumerCartItemEntity(
        variantId: variantId,
        quantity: quantity,
      );
}
