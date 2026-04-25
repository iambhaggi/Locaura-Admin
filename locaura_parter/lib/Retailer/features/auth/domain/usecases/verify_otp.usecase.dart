import '../../../../../core/network/api_result.dart';

import '../repositories/auth_repository.dart';

class VerifyOtpUseCase {
  final AuthRepository _repository;
  VerifyOtpUseCase(this._repository);

  ApiResult<dynamic> call(String phone, String otp,String actorType) =>
      _repository.verifyOtp(phone, otp,actorType);
}