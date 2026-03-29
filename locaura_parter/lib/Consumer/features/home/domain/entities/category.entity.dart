import 'package:freezed_annotation/freezed_annotation.dart';

part 'category.entity.freezed.dart';
part 'category.entity.g.dart';

@freezed
class CategoryEntity with _$CategoryEntity {
  const factory CategoryEntity({
    @JsonKey(name: '_id') required String id,
    required String name,
    String? slug, 
    @JsonKey(name: 'image') String? imageUrl,
    @JsonKey(name: 'parent_id') String? parentId,
  }) = _CategoryEntity;

  factory CategoryEntity.fromJson(Map<String, dynamic> json) => _$CategoryEntityFromJson(json);
}
