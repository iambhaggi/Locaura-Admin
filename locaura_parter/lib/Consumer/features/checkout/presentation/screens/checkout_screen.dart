import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../../core/theme/app_colors.dart';
import '../../../../../core/router/app_router.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  String _selectedPayment = 'upi';
  bool _isProcessing = false;

  void _placeOrder() {
    setState(() => _isProcessing = true);
    // Simulate API call
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        context.go(AppRoutes.orderConfirmation, extra: 'LOC-${DateTime.now().millisecondsSinceEpoch.toString().substring(5)}');
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.offWhite,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new, color: AppColors.charcoal, size: 20.sp),
          onPressed: () => context.pop(),
        ),
        title: Text(
          'Checkout',
          style: GoogleFonts.inter(fontSize: 18.sp, fontWeight: FontWeight.w600, color: AppColors.charcoal),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16.w),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSectionTitle('Delivery Address'),
            _buildAddressCard(),
            SizedBox(height: 24.h),
            
            _buildSectionTitle('Payment Method'),
            _buildPaymentMethods(),
            SizedBox(height: 24.h),
            
            _buildSectionTitle('Order Summary'),
            _buildOrderSummary(),
            SizedBox(height: 100.h), // padding for bottom bar
          ],
        ),
      ),
      bottomSheet: _buildBottomBar(),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: EdgeInsets.only(bottom: 12.h),
      child: Text(
        title,
        style: GoogleFonts.inter(fontSize: 16.sp, fontWeight: FontWeight.w700, color: AppColors.charcoal),
      ),
    );
  }

  Widget _buildAddressCard() {
    return Container(
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12.r),
        border: Border.all(color: AppColors.grey200),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.location_on_rounded, color: AppColors.charcoal, size: 24.sp),
          SizedBox(width: 12.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Home',
                  style: GoogleFonts.inter(fontSize: 14.sp, fontWeight: FontWeight.w600, color: AppColors.charcoal),
                ),
                SizedBox(height: 4.h),
                Text(
                  '123 Market St, San Francisco, CA 94105\nPhone: +1 234 567 8900',
                  style: GoogleFonts.inter(fontSize: 13.sp, color: AppColors.grey600, height: 1.4),
                ),
              ],
            ),
          ),
          TextButton(
            onPressed: () {}, // Open address sheet
            child: Text(
              'Change',
              style: GoogleFonts.inter(fontSize: 13.sp, fontWeight: FontWeight.w600, color: AppColors.gold),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentMethods() {
    return Column(
      children: [
        _PaymentOptionTile(
          value: 'upi',
          groupValue: _selectedPayment,
          title: 'UPI (GPay, PhonePe, Paytm)',
          icon: Icons.qr_code_scanner_rounded,
          onChanged: (v) => setState(() => _selectedPayment = v!),
        ),
        SizedBox(height: 8.h),
        _PaymentOptionTile(
          value: 'card',
          groupValue: _selectedPayment,
          title: 'Credit / Debit Card',
          icon: Icons.credit_card_rounded,
          onChanged: (v) => setState(() => _selectedPayment = v!),
        ),
        SizedBox(height: 8.h),
        _PaymentOptionTile(
          value: 'cod',
          groupValue: _selectedPayment,
          title: 'Cash on Delivery',
          icon: Icons.payments_outlined,
          onChanged: (v) => setState(() => _selectedPayment = v!),
        ),
      ],
    );
  }

  Widget _buildOrderSummary() {
    return Container(
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12.r),
        border: Border.all(color: AppColors.grey200),
      ),
      child: Column(
        children: [
          _buildSummaryRow('Items (2)', '₹6999'),
          SizedBox(height: 8.h),
          _buildSummaryRow('Delivery Fee', '₹40'),
          SizedBox(height: 8.h),
          _buildSummaryRow('Platform Fee', '₹5'),
          SizedBox(height: 12.h),
          const Divider(),
          SizedBox(height: 12.h),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Total Amount',
                style: GoogleFonts.inter(fontSize: 15.sp, fontWeight: FontWeight.w700, color: AppColors.charcoal),
              ),
              Text(
                '₹7044',
                style: GoogleFonts.inter(fontSize: 16.sp, fontWeight: FontWeight.w700, color: AppColors.charcoal),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: GoogleFonts.inter(fontSize: 13.sp, color: AppColors.grey600)),
        Text(value, style: GoogleFonts.inter(fontSize: 13.sp, fontWeight: FontWeight.w600, color: AppColors.charcoal)),
      ],
    );
  }

  Widget _buildBottomBar() {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 16.h),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -2)),
        ],
      ),
      child: SafeArea(
        child: SizedBox(
          width: double.infinity,
          height: 56.h,
          child: ElevatedButton(
            onPressed: _isProcessing ? null : _placeOrder,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.charcoal,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)),
              elevation: 0,
            ),
            child: _isProcessing
                ? SizedBox(
                    width: 24.w,
                    height: 24.w,
                    child: const CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                  )
                : Text(
                    'Place Order • ₹7044',
                    style: GoogleFonts.inter(fontSize: 16.sp, fontWeight: FontWeight.w600),
                  ),
          ),
        ),
      ),
    );
  }
}

class _PaymentOptionTile extends StatelessWidget {
  final String title;
  final String value;
  final String groupValue;
  final IconData icon;
  final ValueChanged<String?> onChanged;

  const _PaymentOptionTile({
    required this.title,
    required this.value,
    required this.groupValue,
    required this.icon,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final isSelected = value == groupValue;
    return GestureDetector(
      onTap: () => onChanged(value),
      child: Container(
        padding: EdgeInsets.all(16.w),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.gold.withOpacity(0.05) : Colors.white,
          borderRadius: BorderRadius.circular(12.r),
          border: Border.all(color: isSelected ? AppColors.gold : AppColors.grey200, width: isSelected ? 1.5 : 1),
        ),
        child: Row(
          children: [
            Icon(icon, color: isSelected ? AppColors.charcoal : AppColors.grey500, size: 24.sp),
            SizedBox(width: 12.w),
            Expanded(
              child: Text(
                title,
                style: GoogleFonts.inter(
                  fontSize: 14.sp,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                  color: AppColors.charcoal,
                ),
              ),
            ),
            Radio<String>(
              value: value,
              groupValue: groupValue,
              onChanged: onChanged,
              activeColor: AppColors.charcoal,
            ),
          ],
        ),
      ),
    );
  }
}
