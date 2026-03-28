import 'package:locaura_parter/core/network/api_endpoints.dart';
import 'package:locaura_parter/core/network/api_service.dart';

import 'package:dio/dio.dart';
import 'package:locaura_parter/Retailer/features/auth/data/models/retailer.model.dart';

class AuthRemoteDataSource extends ApiService {
  AuthRemoteDataSource(Dio dio) : super(httpClient: dio);

  Future<void> sendOtp(String phone) async {
    final result = await postRequest<void>(
      path: ApiEndpoints.sendOtp,
      body: {'phone': phone},
      fromJson: (_) {},
    );

    result.fold((failure) => throw failure, (_) {});
  }

  Future<VerifyOtpResponseModel> verifyOtp(String phone, String otp) async {
    final result = await postRequest<Map<String, dynamic>>(
      path: ApiEndpoints.verifyOtp,
      body: {'phone': phone, 'otp': otp},
      fromJson: (data) => data as Map<String, dynamic>,
    );

    return result.fold(
      (failure) => throw failure,
      (data) => VerifyOtpResponseModel.fromJson(data),
    );
  }

  Future<RetailerModel> updateProfile({
    String? retailerName,
    String? email,
    String? panCard,
  }) async {
    final result = await postRequest<Map<String, dynamic>>(
      path: ApiEndpoints.updateProfile,
      body: {
        if (retailerName != null) 'retailer_name': retailerName,
        if (email != null) 'email': email,
        if (panCard != null) 'pan_card': panCard,
      },
      fromJson: (data) => data as Map<String, dynamic>,
    );

    return result.fold(
      (failure) => throw failure,
      (data) => RetailerModel.fromJson(data['data']['retailer'] as Map<String, dynamic>),
    );
  }
}
