import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../../../core/extensions/context_extensions.dart';
import '../../../../../core/router/app_router.dart';
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
  bool _isRetailer = false;

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
        otpSent: (phone) => context.push(AppRoutes.otp, extra: phone),
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
      body: SafeArea(
        child: SingleChildScrollView(
          padding: EdgeInsets.symmetric(horizontal: 32.w),
          child: Form(
            key: _formKey,
            child: Column(
              children: [
                SizedBox(height: 60.h),
                // Logo
                Container(
                  width: 80.w,
                  height: 80.w,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [Color(0xFF4CAF50), Color(0xFF2E7D32)],
                    ),
                    borderRadius: BorderRadius.circular(20.r),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    'Locaura',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 16.sp,
                    ),
                  ),
                ),
                SizedBox(height: 40.h),
                // Role Selector
                Container(
                  height: 48.h,
                  decoration: BoxDecoration(
                    color: const Color(0xFFE0F2F1),
                    borderRadius: BorderRadius.circular(24.r),
                  ),
                  child: Padding(
                    padding: EdgeInsets.all(4.w),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        GestureDetector(
                          onTap: () => setState(() => _isRetailer = true),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            padding: EdgeInsets.symmetric(horizontal: 24.w),
                            decoration: BoxDecoration(
                              color: _isRetailer ? const Color(0xFF0056D2) : Colors.transparent,
                              borderRadius: BorderRadius.circular(20.r),
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              'Retailer',
                              style: TextStyle(
                                color: _isRetailer ? Colors.white : Colors.black54,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ),
                        GestureDetector(
                          onTap: () => setState(() => _isRetailer = false),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            padding: EdgeInsets.symmetric(horizontal: 24.w),
                            decoration: BoxDecoration(
                              color: !_isRetailer ? const Color(0xFF0056D2) : Colors.transparent,
                              borderRadius: BorderRadius.circular(20.r),
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              'Customer',
                              style: TextStyle(
                                color: !_isRetailer ? Colors.white : Colors.black54,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                SizedBox(height: 24.h),
                Text(
                  'Enter your phone number and we will send\nan OTP to continue',
                  textAlign: TextAlign.center,
                  style: context.textTheme.bodyMedium?.copyWith(
                    color: Colors.grey.shade600,
                    height: 1.4,
                  ),
                ),
                SizedBox(height: 32.h),
                PhoneInputWidget(controller: _phoneController),
                SizedBox(height: 24.h),
                SizedBox(
                  width: double.infinity,
                  height: 52.h,
                  child: OutlinedButton(
                    onPressed: isLoading ? null : _onContinue,
                    style: OutlinedButton.styleFrom(
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(26.r),
                      ),
                      side: BorderSide(color: Colors.grey.shade300),
                    ),
                    child: isLoading
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Color(0xFF0056D2),
                            ),
                          )
                        : Text(
                            'Send OTP',
                            style: TextStyle(
                              color: const Color(0xFF0056D2),
                              fontSize: 18.sp,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                  ),
                ),
                SizedBox(height: 40.h),
                Text(
                  'OR',
                  style: TextStyle(color: Colors.grey.shade400, fontSize: 12.sp),
                ),
                SizedBox(height: 40.h),
                // Since user said "without google signin", we just add the "Need help" part
                // The image had a google button, but we remove it.
                Text(
                  'Need help with login ?',
                  style: TextStyle(
                    color: Colors.grey.shade500,
                    fontSize: 14.sp,
                  ),
                ),
                SizedBox(height: 24.h),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

