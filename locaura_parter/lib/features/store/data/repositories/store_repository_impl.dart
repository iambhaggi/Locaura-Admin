import 'package:fpdart/fpdart.dart';
import '../../../../core/network/api_result.dart';
import '../../domain/entities/store.entity.dart';
import '../../domain/repositories/store_repository.dart';
import '../datasources/store_remote_datasource.dart';
import '../models/store.model.dart';

class StoreRepositoryImpl implements StoreRepository {
  final StoreRemoteDataSource _remote;

  StoreRepositoryImpl(this._remote);

  @override
  ApiResult<StoreEntity> registerStore(Map<String, dynamic> storeData) async {
    try {
      final model = await _remote.registerStore(storeData);
      return Right(model.toEntity());
    } catch (e) {
      return const Left(NetworkFailure(message: 'Failed to register store'));
    }
  }

  @override
  ApiResult<List<StoreEntity>> getMyStores() async {
    try {
      final models = await _remote.getMyStores();
      return Right(models.map((e) => e.toEntity()).toList());
    } catch (e) {
      return const Left(NetworkFailure(message: 'Failed to fetch stores'));
    }
  }

  @override
  ApiResult<StoreEntity> getStore(String id) async {
    try {
      final model = await _remote.getStore(id);
      return Right(model.toEntity());
    } catch (e) {
      return const Left(NetworkFailure(message: 'Failed to fetch store details'));
    }
  }

  @override
  ApiResult<StoreEntity> updateStore(String id, Map<String, dynamic> updateData) async {
    try {
      final model = await _remote.updateStore(id, updateData);
      return Right(model.toEntity());
    } catch (e) {
      return const Left(NetworkFailure(message: 'Failed to update store'));
    }
  }

  @override
  ApiResult<void> deleteStore(String id) async {
    try {
      await _remote.deleteStore(id);
      return const Right(null);
    } catch (e) {
      return const Left(NetworkFailure(message: 'Failed to delete store'));
    }
  }
}
