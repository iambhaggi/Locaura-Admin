import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:locaura_parter/features/auth/domain/entities/retailer.entity.dart';

part 'retailer.model.freezed.dart';
part 'retailer.model.g.dart';

// ─── Top level response ────────────────────────────────────────────────────
extension VerifyOtpResponseModelX on VerifyOtpResponseModel {
  RetailerEntity toEntity() => RetailerEntity(
        id: retailer.id,
        phone: retailer.phone,
        phoneVerified: retailer.phoneVerified,
        emailVerified: retailer.emailVerified,
        email: retailer.email,
        retailerName: retailer.retailerName,
        panCard: retailer.panCard,
        token: token,
        stores: stores
            .map((s) => StoreSummaryEntity(
                  id: s.id ?? '',
                  name: s.name ?? '',
                  status: s.status ?? 'unknown',
                ))
            .toList(),
      );
}
@freezed
class VerifyOtpResponseModel with _$VerifyOtpResponseModel {
  const factory VerifyOtpResponseModel({
    required String token,
    required RetailerModel retailer,
    required List<StoreSummaryModel> stores,
  }) = _VerifyOtpResponseModel;

  factory VerifyOtpResponseModel.fromJson(Map<String, dynamic> json) =>
      _$VerifyOtpResponseModelFromJson(json['data'] as Map<String, dynamic>);
}

// ─── Retailer ──────────────────────────────────────────────────────────────

@freezed
class RetailerModel with _$RetailerModel {
  const factory RetailerModel({
    @JsonKey(name: '_id') required String id,
    required String phone,
    @JsonKey(name: 'phone_verified') required bool phoneVerified,
    @JsonKey(name: 'email_verified') required bool emailVerified,
    String? email,
    @JsonKey(name: 'retailer_name') String? retailerName,
    @JsonKey(name: 'pan_card') String? panCard,
    @JsonKey(name: 'otp_expiry') String? otpExpiry,
    @JsonKey(name: 'createdAt') required String createdAt,
    @JsonKey(name: 'updatedAt') required String updatedAt,
  }) = _RetailerModel;

  factory RetailerModel.fromJson(Map<String, dynamic> json) =>
      _$RetailerModelFromJson(json);
}

extension RetailerModelX on RetailerModel {
  RetailerEntity toEntity({
    required String token,
    required List<StoreSummaryEntity> stores,
  }) {
    return RetailerEntity(
      id: id,
      phone: phone,
      phoneVerified: phoneVerified,
      emailVerified: emailVerified,
      email: email,
      retailerName: retailerName,
      panCard: panCard,
      token: token,
      stores: stores,
    );
  }
}

// ─── Store summary (only what verify-otp returns) ──────────────────────────

@freezed
class StoreSummaryModel with _$StoreSummaryModel {
  const factory StoreSummaryModel({
    @JsonKey(name: '_id', defaultValue: '') String? id,
    String? name,
    String? status,
  }) = _StoreSummaryModel;

  factory StoreSummaryModel.fromJson(Map<String, dynamic> json) =>
      _$StoreSummaryModelFromJson(json);
}