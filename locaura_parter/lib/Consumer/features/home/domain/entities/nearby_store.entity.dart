import 'package:freezed_annotation/freezed_annotation.dart';

part 'nearby_store.entity.freezed.dart';
part 'nearby_store.entity.g.dart';

@freezed
class NearbyStoreEntity with _$NearbyStoreEntity {
  const factory NearbyStoreEntity({
    @JsonKey(name: '_id') required String id,
    required String name,
    String? description,
    String? banner_url,
    List<String>? gallery_urls,
    @Default(0.0) double rating,
    @Default(0) int rating_count,
    @Default([]) List<String> categories,
    double? distanceKm,
    int? estimated_delivery_time_min,
  }) = _NearbyStoreEntity;

  factory NearbyStoreEntity.fromJson(Map<String, dynamic> json) => _$NearbyStoreEntityFromJson(json);
}
