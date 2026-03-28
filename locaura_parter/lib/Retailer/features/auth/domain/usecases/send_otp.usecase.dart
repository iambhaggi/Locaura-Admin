import '../../../../../core/network/api_result.dart';
import '../repositories/auth_repository.dart';

class SendOtpUseCase {
  final AuthRepository _repository;
  SendOtpUseCase(this._repository);

  ApiResult<void> call(String phone) => _repository.sendOtp(phone);
}