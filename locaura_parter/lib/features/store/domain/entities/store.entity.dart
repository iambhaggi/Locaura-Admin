import 'package:freezed_annotation/freezed_annotation.dart';

part 'store.entity.freezed.dart';
part 'store.entity.g.dart';

@freezed
class StoreEntity with _$StoreEntity {
  const factory StoreEntity({
    required String id,
    required String retailerId,
    required String storeName,
    String? slug,
    String? description,
    String? businessType,
    String? logoUrl,
    String? bannerUrl,
    required String storePhone,
    required String storeEmail,
    SocialLinksEntity? socialLinks,
    AddressEntity? address,
    LocationEntity? location,
    String? panCard,
    String? gstin,
    String? fssaiLicense,
    BankDetailsEntity? bankDetails,
    @Default([]) List<String> storeImages,
    @Default([]) List<String> categories,
    @Default([]) List<BusinessHourEntity> businessHours,
    @Default(10) double deliveryRadiusKm,
    @Default(0) double minOrderAmount,
    @Default(0) double deliveryFee,
    @Default(false) bool isDeliveryAvailable,
    @Default(true) bool isActive,
    required String status,
    bool? isOpenNow,
    @Default(0) double rating,
    @Default(0) int totalReviews,
  }) = _StoreEntity;

  factory StoreEntity.fromJson(Map<String, dynamic> json) =>
      _$StoreEntityFromJson(json);
}

@freezed
class AddressEntity with _$AddressEntity {
  const factory AddressEntity({
    String? shopNumber,
    String? buildingName,
    required String street,
    required String city,
    required String state,
    required String zipCode,
    String? landmark,
  }) = _AddressEntity;

  factory AddressEntity.fromJson(Map<String, dynamic> json) =>
      _$AddressEntityFromJson(json);
}

@freezed
class LocationEntity with _$LocationEntity {
  const factory LocationEntity({
    @Default('Point') String type,
    List<double>? coordinates,
  }) = _LocationEntity;

  factory LocationEntity.fromJson(Map<String, dynamic> json) =>
      _$LocationEntityFromJson(json);
}

@freezed
class BankDetailsEntity with _$BankDetailsEntity {
  const factory BankDetailsEntity({
    required String accountNumber,
    required String ifscCode,
    required String accountHolderName,
  }) = _BankDetailsEntity;

  factory BankDetailsEntity.fromJson(Map<String, dynamic> json) =>
      _$BankDetailsEntityFromJson(json);
}

@freezed
class BusinessHourEntity with _$BusinessHourEntity {
  const factory BusinessHourEntity({
    required String day,
    String? open,
    String? close,
    @Default(false) bool isClosed,
  }) = _BusinessHourEntity;

  factory BusinessHourEntity.fromJson(Map<String, dynamic> json) =>
      _$BusinessHourEntityFromJson(json);
}

@freezed
class SocialLinksEntity with _$SocialLinksEntity {
  const factory SocialLinksEntity({
    String? instagram,
    String? whatsapp,
  }) = _SocialLinksEntity;

  factory SocialLinksEntity.fromJson(Map<String, dynamic> json) =>
      _$SocialLinksEntityFromJson(json);
}
