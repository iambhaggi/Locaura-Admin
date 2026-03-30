import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../../../core/di/locator.dart';
import '../../../../../core/utils/app_constants.dart';
import '../../../../../Consumer/features/auth/domain/entities/consumer.entity.dart';
import '../../domain/entities/retailer.entity.dart';
import '../../domain/repositories/auth_repository.dart';
import '../../domain/usecases/send_otp.usecase.dart';
import '../../domain/usecases/verify_otp.usecase.dart';

part 'auth_controller.freezed.dart';

@freezed
class AuthState with _$AuthState {
  const factory AuthState.initial() = _Initial;
  const factory AuthState.loading() = _Loading;
  const factory AuthState.otpSent(String phone, String actorType) = _OtpSent;
  const factory AuthState.authenticated(RetailerEntity consumer) = _Authenticated;
  const factory AuthState.consumerAuthenticated(ConsumerEntity consumer) = _ConsumerAuthenticated;
  const factory AuthState.error(String message) = _Error;
}

class AuthController extends StateNotifier<AuthState> {
  final SendOtpUseCase _sendOtp;
  final VerifyOtpUseCase _verifyOtp;
  final AuthRepository _repository;
  final SharedPreferences _prefs;

  AuthController(this._sendOtp, this._verifyOtp, this._repository)
      : _prefs = getIt<SharedPreferences>(),
        super(const AuthState.initial());

  Future<void> loadPersistedProfile() async {
    try {
      final actorType = _prefs.getString(AppConstants.actorTypeKey);
      final token = _prefs.getString(AppConstants.accessTokenKey);
      
      if (token == null) {
        state = const AuthState.initial();
        return;
      }

      state = const AuthState.loading();
      if (actorType == AppConstants.actorConsumer) {
        await refreshConsumerProfile();
      } else {
        await refreshProfile();
      }
    } catch (e) {
      state = AuthState.error('Failed to load profile: $e');
    }
  }

  Future<void> refreshProfile() async {
    final result = await _repository.getProfile();
    result.fold(
      (failure) {
        // If it's a 401, we should probably logout
        if (failure.statusCode == 401) {
          logout();
        } else if (state is! _Authenticated) {
          // Only set error if we don't have a local profile already
          state = AuthState.error(failure.message);
        }
      },
      (profile) => state = AuthState.authenticated(profile),
    );
  }

  Future<void> sendOtp(String phone, String actorType) async {
    state = const AuthState.loading();
    final result = await _sendOtp(phone,actorType);
    result.fold(
      (failure) => state = AuthState.error(failure.message),
      (_) => state = AuthState.otpSent(phone, actorType),
    );
  }

  Future<void> verifyOtp(String phone, String otp, String actorType) async {
    state = const AuthState.loading();
    final result = await _verifyOtp(phone, otp,actorType);
    await result.fold(
      (failure) async => state = AuthState.error(failure.message),
      (entity) async {
        if (actorType == AppConstants.actorConsumer) {
          final consumer = entity as ConsumerEntity;
          // token already saved in repository layer
          state = AuthState.consumerAuthenticated(consumer);
        } else {
          final retailer = entity as RetailerEntity;
          state = AuthState.authenticated(retailer);
        }
      },
    );
  }

  Future<void> logout() async {
    await _repository.logout();
    state = const AuthState.initial();
  }

  void reset() => state = const AuthState.initial();

  Future<void> refreshConsumerProfile() async {
    final result = await _repository.getConsumerProfile();
    result.fold(
      (failure) {
        if (failure.statusCode == 401) {
          logout();
        }
      },
      (profile) {
        state = AuthState.consumerAuthenticated(profile);
      },
    );
  }

  Future<void> updateProfile({
    String? retailerName,
    String? email,
    String? panCard,
  }) async {
    final currentState = state;
    if (currentState is! _Authenticated) return;

    state = const AuthState.loading();
    final result = await _repository.updateProfile(
      retailerName: retailerName,
      email: email,
      panCard: panCard,
    );

    result.fold(
      (failure) {
        state = AuthState.error(failure.message);
        state = AuthState.authenticated(currentState.consumer);
      },
      (retailer) => state = AuthState.authenticated(retailer),
    );
  }

  Future<void> updateConsumerProfile({
    String? name,
    String? email,
  }) async {
    final currentState = state;
    if (currentState is! _ConsumerAuthenticated) return;

    state = const AuthState.loading();
    final result = await _repository.updateConsumerProfile(
      name: name,
      email: email,
    );

    result.fold(
      (failure) {
        state = AuthState.error(failure.message);
        state = AuthState.consumerAuthenticated(currentState.consumer);
      },
      (consumer) {
        state = AuthState.consumerAuthenticated(consumer);
      },
    );
  }

