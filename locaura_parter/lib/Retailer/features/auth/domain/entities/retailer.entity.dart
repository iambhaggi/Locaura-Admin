import 'package:freezed_annotation/freezed_annotation.dart';

part 'retailer.entity.freezed.dart';
part 'retailer.entity.g.dart';

@freezed
class RetailerEntity with _$RetailerEntity {
  const factory RetailerEntity({
    required String id,
    required String phone,
    required bool phoneVerified,
    required bool emailVerified,
    String? email,
    String? retailerName,
    String? panCard,
    required String token,
    required List<StoreSummaryEntity> stores,
  }) = _RetailerEntity;

  factory RetailerEntity.fromJson(Map<String, dynamic> json) =>
      _$RetailerEntityFromJson(json);
}

@freezed
class StoreSummaryEntity with _$StoreSummaryEntity {
  const factory StoreSummaryEntity({
    required String id,
    required String name,
    required String status,
  }) = _StoreSummaryEntity;

  factory StoreSummaryEntity.fromJson(Map<String, dynamic> json) =>
      _$StoreSummaryEntityFromJson(json);
}