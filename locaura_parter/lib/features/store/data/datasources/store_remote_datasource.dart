import 'package:dio/dio.dart';
import '../../../../core/network/api_service.dart';
import '../models/store.model.dart';

class StoreRemoteDataSource extends ApiService {
  StoreRemoteDataSource(Dio dio) : super(httpClient: dio);

  Future<StoreModel> registerStore(Map<String, dynamic> storeData) async {
    final result = await postRequest<StoreModel>(
      path: '/api/v1/stores/register',
      body: storeData,
      fromJson: (data) => StoreModel.fromJson(data['data']['store'] as Map<String, dynamic>),
    );
    return result.getOrElse((failure) => throw failure);
  }

  Future<List<StoreModel>> getMyStores() async {
    final result = await getRequest<List<StoreModel>>(
      path: '/api/v1/stores/me',
      fromJson: (data) {
        final list = data['data']['stores'] as List;
        return list.map((e) => StoreModel.fromJson(e as Map<String, dynamic>)).toList();
      },
    );
    return result.getOrElse((failure) => throw failure);
  }

  Future<StoreModel> getStore(String id) async {
    final result = await getRequest<StoreModel>(
      path: '/api/v1/stores/$id',
      fromJson: (data) => StoreModel.fromJson(data['data']['store'] as Map<String, dynamic>),
    );
    return result.getOrElse((failure) => throw failure);
  }

  Future<StoreModel> updateStore(String id, Map<String, dynamic> updateData) async {
    final result = await putRequest<StoreModel>(
      path: '/api/v1/stores/$id',
      body: updateData,
      fromJson: (data) => StoreModel.fromJson(data['data']['store'] as Map<String, dynamic>),
    );
    return result.getOrElse((failure) => throw failure);
  }

  Future<void> deleteStore(String id) async {
    final result = await deleteRequest(
      path: '/api/v1/stores/$id',
    );
    result.getOrElse((failure) => throw failure);
  }
}
