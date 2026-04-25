// ignore_for_file: invalid_annotation_target

import 'package:freezed_annotation/freezed_annotation.dart';
import '../../domain/entities/store.entity.dart';

part 'store.model.freezed.dart';
part 'store.model.g.dart';

@freezed
class StoreModel with _$StoreModel {
  const factory StoreModel({
    @JsonKey(name: '_id') required String id,
    @JsonKey(name: 'retailer_id') required String retailerId,
    @JsonKey(name: 'store_name') required String storeName,
    String? slug,
    String? description,
    @JsonKey(name: 'business_type') String? businessType,
    @JsonKey(name: 'logo_url') String? logoUrl,
    @JsonKey(name: 'banner_url') String? bannerUrl,
    @JsonKey(name: 'store_phone') required String storePhone,
    @JsonKey(name: 'store_email') required String storeEmail,
    @JsonKey(name: 'social_links') SocialLinksModel? socialLinks,
    AddressModel? address,
    LocationModel? location,
    @JsonKey(name: 'pan_card') String? panCard,
    String? gstin,
    @JsonKey(name: 'fssai_license') String? fssaiLicense,
    @JsonKey(name: 'bank_details') BankDetailsModel? bankDetails,
    @JsonKey(name: 'store_images') @Default([]) List<String> storeImages,
    @Default([]) List<String> categories,
    @JsonKey(name: 'business_hours') @Default([]) List<BusinessHourModel> businessHours,
    @JsonKey(name: 'delivery_radius_km') @Default(10) double deliveryRadiusKm,
    @JsonKey(name: 'min_order_amount') @Default(0) double minOrderAmount,
    @JsonKey(name: 'delivery_fee') @Default(0) double deliveryFee,
    @JsonKey(name: 'is_delivery_available') @Default(false) bool isDeliveryAvailable,
    @JsonKey(name: 'is_active') @Default(true) bool isActive,
    required String status,
    @JsonKey(name: 'is_open_now') bool? isOpenNow,
    @Default(0) double rating,
    @JsonKey(name: 'total_reviews') @Default(0) int totalReviews,
  }) = _StoreModel;

  factory StoreModel.fromJson(Map<String, dynamic> json) =>
      _$StoreModelFromJson(json);
}

extension StoreModelX on StoreModel {
  StoreEntity toEntity() => StoreEntity(
        id: id,
        retailerId: retailerId,
        storeName: storeName,
        slug: slug,
        description: description,
        businessType: businessType,
        logoUrl: logoUrl,
        bannerUrl: bannerUrl,
        storePhone: storePhone,
        storeEmail: storeEmail,
        socialLinks: socialLinks?.toEntity(),
        address: address?.toEntity(),
        location: location?.toEntity(),
        panCard: panCard,
        gstin: gstin,
        fssaiLicense: fssaiLicense,
        bankDetails: bankDetails?.toEntity(),
        storeImages: storeImages,
        categories: categories,
        businessHours: businessHours.map((e) => e.toEntity()).toList(),
        deliveryRadiusKm: deliveryRadiusKm,
        minOrderAmount: minOrderAmount,
        deliveryFee: deliveryFee,
        isDeliveryAvailable: isDeliveryAvailable,
        isActive: isActive,
        status: status,
        isOpenNow: isOpenNow,
        rating: rating,
        totalReviews: totalReviews,
      );
}

@freezed
class AddressModel with _$AddressModel {
  const factory AddressModel({
    @JsonKey(name: 'shop_number') String? shopNumber,
    @JsonKey(name: 'building_name') String? buildingName,
    required String street,
    required String city,
    required String state,
    @JsonKey(name: 'zip_code') required String zipCode,
    String? landmark,
  }) = _AddressModel;

  factory AddressModel.fromJson(Map<String, dynamic> json) =>
      _$AddressModelFromJson(json);
}

extension AddressModelX on AddressModel {
  AddressEntity toEntity() => AddressEntity(
        shopNumber: shopNumber,
        buildingName: buildingName,
        street: street,
        city: city,
        state: state,
        zipCode: zipCode,
        landmark: landmark,
      );
}

@freezed
class LocationModel with _$LocationModel {
  const factory LocationModel({
    @Default('Point') String type,
    List<double>? coordinates,
  }) = _LocationModel;

  factory LocationModel.fromJson(Map<String, dynamic> json) =>
      _$LocationModelFromJson(json);
}

extension LocationModelX on LocationModel {
  LocationEntity toEntity() => LocationEntity(
        type: type,
        coordinates: coordinates,
      );
}

@freezed
class BankDetailsModel with _$BankDetailsModel {
  const factory BankDetailsModel({
    @JsonKey(name: 'account_number') required String accountNumber,
    @JsonKey(name: 'ifsc_code') required String ifscCode,
    @JsonKey(name: 'account_holder_name') required String accountHolderName,
  }) = _BankDetailsModel;

  factory BankDetailsModel.fromJson(Map<String, dynamic> json) =>
      _$BankDetailsModelFromJson(json);
}

extension BankDetailsModelX on BankDetailsModel {
  BankDetailsEntity toEntity() => BankDetailsEntity(
        accountNumber: accountNumber,
        ifscCode: ifscCode,
        accountHolderName: accountHolderName,
      );
}

@freezed
class BusinessHourModel with _$BusinessHourModel {
  const factory BusinessHourModel({
    required String day,
    String? open,
    String? close,
    @JsonKey(name: 'is_closed') @Default(false) bool isClosed,
  }) = _BusinessHourModel;

  factory BusinessHourModel.fromJson(Map<String, dynamic> json) =>
      _$BusinessHourModelFromJson(json);
}

extension BusinessHourModelX on BusinessHourModel {
  BusinessHourEntity toEntity() => BusinessHourEntity(
        day: day,
        open: open,
        close: close,
        isClosed: isClosed,
      );
}

@freezed
class SocialLinksModel with _$SocialLinksModel {
  const factory SocialLinksModel({
    String? instagram,
    String? whatsapp,
  }) = _SocialLinksModel;

  factory SocialLinksModel.fromJson(Map<String, dynamic> json) =>
      _$SocialLinksModelFromJson(json);
}

extension SocialLinksModelX on SocialLinksModel {
  SocialLinksEntity toEntity() => SocialLinksEntity(
        instagram: instagram,
        whatsapp: whatsapp,
      );
}
