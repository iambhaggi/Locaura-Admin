import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:freezed_annotation/freezed_annotation.dart';
import '../../../../core/di/locator.dart';
import '../../domain/entities/retailer.entity.dart';
import '../../domain/repositories/auth_repository.dart';
import '../../domain/usecases/send_otp.usecase.dart';
import '../../domain/usecases/verify_otp.usecase.dart';

part 'auth_controller.freezed.dart';

@freezed
class AuthState with _$AuthState {
  const factory AuthState.initial() = _Initial;
  const factory AuthState.loading() = _Loading;
  const factory AuthState.otpSent(String phone) = _OtpSent;
  const factory AuthState.authenticated(RetailerEntity consumer) = _Authenticated;
  const factory AuthState.error(String message) = _Error;
}

class AuthController extends StateNotifier<AuthState> {
  final SendOtpUseCase _sendOtp;
  final VerifyOtpUseCase _verifyOtp;
  final AuthRepository _repository;

  AuthController(this._sendOtp, this._verifyOtp, this._repository)
      : super(const AuthState.initial());

  Future<void> loadPersistedProfile() async {
    final profile = await _repository.getPersistedProfile();
    if (profile != null) {
      state = AuthState.authenticated(profile);
    }
  }

  Future<void> sendOtp(String phone) async {
    state = const AuthState.loading();
    final result = await _sendOtp(phone);
    result.fold(
      (failure) => state = AuthState.error(failure.message),
      (_) => state = AuthState.otpSent(phone),
    );
  }

  Future<void> verifyOtp(String phone, String otp) async {
    state = const AuthState.loading();
    final result = await _verifyOtp(phone, otp);
    result.fold(
      (failure) => state = AuthState.error(failure.message),
      (consumer) => state = AuthState.authenticated(consumer),
    );
  }

  Future<void> logout() async {
    await _repository.logout();
    state = const AuthState.initial();
  }

  void reset() => state = const AuthState.initial();
}

final authControllerProvider =
    StateNotifierProvider<AuthController, AuthState>((ref) {
  return AuthController(
    SendOtpUseCase(getIt()),
    VerifyOtpUseCase(getIt()),
    getIt<AuthRepository>(),
  );
});