  Future<void> addConsumerAddress(AddressEntity address) async {
    final currentState = state;
    if (currentState is! _ConsumerAuthenticated) return;

    state = const AuthState.loading();
    final result = await _repository.addConsumerAddress(address);

    result.fold(
      (failure) {
        state = AuthState.error(failure.message);
        state = AuthState.consumerAuthenticated(currentState.consumer);
      },
      (consumer) {
        state = AuthState.consumerAuthenticated(consumer);
      },
    );
  }

  Future<void> updateConsumerAddress(String addressId, AddressEntity address) async {
    final currentState = state;
    if (currentState is! _ConsumerAuthenticated) return;

    state = const AuthState.loading();
    final result = await _repository.updateConsumerAddress(addressId, address);

    result.fold(
      (failure) {
        state = AuthState.error(failure.message);
        state = AuthState.consumerAuthenticated(currentState.consumer);
      },
      (consumer) {
        state = AuthState.consumerAuthenticated(consumer);
      },
    );
  }

  Future<void> setDefaultAddress(String addressId) async {
    final currentState = state;
    if (currentState is! _ConsumerAuthenticated) return;

    final result = await _repository.setDefaultAddress(addressId);
    result.fold(
      (failure) => state = AuthState.error(failure.message),
      (consumer) {
        state = AuthState.consumerAuthenticated(consumer);
      },
    );
  }

  Future<void> deleteConsumerAddress(String addressId) async {
    final currentState = state;
    if (currentState is! _ConsumerAuthenticated) return;

    state = const AuthState.loading();
    final result = await _repository.deleteConsumerAddress(addressId);

    result.fold(
      (failure) {
        state = AuthState.error(failure.message);
        state = AuthState.consumerAuthenticated(currentState.consumer);
      },
      (consumer) {
        state = AuthState.consumerAuthenticated(consumer);
      },
    );
  }

  Future<bool> addToCart(String storeId, String variantId, int quantity, {bool force = false}) async {
    final currentState = state;
    if (currentState is! _ConsumerAuthenticated) return false;

    final currentCart = currentState.consumer.cart;
    
    // Check for store conflict
    if (!force && currentCart != null && currentCart.items.isNotEmpty && 
        currentCart.storeId != null && currentCart.storeId != storeId) {
      return false; // Indicate conflict
    }

    state = const AuthState.loading();
    final result = await _repository.addToCart(storeId, variantId, quantity);

    return result.fold(
      (failure) {
        state = AuthState.error(failure.message);
        state = AuthState.consumerAuthenticated(currentState.consumer);
        return false;
      },
      (consumer) {
        state = AuthState.consumerAuthenticated(consumer);
        return true;
      },
    );
  }

  Future<void> updateCartQuantity(String variantId, int quantity) async {
    final currentState = state;
    if (currentState is! _ConsumerAuthenticated) return;

    state = const AuthState.loading();
    final result = await _repository.updateCartQuantity(variantId, quantity);

    result.fold(
      (failure) {
        state = AuthState.error(failure.message);
        state = AuthState.consumerAuthenticated(currentState.consumer);
      },
      (consumer) => state = AuthState.consumerAuthenticated(consumer),
    );
  }

  Future<void> removeFromCart(String variantId) async {
    final currentState = state;
    if (currentState is! _ConsumerAuthenticated) return;

    state = const AuthState.loading();
    final result = await _repository.removeFromCart(variantId);

    result.fold(
      (failure) {
        state = AuthState.error(failure.message);
        state = AuthState.consumerAuthenticated(currentState.consumer);
      },
      (consumer) => state = AuthState.consumerAuthenticated(consumer),
    );
  }

  Future<void> clearCart() async {
    final currentState = state;
    if (currentState is! _ConsumerAuthenticated) return;

    state = const AuthState.loading();
    final result = await _repository.clearCart();

    result.fold(
      (failure) {
        state = AuthState.error(failure.message);
        state = AuthState.consumerAuthenticated(currentState.consumer);
      },
      (_) {
        // Clear locally immediately
        final updatedConsumer = currentState.consumer.copyWith(
          cart: const ConsumerCartEntity(items: [], storeId: null),
        );
        state = AuthState.consumerAuthenticated(updatedConsumer);
      },
    );
  }
}

final authControllerProvider =
    StateNotifierProvider<AuthController, AuthState>((ref) {
  return AuthController(
    SendOtpUseCase(getIt()),
    VerifyOtpUseCase(getIt()),
    getIt<AuthRepository>(),
  );
});