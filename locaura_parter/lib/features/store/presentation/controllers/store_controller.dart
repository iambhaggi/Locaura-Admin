import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:freezed_annotation/freezed_annotation.dart';
import '../../../../core/di/locator.dart';
import '../../domain/entities/store.entity.dart';
import '../../domain/usecases/store_usecases.dart';

part 'store_controller.freezed.dart';

@freezed
class StoreState with _$StoreState {
  const factory StoreState.initial() = _Initial;
  const factory StoreState.loading() = _Loading;
  const factory StoreState.success(List<StoreEntity> stores) = _Success;
  const factory StoreState.storeCreated(StoreEntity store) = _StoreCreated;
  const factory StoreState.storeUpdated(StoreEntity store) = _StoreUpdated;
  const factory StoreState.storeDeleted() = _StoreDeleted;
  const factory StoreState.storeLoaded(StoreEntity store) = _StoreLoaded;
  const factory StoreState.error(String message) = _Error;
}

class StoreController extends StateNotifier<StoreState> {
  final RegisterStore _registerStore;
  final GetMyStores _getMyStores;
  final UpdateStore _updateStore;
  final DeleteStore _deleteStore;
  final GetStoreDetails _getStoreDetails;

  StoreController({
    required RegisterStore registerStore,
    required GetMyStores getMyStores,
    required UpdateStore updateStore,
    required DeleteStore deleteStore,
    required GetStoreDetails getStoreDetails,
  })  : _registerStore = registerStore,
        _getMyStores = getMyStores,
        _updateStore = updateStore,
        _deleteStore = deleteStore,
        _getStoreDetails = getStoreDetails,
        super(const StoreState.initial());

  Future<void> fetchStoreDetails(String id) async {
    state = const StoreState.loading();
    final result = await _getStoreDetails(id);
    result.fold(
      (failure) => state = StoreState.error(failure.message),
      (store) => state = StoreState.storeLoaded(store),
    );
  }

  Future<void> fetchMyStores() async {
    state = const StoreState.loading();
    final result = await _getMyStores();
    result.fold(
      (failure) => state = StoreState.error(failure.message),
      (stores) => state = StoreState.success(stores),
    );
  }

  Future<void> registerNewStore(Map<String, dynamic> storeData) async {
    state = const StoreState.loading();
    final result = await _registerStore(storeData);
    result.fold(
      (failure) => state = StoreState.error(failure.message),
      (store) {
        state = StoreState.storeCreated(store);
        fetchMyStores(); // Refresh list
      },
    );
  }

  Future<void> updateExistingStore(String id, Map<String, dynamic> updateData) async {
    state = const StoreState.loading();
    final result = await _updateStore(id, updateData);
    result.fold(
      (failure) => state = StoreState.error(failure.message),
      (store) {
        state = StoreState.storeUpdated(store);
        fetchMyStores(); // Refresh list
      },
    );
  }

  Future<void> toggleOnlineStatus(String id) async {
    state.maybeWhen(
      success: (stores) async {
        final store = stores.firstWhere((s) => s.id == id);
        await updateExistingStore(id, {'is_active': !store.isActive});
      },
      orElse: () {},
    );
  }

  Future<void> deleteExistingStore(String id) async {
    state = const StoreState.loading();
    final result = await _deleteStore(id);
    result.fold(
      (failure) => state = StoreState.error(failure.message),
      (_) {
        state = const StoreState.storeDeleted();
        fetchMyStores(); // Refresh list
      },
    );
  }
}

final storeControllerProvider =
    StateNotifierProvider<StoreController, StoreState>((ref) {
  return StoreController(
    registerStore: getIt<RegisterStore>(),
    getMyStores: getIt<GetMyStores>(),
    updateStore: getIt<UpdateStore>(),
    deleteStore: getIt<DeleteStore>(),
    getStoreDetails: getIt<GetStoreDetails>(),
  );
});
