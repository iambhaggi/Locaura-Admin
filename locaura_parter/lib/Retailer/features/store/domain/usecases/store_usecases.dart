import '../../../../../core/network/api_result.dart';
import '../entities/store.entity.dart';
import '../repositories/store_repository.dart';

class RegisterStore {
  final StoreRepository _repository;
  RegisterStore(this._repository);

  ApiResult<StoreEntity> call(Map<String, dynamic> storeData) {
    return _repository.registerStore(storeData);
  }
}

class GetMyStores {
  final StoreRepository _repository;
  GetMyStores(this._repository);

  ApiResult<List<StoreEntity>> call() {
    return _repository.getMyStores();
  }
}

class GetStoreDetails {
  final StoreRepository _repository;
  GetStoreDetails(this._repository);

  ApiResult<StoreEntity> call(String id) {
    return _repository.getStore(id);
  }
}

class UpdateStore {
  final StoreRepository _repository;
  UpdateStore(this._repository);

  ApiResult<StoreEntity> call(String id, Map<String, dynamic> updateData) {
    return _repository.updateStore(id, updateData);
  }
}

class DeleteStore {
  final StoreRepository _repository;
  DeleteStore(this._repository);

  ApiResult<void> call(String id) {
    return _repository.deleteStore(id);
  }
}
