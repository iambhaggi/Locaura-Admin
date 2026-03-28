import '../../../../../core/network/api_result.dart';
import '../entities/retailer.entity.dart';
import '../repositories/auth_repository.dart';

class VerifyOtpUseCase {
  final AuthRepository _repository;
  VerifyOtpUseCase(this._repository);

  ApiResult<RetailerEntity> call(String phone, String otp) =>
      _repository.verifyOtp(phone, otp);
}