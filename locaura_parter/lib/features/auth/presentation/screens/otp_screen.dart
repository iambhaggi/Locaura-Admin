import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/extensions/context_extensions.dart';
import '../../../../core/router/app_router.dart';
import '../../../../core/utils/app_sizes.dart';
import '../controllers/auth_controller.dart';
import '../widgets/otp_input_widget.dart';

class OtpScreen extends ConsumerStatefulWidget {
  final String phone;
  const OtpScreen({super.key, required this.phone});

  @override
  ConsumerState<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends ConsumerState<OtpScreen> {
  final _otpController = TextEditingController();

  @override
  void dispose() {
    _otpController.dispose();
    super.dispose();
  }

  void _onVerify() {
    context.unfocus();
    final otp = _otpController.text.trim();
    if (otp.length != 6) {
      context.showSnackbar('Enter the 6-digit OTP', isError: true);
      return;
    }
    ref.read(authControllerProvider.notifier).verifyOtp(widget.phone, otp);
  }

  @override
  Widget build(BuildContext context) {
    ref.listen<AuthState>(authControllerProvider, (_, state) {
      state.whenOrNull(
        authenticated: (_) => context.go(AppRoutes.home),
        error: (msg) => context.showSnackbar(msg, isError: true),
      );
    });

    final isLoading = ref.watch(
      authControllerProvider.select(
        (s) => s.maybeWhen(loading: () => true, orElse: () => false),
      ),
    );

    return Scaffold(
      appBar: AppBar(leading: BackButton(onPressed: () => context.pop())),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSizes.pagePaddingH,
            vertical: AppSizes.pagePaddingV,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: AppSizes.s24),
              Text(
                'Verify your\nnumber',
                style: context.textTheme.headlineMedium,
              ),
              const SizedBox(height: AppSizes.s8),
              Text(
                'Code sent to +91 ${widget.phone}',
                style: context.textTheme.bodyMedium,
              ),
              const SizedBox(height: AppSizes.s32),
              OtpInputWidget(controller: _otpController),
              const Spacer(),
              ElevatedButton(
                onPressed: isLoading ? null : _onVerify,
                child: isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Text('Verify OTP'),
              ),
              const SizedBox(height: AppSizes.s16),
            ],
          ),
        ),
      ),
    );
  }
}
