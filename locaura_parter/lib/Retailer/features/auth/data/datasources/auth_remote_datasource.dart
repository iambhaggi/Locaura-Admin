import 'package:locaura_parter/core/network/api_endpoints.dart';
import 'package:locaura_parter/core/network/api_response.dart';
import 'package:locaura_parter/core/network/api_service.dart';

import 'package:dio/dio.dart';
import 'package:locaura_parter/Retailer/features/auth/data/models/retailer.model.dart';
import 'package:locaura_parter/Consumer/features/auth/data/models/consumer.model.dart';
import 'package:locaura_parter/core/utils/app_constants.dart';

class AuthRemoteDataSource extends ApiService {
  AuthRemoteDataSource(Dio dio) : super(httpClient: dio);

  Future<void> sendOtp(String phone, String actorType) async {
    final path = actorType==AppConstants.actorConsumer? ApiEndpoints.consumerSendOtp: ApiEndpoints.sendOtp;
    final result = await postRequest<void>(
      path: path,
      body: {'phone': phone},
      fromJson: (_) {},
    );

    result.fold((failure) => throw failure, (_) {});
  }

  Future<ApiResponse> verifyOtp(String phone, String otp,String actorType) async {
    final path = actorType==AppConstants.actorConsumer? ApiEndpoints.consumerVerifyOtp: ApiEndpoints.verifyOtp;
    final result = await postRequest<Map<String, dynamic>>(
      path: path,
      body: {'phone': phone, 'otp': otp},
      fromJson: (data) => data as Map<String, dynamic>,
    );

    return result.fold(
      (failure) => throw failure,
      (data) => ApiResponse.fromJson(data),
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

  Future<VerifyOtpResponseModel> getProfile() async {
    final result = await getRequest<Map<String, dynamic>>(
      path: ApiEndpoints.getProfile,
      fromJson: (data) => data as Map<String, dynamic>,
    );

    return result.fold(
      (failure) => throw failure,
      (data) => VerifyOtpResponseModel.fromJson(data),
    );
  }

  Future<ConsumerProfileResponse> getConsumerProfile() async {
    final result = await getRequest<Map<String, dynamic>>(
      path: ApiEndpoints.consumerMe,
      fromJson: (data) => data as Map<String, dynamic>,
    );

    return result.fold(
      (failure) => throw failure,
      (data) => ConsumerProfileResponse.fromJson(data['data'] as Map<String, dynamic>),
    );
  }

  Future<ConsumerProfileResponse> updateConsumerProfile({
    String? name,
    String? email,
  }) async {
    final result = await postRequest<Map<String, dynamic>>(
      path: ApiEndpoints.consumerUpdateProfile,
      body: {
        if (name != null) 'name': name,
        if (email != null) 'email': email,
      },
      fromJson: (data) => data as Map<String, dynamic>,
    );

    return result.fold(
      (failure) => throw failure,
      (data) => ConsumerProfileResponse.fromJson(data['data'] as Map<String, dynamic>),
    );
  }

  Future<ConsumerProfileResponse> updateConsumerAddress(String addressId, AddressModel address) async {
    final result = await patchRequest<Map<String, dynamic>>(
      path: ApiEndpoints.consumerAddressDetail(addressId),
      body: address.toJson(),
      fromJson: (data) => data as Map<String, dynamic>,
    );

    return result.fold(
      (failure) => throw failure,
      (data) => ConsumerProfileResponse.fromJson(data['data'] as Map<String, dynamic>),
    );
  }

  Future<ConsumerProfileResponse> addConsumerAddress(AddressModel address) async {
    final result = await postRequest<Map<String, dynamic>>(
      path: ApiEndpoints.consumerAddAddress,
      body: address.toJson(),
      fromJson: (data) => data as Map<String, dynamic>,
    );

    return result.fold(
      (failure) => throw failure,
      (data) => ConsumerProfileResponse.fromJson(data['data'] as Map<String, dynamic>),
    );
  }

  Future<ConsumerProfileResponse> setDefaultAddress(String addressId) async {
    final result = await patchRequest<Map<String, dynamic>>(
      path: ApiEndpoints.consumerAddressDetail(addressId) + '/default',
      body: {},
      fromJson: (data) => data as Map<String, dynamic>,
    );

    return result.fold(
      (failure) => throw failure,
      (data) => ConsumerProfileResponse.fromJson(data['data'] as Map<String, dynamic>),
    );
  }

  Future<ConsumerProfileResponse> deleteConsumerAddress(String addressId) async {
    final result = await deleteRequest<Map<String, dynamic>>(
      path: ApiEndpoints.consumerAddressDetail(addressId),
      fromJson: (data) => data as Map<String, dynamic>,
    );

    return result.fold(
      (failure) => throw failure,
      (data) => ConsumerProfileResponse.fromJson(data['data'] as Map<String, dynamic>),
    );
  }
}
