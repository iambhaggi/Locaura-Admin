import 'package:dio/dio.dart';
import 'package:fpdart/fpdart.dart';
import '../utils/logger.dart';

// ─── Failures ──────────────────────────────────────────────────────────────

abstract class Failure {
  final String message;
  final int? statusCode;
  const Failure({required this.message, this.statusCode});
}

class ServerFailure extends Failure {
  const ServerFailure({required super.message, super.statusCode});
}

class NetworkFailure extends Failure {
  const NetworkFailure({required super.message}) : super(statusCode: null);
}

class UnauthorizedFailure extends Failure {
  const UnauthorizedFailure()
      : super(message: 'Session expired. Please login again.', statusCode: 401);
}

class NotFoundFailure extends Failure {
  const NotFoundFailure({required super.message}) : super(statusCode: 404);
}

class ValidationFailure extends Failure {
  const ValidationFailure({required super.message}) : super(statusCode: 422);
}

class TimeoutFailure extends Failure {
  const TimeoutFailure()
      : super(message: 'Request timed out. Try again.', statusCode: null);
}

class CancelledFailure extends Failure {
  const CancelledFailure()
      : super(message: 'Request was cancelled.', statusCode: null);
}

class UnknownFailure extends Failure {
  const UnknownFailure({super.message = 'Something went wrong.'})
      : super(statusCode: null);
}

// ─── Type alias ────────────────────────────────────────────────────────────

typedef ApiResult<T> = Future<Either<Failure, T>>;

// ─── Central exception handler ─────────────────────────────────────────────

Failure handleException(Object e) {
  Log.error('API Error: $e', error: e);
  if (e is DioException) return _fromDioException(e);
  return UnknownFailure(message: e.toString());
}

Failure _fromDioException(DioException e) {
  switch (e.type) {
    case DioExceptionType.connectionTimeout:
    case DioExceptionType.sendTimeout:
    case DioExceptionType.receiveTimeout:
      return const TimeoutFailure();

    case DioExceptionType.cancel:
      return const CancelledFailure();

    case DioExceptionType.connectionError:
      return const NetworkFailure(message: 'No internet connection.');

    case DioExceptionType.badResponse:
      return _fromResponse(e.response);

    case DioExceptionType.unknown:
    default:
      return UnknownFailure(message: e.message ?? 'Unknown error occurred.');
  }
}

Failure _fromResponse(Response? response) {
  if (response == null) return const UnknownFailure();

  final message = _extractMessage(response.data);

  switch (response.statusCode) {
    case 400:
      return ValidationFailure(message: message);
    case 401:
      return const UnauthorizedFailure();
    case 403:
      return ServerFailure(message: message, statusCode: 403);
    case 404:
      return NotFoundFailure(message: message);
    case 422:
      return ValidationFailure(message: message);
    case 429:
      return const ServerFailure(
        message: 'Too many requests. Slow down.',
        statusCode: 429,
      );
    case 500:
    case 502:
    case 503:
      return ServerFailure(
        message: 'Server error. Please try again later.',
        statusCode: response.statusCode,
      );
    default:
      return ServerFailure(message: message, statusCode: response.statusCode);
  }
}

String _extractMessage(dynamic data) {
  if (data is Map) {
    return (data['message'] ?? data['error'] ?? 'Something went wrong.').toString();
  }
  return 'Something went wrong.';
}