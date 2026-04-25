import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';
import '../../../../../core/router/app_router.dart';
import '../../../../../core/theme/app_colors.dart';
import '../../../../../Retailer/features/auth/presentation/controllers/auth_controller.dart';

class ConsumerProfileScreen extends ConsumerWidget {
  const ConsumerProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authControllerProvider);

    return Scaffold(
      backgroundColor: AppColors.offWhite,
      body: authState.maybeWhen(
        consumerAuthenticated: (consumer) => _buildProfile(context, ref, consumer),
        loading: () => const Center(child: CircularProgressIndicator()),
        orElse: () => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('Please log in to view profile'),
              SizedBox(height: 16.h),
              TextButton(
                onPressed: () => ref.read(authControllerProvider.notifier).logout(),
                child: const Text('Not your account? Logout', style: TextStyle(color: Colors.red)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProfile(BuildContext context, WidgetRef ref, dynamic consumer) {
    return CustomScrollView(
      slivers: [
        _buildAppBar(context, consumer),
        SliverToBoxAdapter(
          child: Padding(
            padding: EdgeInsets.all(16.w),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildSectionHeader('Account Overview'),
                SizedBox(height: 12.h),
                _buildProfileItem(Icons.phone_iphone_rounded, 'Phone', consumer.phone),
                _buildProfileItem(Icons.email_outlined, 'Email', consumer.email ?? 'Not set'),
                SizedBox(height: 24.h),
                _buildSectionHeader('Preferences'),
                SizedBox(height: 12.h),
                _buildMenuItem(Icons.location_on_outlined, 'My Addresses', () {}),
                _buildMenuItem(Icons.favorite_border_rounded, 'Wishlist', () {}),
                _buildMenuItem(Icons.shopping_bag_outlined, 'My Orders', () {}),
                SizedBox(height: 24.h),
                _buildSectionHeader('Support'),
                SizedBox(height: 12.h),
                _buildMenuItem(Icons.help_outline_rounded, 'Help Center', () {}),
                _buildMenuItem(Icons.info_outline_rounded, 'About Locaura', () {}),
                SizedBox(height: 24.h),
                _buildSectionHeader('Danger Zone'),
                SizedBox(height: 12.h),
                _buildMenuItem(Icons.logout_rounded, 'Log Out', () => _handleLogout(ref), isDanger: true),
                SizedBox(height: 40.h),
              ],
            ),
          ),
        ),
      ],
    );
  }

  void _handleLogout(WidgetRef ref) {
    ref.read(authControllerProvider.notifier).logout();
  }

  Widget _buildAppBar(BuildContext context, dynamic consumer) {
    return SliverAppBar(
      expandedHeight: 350.h,
      pinned: true,
      backgroundColor: AppColors.charcoal,
      flexibleSpace: FlexibleSpaceBar(
        background: Stack(
          alignment: Alignment.center,
          children: [
            Container(color: AppColors.charcoal),
            Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                SizedBox(height: 40.h),
                CircleAvatar(
                  radius: 40.r,
                  backgroundColor: AppColors.gold,
                  child: Text(
                    (consumer.name?[0] ?? consumer.phone[0]).toUpperCase(),
                    style: GoogleFonts.inter(fontSize: 24.sp, fontWeight: FontWeight.bold, color: AppColors.charcoal),
                  ),
                ),
                SizedBox(height: 12.h),
                Text(
                  consumer.name ?? 'Guest User',
                  style: GoogleFonts.inter(fontSize: 18.sp, fontWeight: FontWeight.bold, color: Colors.white),
                ),
                Text(
                  'Silver Member',
                  style: GoogleFonts.inter(fontSize: 12.sp, color: AppColors.gold, fontWeight: FontWeight.w500),
                ),
                SizedBox(height: 16.h),
                ElevatedButton(
                  onPressed: () => context.push(AppRoutes.consumerEditProfile),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white.withOpacity(0.15),
                    foregroundColor: Colors.white,
                    side: const BorderSide(color: Colors.white30),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20.r)),
                    padding: EdgeInsets.symmetric(horizontal: 24.w, vertical: 0.h),
                    elevation: 0,
                  ),
                  child: Text('Edit Profile', style: GoogleFonts.inter(fontSize: 12.sp, fontWeight: FontWeight.w600)),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title.toUpperCase(),
      style: GoogleFonts.inter(fontSize: 10.sp, fontWeight: FontWeight.w800, color: AppColors.grey500, letterSpacing: 1.2),
    );
  }

  Widget _buildProfileItem(IconData icon, String label, String value) {
    return Container(
      margin: EdgeInsets.only(bottom: 8.h),
      padding: EdgeInsets.all(12.w),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12.r),
        border: Border.all(color: AppColors.grey200),
      ),
      child: Row(
        children: [
          Icon(icon, size: 20.sp, color: AppColors.charcoal),
          SizedBox(width: 12.w),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: GoogleFonts.inter(fontSize: 11.sp, color: AppColors.grey500)),
              Text(value, style: GoogleFonts.inter(fontSize: 13.sp, fontWeight: FontWeight.w600, color: AppColors.charcoal)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMenuItem(IconData icon, String title, VoidCallback onTap, {bool isDanger = false}) {
    final color = isDanger ? Colors.red : AppColors.charcoal;
    return InkWell(
      onTap: onTap,
      child: Container(
        margin: EdgeInsets.only(bottom: 8.h),
        padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 14.h),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12.r),
        ),
        child: Row(
          children: [
            Icon(icon, size: 20.sp, color: color),
            SizedBox(width: 12.w),
            Expanded(
              child: Text(title, style: GoogleFonts.inter(fontSize: 14.sp, fontWeight: FontWeight.w500, color: color)),
            ),
            Icon(Icons.chevron_right_rounded, size: 20.sp, color: AppColors.grey400),
          ],
        ),
      ),
    );
  }
}
