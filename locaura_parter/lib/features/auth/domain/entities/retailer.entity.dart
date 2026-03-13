class RetailerEntity {
  final String id;
  final String phone;
  final bool phoneVerified;
  final bool emailVerified;
  final String? email;
  final String? retailerName;
  final String token;
  final List<StoreSummaryEntity> stores;

  const RetailerEntity({
    required this.id,
    required this.phone,
    required this.phoneVerified,
    required this.emailVerified,
    this.email,
    this.retailerName,
    required this.token,
    required this.stores,
  });
}

class StoreSummaryEntity {
  final String id;
  final String name;
  final String status;

  const StoreSummaryEntity({
    required this.id,
    required this.name,
    required this.status,
  });
}