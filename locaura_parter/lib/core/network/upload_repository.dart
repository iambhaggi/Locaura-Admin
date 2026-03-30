import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fpdart/fpdart.dart';
import 'api_result.dart';
import 'api_service.dart';
import 'api_endpoints.dart';
import 'api_client.dart';

final uploadRepositoryProvider = Provider((ref) => UploadRepository(ref.watch(dioProvider)));

class UploadRepository extends ApiService {
  UploadRepository(Dio httpClient) : super(httpClient: httpClient);

  Future<Either<Failure, String>> uploadImage(File file) {
    return uploadFile(
      path: ApiEndpoints.uploadImage,
      file: file,
    );
  }
}
