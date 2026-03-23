import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:locaura_parter/core/theme/app_colors.dart';
import 'package:locaura_parter/features/auth/presentation/controllers/auth_controller.dart';
import 'package:locaura_parter/core/router/app_router.dart';
import 'package:package_info_plus/package_info_plus.dart';

class ProfileTab extends ConsumerStatefulWidget {
  const ProfileTab({super.key});

  @override
  ConsumerState<ProfileTab> createState() => _ProfileTabState();
}

class _ProfileTabState extends ConsumerState<ProfileTab> {
  String _appVersion = '';

  @override
  void initState() {
    super.initState();
    _loadAppInfo();
  }

  Future<void> _loadAppInfo() async {
    final info = await PackageInfo.fromPlatform();
    setState(() {
      _appVersion = '${info.version} (${info.buildNumber})';
    });
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authControllerProvider);

    return Scaffold(
      backgroundColor: AppColors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        title: Text(
          'Retailer Profile',
          style: TextStyle(
            color: AppColors.black,
            fontSize: 18.sp,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: authState.maybeWhen(
        authenticated: (retailer) => SingleChildScrollView(
          child: Column(
            children: [
              SizedBox(height: 24.h),
              _buildHeader(retailer.retailerName ?? 'Retailer Name', retailer.id),
              SizedBox(height: 32.h),
              _buildStatsRow(),
              SizedBox(height: 32.h),
              _buildSectionLabel('MANAGE STORE'),
              _buildMenuItem(
                icon: Icons.person_outline,
                title: 'Edit Profile',
                onTap: () => context.push(AppRoutes.editProfile, extra: retailer),
              ),
              _buildMenuItem(
                icon: Icons.account_balance_outlined,
                title: 'Bank Details (Optional)',
                onTap: () {},
              ),
              _buildMenuItem(
                icon: Icons.storefront_outlined,
                title: 'Store Settings',
                onTap: () {},
              ),
              SizedBox(height: 24.h),
              Padding(
                padding: EdgeInsets.symmetric(horizontal: 24.w),
                child: Divider(color: Colors.grey.shade100, height: 1),
              ),
              SizedBox(height: 24.h),
              _buildSectionLabel('POLICIES & SUPPORT'),
              _buildMenuItem(
                icon: Icons.local_shipping_outlined,
                title: 'Shipping Policy',
                onTap: () {},
              ),
              _buildMenuItem(
                icon: Icons.help_outline,
                title: 'Help Center',
                onTap: () {},
              ),
              _buildMenuItem(
                icon: Icons.logout,
                title: 'Logout',
                titleColor: AppColors.error,
                iconBgColor: AppColors.error.withOpacity(0.1),
                iconColor: AppColors.error,
                showChevron: false,
                onTap: () => ref.read(authControllerProvider.notifier).logout(),
              ),
              SizedBox(height: 40.h),
              Text(
                'Version $_appVersion',
                style: TextStyle(fontSize: 12.sp, color: AppColors.grey400),
              ),
              SizedBox(height: 100.h),
            ],
          ),
        ),
        orElse: () => const Center(child: CircularProgressIndicator()),
      ),
    );
  }

  Widget _buildHeader(String name, String id) {
    return Column(
      children: [
        Stack(
          children: [
            Container(
              padding: EdgeInsets.all(4.w),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: Colors.grey.shade200, width: 1),
              ),
              child: CircleAvatar(
                radius: 50.r,
                backgroundColor: Colors.grey.shade100,
                backgroundImage: const NetworkImage(
                    'https://api.dicebear.com/7.x/avataaars/png?seed=Felix'), // Using an avatar placeholder
              ),
            ),
            Positioned(
              bottom: 4.h,
              right: 4.w,
              child: Container(
                padding: EdgeInsets.all(6.r),
                decoration: const BoxDecoration(
                  color: AppColors.primary,
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.edit, color: Colors.white, size: 14.sp),
              ),
            ),
          ],
        ),
        SizedBox(height: 16.h),
        Text(
          name,
          style: TextStyle(
            fontSize: 20.sp,
            fontWeight: FontWeight.bold,
            color: const Color(0xFF1E293B),
          ),
        ),
        SizedBox(height: 4.h),
        Text(
          'Merchant ID: MS${id.substring(0, 8).toUpperCase()}',
          style: TextStyle(
            fontSize: 14.sp,
            color: AppColors.grey500,
          ),
        ),
        SizedBox(height: 8.h),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.check_circle, color: AppColors.success, size: 16.sp),
            SizedBox(width: 6.w),
            Text(
              'Verified Merchant',
              style: TextStyle(
                fontSize: 13.sp,
                color: AppColors.success,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildStatsRow() {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 24.w),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(16.r),
      ),
      child: Row(
        children: [
          _buildStatItem('4.8', 'RATING'),
          Container(width: 1, height: 40.h, color: Colors.grey.shade200),
          _buildStatItem('1.2k', 'ORDERS'),
        ],
      ),
    );
  }

  Widget _buildStatItem(String value, String label) {
    return Expanded(
      child: Padding(
        padding: EdgeInsets.symmetric(vertical: 20.h),
        child: Column(
          children: [
            Text(
              value,
              style: TextStyle(
                fontSize: 18.sp,
                fontWeight: FontWeight.bold,
                color: const Color(0xFF1E293B),
              ),
            ),
            SizedBox(height: 2.h),
            Text(
              label,
              style: TextStyle(
                fontSize: 10.sp,
                fontWeight: FontWeight.w600,
                color: AppColors.grey400,
                letterSpacing: 0.5,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionLabel(String text) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(horizontal: 24.w, vertical: 8.h),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 11.sp,
          fontWeight: FontWeight.bold,
          color: AppColors.grey400,
          letterSpacing: 0.5,
        ),
      ),
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
    Color? titleColor,
    Color? iconBgColor,
    Color? iconColor,
    bool showChevron = true,
  }) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 24.w, vertical: 12.h),
        child: Row(
          children: [
            Container(
              padding: EdgeInsets.all(10.r),
              decoration: BoxDecoration(
                color: iconBgColor ?? const Color(0xFFEFF6FF),
                borderRadius: BorderRadius.circular(10.r),
              ),
              child: Icon(
                icon,
                color: iconColor ?? AppColors.primary,
                size: 20.sp,
              ),
            ),
            SizedBox(width: 16.w),
            Expanded(
              child: Text(
                title,
                style: TextStyle(
                  fontSize: 15.sp,
                  fontWeight: FontWeight.w500,
                  color: titleColor ?? const Color(0xFF334155),
                ),
              ),
            ),
            if (showChevron)
              Icon(
                Icons.arrow_forward_ios,
                size: 14.sp,
                color: AppColors.grey300,
              ),
          ],
        ),
      ),
    );
  }
}
