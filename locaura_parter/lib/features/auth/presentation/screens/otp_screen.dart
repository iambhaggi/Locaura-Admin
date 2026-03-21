import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../../core/extensions/context_extensions.dart';
import '../../../../core/router/app_router.dart';
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
  bool _agreedToTerms = true;
  int _timerSeconds = 25;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_timerSeconds == 0) {
        timer.cancel();
      } else {
        setState(() => _timerSeconds--);
      }
    });
  }

  @override
  void dispose() {
    _otpController.dispose();
    _timer?.cancel();
    super.dispose();
  }

  void _onVerify() {
    context.unfocus();
    final otp = _otpController.text.trim();
    if (otp.length != 6) {
      context.showSnackbar('Enter the 6-digit OTP', isError: true);
      return;
    }
    if (!_agreedToTerms) {
      context.showSnackbar('Please agree to the terms and conditions', isError: true);
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
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.black, size: 24),
          onPressed: () => context.pop(),
        ),
        title: Text(
          'Verify Details',
          style: context.textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.w600,
            fontSize: 20.sp,
          ),
        ),
        centerTitle: false,
      ),
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 24.w),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(height: 32.h),
              Text(
                'Enter OTP sent on +91 ${widget.phone}',
                style: context.textTheme.bodyLarge?.copyWith(
                  fontWeight: FontWeight.w500,
                  color: Colors.black.withOpacity(0.8),
                ),
              ),
              SizedBox(height: 32.h),
              Text(
                'Enter OTP',
                style: context.textTheme.bodySmall?.copyWith(
                  color: Colors.grey.shade600,
                  fontSize: 14.sp,
                ),
              ),
              SizedBox(height: 12.h),
              OtpInputWidget(controller: _otpController),
              SizedBox(height: 24.h),
              Center(
                child: Text(
                  _timerSeconds > 0
                      ? 'Request OTP in ${_timerSeconds} sec'
                      : 'Resend OTP',
                  style: TextStyle(
                    color: Colors.grey.shade500,
                    fontSize: 14.sp,
                  ),
                ),
              ),
              SizedBox(height: 32.h),
              Row(
                children: [
                  Checkbox(
                    value: _agreedToTerms,
                    onChanged: (v) => setState(() => _agreedToTerms = v ?? true),
                    activeColor: const Color(0xFF0056D2),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(4.r),
                    ),
                  ),
                  Expanded(
                    child: RichText(
                      text: TextSpan(
                        text: 'I agree to the ',
                        style: context.textTheme.bodyMedium?.copyWith(
                          color: Colors.grey.shade700,
                        ),
                        children: [
                          TextSpan(
                            text: 'Merchant Terms',
                            style: const TextStyle(
                              color: Color(0xFF0056D2),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const TextSpan(text: ' & '),
                          TextSpan(
                            text: 'Privacy Policy',
                            style: const TextStyle(
                              color: Color(0xFF0056D2),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              const Spacer(),
              SizedBox(
                width: double.infinity,
                height: 56.h,
                child: ElevatedButton(
                  onPressed: isLoading ? null : _onVerify,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0056D2),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(28.r),
                    ),
                    elevation: 0,
                  ),
                  child: isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : Text(
                          'Continue',
                          style: TextStyle(
                            fontSize: 18.sp,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                ),
              ),
              SizedBox(height: 24.h),
            ],
          ),
        ),
      ),
    );
  }
}

