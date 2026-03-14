import '../../../../core/network/api_result.dart';
import '../entities/store.entity.dart';

abstract class StoreRepository {
  ApiResult<StoreEntity> registerStore(Map<String, dynamic> storeData);
  ApiResult<List<StoreEntity>> getMyStores();
  ApiResult<StoreEntity> getStore(String id);
  ApiResult<StoreEntity> updateStore(String id, Map<String, dynamic> updateData);
  ApiResult<void> deleteStore(String id);
}
