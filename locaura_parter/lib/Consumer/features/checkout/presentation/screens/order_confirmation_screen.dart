import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../../core/theme/app_colors.dart';
import '../../../../../core/router/app_router.dart';

class OrderConfirmationScreen extends StatelessWidget {
  final String orderId;

  const OrderConfirmationScreen({super.key, required this.orderId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 24.w),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Spacer(),
              // Success Icon/Circle
              Container(
                width: 100.w,
                height: 100.w,
                decoration: BoxDecoration(
                  color: AppColors.success.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Container(
                    width: 70.w,
                    height: 70.w,
                    decoration: const BoxDecoration(
                      color: AppColors.success,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(Icons.check_rounded, color: Colors.white, size: 40.sp),
                  ),
                ),
              ),
              SizedBox(height: 32.h),
              
              Text(
                'Order Placed Successfully!',
                style: GoogleFonts.inter(fontSize: 22.sp, fontWeight: FontWeight.w700, color: AppColors.charcoal),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: 12.h),
              
              Text(
                'Your fashion finds are being packed at the store and will reach you in about 30 minutes.',
                style: GoogleFonts.inter(fontSize: 14.sp, color: AppColors.grey500, height: 1.5),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: 32.h),
              
              // Order Details Card
              Container(
                padding: EdgeInsets.all(20.w),
                decoration: BoxDecoration(
                  color: AppColors.offWhite,
                  borderRadius: BorderRadius.circular(16.r),
                  border: Border.all(color: AppColors.grey200),
                ),
                child: Column(
                  children: [
                    _buildDetailRow('Order ID', orderId),
                    SizedBox(height: 16.h),
                    const Divider(),
                    SizedBox(height: 16.h),
                    _buildDetailRow('Estimated Delivery', '30 - 45 mins'),
                  ],
                ),
              ),
              
              const Spacer(),
              
              // Buttons
              SizedBox(
                width: double.infinity,
                height: 56.h,
                child: OutlinedButton(
                  onPressed: () {}, // Navigate to track order
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.charcoal,
                    side: BorderSide(color: AppColors.charcoal, width: 1.5),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)),
                  ),
                  child: Text(
                    'Track Order',
                    style: GoogleFonts.inter(fontSize: 16.sp, fontWeight: FontWeight.w600),
                  ),
                ),
              ),
              SizedBox(height: 16.h),
              SizedBox(
                width: double.infinity,
                height: 56.h,
                child: ElevatedButton(
                  onPressed: () => context.go(AppRoutes.consumerHome),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.charcoal,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)),
                    elevation: 0,
                  ),
                  child: Text(
                    'Continue Shopping',
                    style: GoogleFonts.inter(fontSize: 16.sp, fontWeight: FontWeight.w600),
                  ),
                ),
              ),
              SizedBox(height: 32.h),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: GoogleFonts.inter(fontSize: 14.sp, color: AppColors.grey600),
        ),
        Text(
          value,
          style: GoogleFonts.inter(fontSize: 14.sp, fontWeight: FontWeight.w700, color: AppColors.charcoal),
        ),
      ],
    );
  }
}
