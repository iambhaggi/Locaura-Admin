import 'package:dio/dio.dart';
import '../../../../core/network/api_endpoints.dart';
import '../../../../core/network/api_service.dart';
import '../models/product.model.dart';

class ProductRemoteDataSource extends ApiService {
  ProductRemoteDataSource(Dio dio) : super(httpClient: dio);

  Future<ProductModel> createProduct({
    required String storeId,
    required Map<String, dynamic> productData,
  }) async {
    final result = await postRequest<ProductModel>(
      path: ApiEndpoints.products(storeId),
      body: productData,
      fromJson: (data) => ProductModel.fromJson(data['data'] as Map<String, dynamic>),
    );
    return result.getOrElse((failure) => throw failure);
  }

  Future<List<ProductModel>> getStoreProducts({
    required String storeId,
    Map<String, dynamic>? filters,
    int page = 1,
    int limit = 20,
  }) async {
    final result = await getRequest<List<ProductModel>>(
      path: ApiEndpoints.products(storeId),
      queryParameters: {
        if (filters != null) ...filters,
        'page': page,
        'limit': limit,
      },
      fromJson: (data) {
        final List list = data['data']['products'];
        return list.map((json) => ProductModel.fromJson(json as Map<String, dynamic>)).toList();
      },
    );
    return result.getOrElse((failure) => throw failure);
  }

  Future<ProductModel> getProductDetails({
    required String storeId,
    required String productId,
  }) async {
    final result = await getRequest<ProductModel>(
      path: ApiEndpoints.productDetails(storeId, productId),
      fromJson: (data) => ProductModel.fromJson(data['data'] as Map<String, dynamic>),
    );
    return result.getOrElse((failure) => throw failure);
  }

  Future<ProductModel> updateProduct({
    required String storeId,
    required String productId,
    required Map<String, dynamic> updateData,
  }) async {
    final result = await putRequest<ProductModel>(
      path: ApiEndpoints.productDetails(storeId, productId),
      body: updateData,
      fromJson: (data) => ProductModel.fromJson(data['data'] as Map<String, dynamic>),
    );
    return result.getOrElse((failure) => throw failure);
  }

  Future<bool> deleteProduct({
    required String storeId,
    required String productId,
  }) async {
    final result = await deleteRequest(
      path: ApiEndpoints.productDetails(storeId, productId),
    );
    return result.getOrElse((failure) => throw failure);
  }

  Future<ProductVariantModel> createVariant({
    required String storeId,
    required String productId,
    required Map<String, dynamic> variantData,
  }) async {
    final result = await postRequest<ProductVariantModel>(
      path: ApiEndpoints.variants(storeId, productId),
      body: variantData,
      fromJson: (data) => ProductVariantModel.fromJson(data['data'] as Map<String, dynamic>),
    );
    return result.getOrElse((failure) => throw failure);
  }

  Future<List<ProductVariantModel>> getProductVariants({
    required String storeId,
    required String productId,
  }) async {
    final result = await getRequest<List<ProductVariantModel>>(
      path: ApiEndpoints.variants(storeId, productId),
      fromJson: (data) {
        final List list = data['data'];
        return list.map((json) => ProductVariantModel.fromJson(json as Map<String, dynamic>)).toList();
      },
    );
    return result.getOrElse((failure) => throw failure);
  }

  Future<ProductVariantModel> getVariantDetails({
    required String storeId,
    required String productId,
    required String variantId,
  }) async {
    final result = await getRequest<ProductVariantModel>(
      path: ApiEndpoints.variantDetails(storeId, productId, variantId),
      fromJson: (data) => ProductVariantModel.fromJson(data['data'] as Map<String, dynamic>),
    );
    return result.getOrElse((failure) => throw failure);
  }

  Future<ProductVariantModel> updateVariant({
    required String storeId,
    required String productId,
    required String variantId,
    required Map<String, dynamic> updateData,
  }) async {
    final result = await putRequest<ProductVariantModel>(
      path: ApiEndpoints.variantDetails(storeId, productId, variantId),
      body: updateData,
      fromJson: (data) => ProductVariantModel.fromJson(data['data'] as Map<String, dynamic>),
    );
    return result.getOrElse((failure) => throw failure);
  }

  Future<bool> deleteVariant({
    required String storeId,
    required String productId,
    required String variantId,
  }) async {
    final result = await deleteRequest(
      path: ApiEndpoints.variantDetails(storeId, productId, variantId),
    );
    return result.getOrElse((failure) => throw failure);
  }
}
