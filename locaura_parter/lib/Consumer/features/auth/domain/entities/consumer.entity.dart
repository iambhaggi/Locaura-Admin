// ignore_for_file: invalid_annotation_target

import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:locaura_parter/Consumer/features/auth/data/models/consumer.model.dart';

part 'consumer.entity.freezed.dart';
part 'consumer.entity.g.dart';

@freezed
class AddressEntity with _$AddressEntity {
  const factory AddressEntity({
    @JsonKey(name: '_id') String? id,
    required String label,
    required String line1,
    String? line2,
    required String city,
    required String state,
    required String pincode,
    @JsonKey(name: 'is_default') required bool isDefault,
    LocationEntity? location,
  }) = _AddressModel;

  factory AddressEntity.fromJson(Map<String, dynamic> json) =>
      _$AddressEntityFromJson(json);
}

@freezed
class LocationEntity with _$LocationEntity {
  const factory LocationEntity({
    @Default('Point') String type,
    @JsonKey(name: 'coordinates') required List<double> coordinates,
  }) = _LocationEntity;

  factory LocationEntity.fromJson(Map<String, dynamic> json) =>
      _$LocationEntityFromJson(json);
}

extension LocationEntityX on LocationEntity {
  LocationModel toModel() => LocationModel(
        type: type,
        coordinates: coordinates,
      );
}

@freezed
class ConsumerEntity with _$ConsumerEntity {
  const ConsumerEntity._();

  const factory ConsumerEntity({
    required String id,
    required String phone,
    required bool phoneVerified,
    String? name,
    String? email,
    String? avatarUrl,
    required String token,
    @Default([]) List<AddressEntity> addresses,
    ConsumerCartEntity? cart,
  }) = _ConsumerEntity;

  factory ConsumerEntity.fromJson(Map<String, dynamic> json) =>
      _$ConsumerEntityFromJson(json);

  AddressEntity? get selectedAddress {
    if (addresses.isEmpty) return null;
    try {
      return addresses.firstWhere((a) => a.isDefault);
    } catch (_) {
      return addresses.first;
    }
  }
}

@freezed
class ConsumerCartEntity with _$ConsumerCartEntity {
  const factory ConsumerCartEntity({
    String? storeId,
    @Default([]) List<ConsumerCartItemEntity> items,
  }) = _ConsumerCartEntity;

  factory ConsumerCartEntity.fromJson(Map<String, dynamic> json) =>
      _$ConsumerCartEntityFromJson(json);
}

@freezed
class ConsumerCartItemEntity with _$ConsumerCartItemEntity {
  const factory ConsumerCartItemEntity({
    required String variantId,
    required int quantity,
  }) = _ConsumerCartItemEntity;

  factory ConsumerCartItemEntity.fromJson(Map<String, dynamic> json) =>
      _$ConsumerCartItemEntityFromJson(json);
}
