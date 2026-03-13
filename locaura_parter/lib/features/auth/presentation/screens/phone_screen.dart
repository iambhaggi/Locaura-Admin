import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/extensions/context_extensions.dart';
import '../../../../core/router/app_router.dart';
import '../../../../core/utils/app_sizes.dart';
import '../controllers/auth_controller.dart';
import '../widgets/phone_input_widget.dart';

class PhoneScreen extends ConsumerStatefulWidget {
  const PhoneScreen({super.key});

  @override
  ConsumerState<PhoneScreen> createState() => _PhoneScreenState();
}

class _PhoneScreenState extends ConsumerState<PhoneScreen> {
  final _formKey = GlobalKey<FormState>();
  final _phoneController = TextEditingController();

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }

  void _onContinue() {
    context.unfocus();
    if (!(_formKey.currentState?.validate() ?? false)) return;
    ref
        .read(authControllerProvider.notifier)
        .sendOtp(_phoneController.text.trim());
  }

  @override
  Widget build(BuildContext context) {
    ref.listen<AuthState>(authControllerProvider, (_, state) {
      state.whenOrNull(
        otpSent: (phone) => context.go(AppRoutes.otp, extra: phone),
        error: (msg) => context.showSnackbar(msg, isError: true),
      );
    });

    final isLoading = ref.watch(
      authControllerProvider.select(
        (s) => s.maybeWhen(loading: () => true, orElse: () => false),
      ),
    );

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSizes.pagePaddingH,
            vertical: AppSizes.pagePaddingV,
          ),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: AppSizes.s40),
                Text(
                  'Enter your\nphone number',
                  style: context.textTheme.headlineMedium,
                ),
                const SizedBox(height: AppSizes.s8),
                Text(
                  "We'll send you a one-time verification code",
                  style: context.textTheme.bodyMedium,
                ),
                const SizedBox(height: AppSizes.s32),
                PhoneInputWidget(controller: _phoneController),
                const Spacer(),
                ElevatedButton(
                  onPressed: isLoading ? null : _onContinue,
                  child: isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Text('Continue'),
                ),
                const SizedBox(height: AppSizes.s16),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
