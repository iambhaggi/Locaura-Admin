import 'package:locaura_parter/core/network/api_service.dart';

import 'package:dio/dio.dart';
import 'package:locaura_parter/features/auth/data/models/retailer.model.dart';

class AuthRemoteDataSource extends ApiService {
  AuthRemoteDataSource(Dio dio) : super(httpClient: dio);

  Future<void> sendOtp(String phone) async {
    final result = await postRequest<void>(
      path: '/api/v1/auth/send-otp',
      body: {'phone': phone},
      fromJson: (_) {},
    );

    result.fold((failure) => throw Exception(failure.message), (_) {});
  }

  Future<VerifyOtpResponseModel>verifyOtp(String phone, String otp) async {
    final result = await postRequest<Map<String, dynamic>>(
      path: '/api/v1/auth/verify-otp',
      body: {'phone': phone, 'otp': otp},
      fromJson: (data) => data as Map<String, dynamic>,
    );

    return result.fold(
      (failure) => throw Exception(failure.message),
      (data) => VerifyOtpResponseModel.fromJson(data),
    );
  }
}
