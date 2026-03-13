import 'dart:async';
import 'dart:io';

import 'package:dio/dio.dart';
import 'package:fpdart/fpdart.dart';
import 'package:path/path.dart';

import 'api_result.dart';

abstract class ApiService {
  final Dio httpClient;
  ApiService({required this.httpClient});

  // ─── GET ───────────────────────────────────────────────────────────────────

  Future<Either<Failure, T>> getRequest<T>({
    required String path,
    required FutureOr<T> Function(dynamic data) fromJson,
    Map<String, dynamic>? queryParameters,
    Map<String, String>? headers,
  }) async {
    try {
      final response = await httpClient.get(
        path,
        queryParameters: queryParameters,
        options: _buildOptions(headers),
      );
      return Right(await fromJson(response.data));
    } catch (e) {
      return Left(handleException(e));
    }
  }

  // ─── POST ──────────────────────────────────────────────────────────────────

  Future<Either<Failure, T>> postRequest<T>({
    required String path,
    required FutureOr<T> Function(dynamic data) fromJson,
    dynamic body,
    Map<String, String>? headers,
  }) async {
    try {
      final response = await httpClient.post(
        path,
        data: body,
        options: _buildOptions(headers),
      );
      return Right(await fromJson(response.data));
    } catch (e) {
      return Left(handleException(e));
    }
  }

  // ─── PUT ───────────────────────────────────────────────────────────────────

  Future<Either<Failure, T>> putRequest<T>({
    required String path,
    required FutureOr<T> Function(dynamic data) fromJson,
    dynamic body,
    Map<String, String>? headers,
  }) async {
    try {
      final response = await httpClient.put(
        path,
        data: body,
        options: _buildOptions(headers),
      );
      return Right(await fromJson(response.data));
    } catch (e) {
      return Left(handleException(e));
    }
  }

  // ─── PATCH ─────────────────────────────────────────────────────────────────

  Future<Either<Failure, T>> patchRequest<T>({
    required String path,
    required FutureOr<T> Function(dynamic data) fromJson,
    dynamic body,
    Map<String, dynamic>? queryParameters,
    Map<String, String>? headers,
  }) async {
    try {
      final response = await httpClient.patch(
        path,
        data: body,
        queryParameters: queryParameters,
        options: _buildOptions(headers),
      );
      return Right(await fromJson(response.data));
    } catch (e) {
      return Left(handleException(e));
    }
  }

  // ─── DELETE ────────────────────────────────────────────────────────────────

  Future<Either<Failure, bool>> deleteRequest({
    required String path,
    Map<String, dynamic>? queryParameters,
    Map<String, String>? headers,
  }) async {
    try {
      await httpClient.delete(
        path,
        queryParameters: queryParameters,
        options: _buildOptions(headers),
      );
      return const Right(true);
    } catch (e) {
      return Left(handleException(e));
    }
  }

  // ─── FILE UPLOAD ───────────────────────────────────────────────────────────

  Future<Either<Failure, String>> uploadFile({
    required String path,
    required File file,
    required String folder,
    void Function(int sent, int total)? onProgress,
  }) async {
    try {
      final formData = FormData.fromMap({
        'folder': folder,
        'fileName': await MultipartFile.fromFile(
          file.path,
          filename: basename(file.path),
        ),
      });

      final response = await httpClient.post(
        path,
        data: formData,
        options: Options(headers: {'Content-Type': 'multipart/form-data'}),
        onSendProgress: onProgress,
      );

      final url = response.data?['data']?['fileUrl'] as String?;
      if (url == null) return const Left(ServerFailure(message: 'File URL missing in response'));
      return Right(url);
    } catch (e) {
      return Left(handleException(e));
    }
  }

  // ─── Options builder ───────────────────────────────────────────────────────

  Options? _buildOptions(Map<String, String>? headers) {
    if (headers == null) return null;
    return Options(headers: headers);
  }
}