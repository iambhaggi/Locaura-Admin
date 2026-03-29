import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:geolocator/geolocator.dart';
import 'package:locaura_parter/Consumer/features/auth/domain/entities/consumer.entity.dart';
import 'package:logger/logger.dart';
import '../../../../../core/theme/app_colors.dart';
import '../../../../../core/router/app_router.dart';
import '../widgets/add_address_sheet.dart';
import '../../../../../Retailer/features/auth/presentation/controllers/auth_controller.dart';

class LocationScreen extends ConsumerStatefulWidget {
  const LocationScreen({super.key});

  @override
  ConsumerState<LocationScreen> createState() => _LocationScreenState();
}

class _LocationScreenState extends ConsumerState<LocationScreen> {
  final _searchCtrl = TextEditingController();
  bool _permissionGranted = false;
  bool _isLocationLoading = false;

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _requestLocation() async {
    setState(() => _isLocationLoading = true);
    final permission = await Geolocator.requestPermission();
    setState(() {
      _isLocationLoading = false;
      _permissionGranted = permission == LocationPermission.always ||
          permission == LocationPermission.whileInUse;
    });
    if (_permissionGranted) {
      if (mounted) context.go(AppRoutes.consumerHome);
    }
  }

  void _selectAddress(AddressEntity address) {
    if (address.id != null) {
      ref.read(authControllerProvider.notifier).setDefaultAddress(address.id!);
    }
  }

  void _showAddAddressSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const AddAddressSheet(),
    );
  }

  void _editAddress(AddressEntity address) {
    if (address.id == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Cannot edit this address. Please delete and add again or clear app data.')),
      );
      return;
    }
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => AddAddressSheet(initialAddress: address),
    );
  }

  void _deleteAddress(AddressEntity address) {
    if (address.id == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Cannot delete this address (missing ID). Please contact support.')),
      );
      return;
    }
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16.r)),
        title: Text(
          'Delete Address',
          style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 16.sp),
        ),
        content: Text(
          'Are you sure you want to delete "${address.label}"?',
          style: GoogleFonts.inter(fontSize: 14.sp, color: AppColors.grey500),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Cancel', style: GoogleFonts.inter(color: AppColors.grey500)),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              ref.read(authControllerProvider.notifier).deleteConsumerAddress(address.id!);
            },
            child: Text('Delete', style: GoogleFonts.inter(color: Colors.red, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authControllerProvider);

    return authState.when(
      initial: () => _buildAccessLocation(),
      loading: () => const Scaffold(
        backgroundColor: Colors.white,
        body: Center(child: CircularProgressIndicator()),
      ),
      otpSent: (_, __) => _buildAccessLocation(),
      authenticated: (_) => _buildAccessLocation(),
      error: (msg) => Scaffold(
        backgroundColor: Colors.white,
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 48.sp, color: Colors.red),
              SizedBox(height: 12.h),
              Text(msg, style: GoogleFonts.inter(color: AppColors.grey500, fontSize: 14.sp)),
              SizedBox(height: 16.h),
              ElevatedButton(
                onPressed: () => ref.read(authControllerProvider.notifier).refreshConsumerProfile(),
                child: Text('Retry', style: GoogleFonts.inter()),
              ),
            ],
          ),
        ),
      ),
      consumerAuthenticated: (consumer) {
        final addresses = consumer.addresses;
        if (addresses.isEmpty && !_permissionGranted) {
          return _buildAccessLocation();
        }
        return _buildAddressManager(addresses, consumer);
      },
    );
  }

  Widget _buildAddressManager(List<AddressEntity> addresses, ConsumerEntity consumer) {
    final selectedId = consumer.selectedAddress?.id;
    Logger().i("Selected ID: $selectedId");
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader(),
            Expanded(
              child: SingleChildScrollView(
                padding: EdgeInsets.symmetric(horizontal: 20.w),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(height: 8.h),
                    if (addresses.isNotEmpty) ...[
                      Text(
                        'Saved Addresses',
                        style: GoogleFonts.inter(
                          fontSize: 13.sp,
                          fontWeight: FontWeight.w600,
                          color: AppColors.grey500,
                          letterSpacing: 0.4,
                        ),
                      ),
                      SizedBox(height: 8.h),
                      ...addresses.map((addr) {
                        final isSelected = addr.id != null && addr.id == selectedId;
                        return _AddressTile(
                          address: addr,
                          isSelected: isSelected,
                          onTap: () => _selectAddress(addr),
                          onEdit: () => _editAddress(addr),
                          onDelete: () => _deleteAddress(addr),
                        );
                      }),
                      SizedBox(height: 16.h),
                      Divider(color: AppColors.grey200),
                      SizedBox(height: 16.h),
                    ],
                    _buildAddNewButton(),
                    SizedBox(height: 24.h),
                    _buildFooter(),
                    SizedBox(height: 24.h),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 16.h),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: AppColors.grey200)),
      ),
      child: Row(
        children: [
          Icon(Icons.location_on, color: AppColors.gold, size: 22.sp),
          SizedBox(width: 8.w),
          Expanded(
            child: Text(
              'My Addresses',
              style: GoogleFonts.inter(
                fontSize: 18.sp,
                fontWeight: FontWeight.w700,
                color: AppColors.charcoal,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAddNewButton() {
    return InkWell(
      onTap: _showAddAddressSheet,
      borderRadius: BorderRadius.circular(12.r),
      child: Container(
        width: double.infinity,
        padding: EdgeInsets.symmetric(vertical: 16.h, horizontal: 16.w),
        decoration: BoxDecoration(
          border: Border.all(color: AppColors.gold.withOpacity(0.6), width: 1.5),
          borderRadius: BorderRadius.circular(12.r),
          color: AppColors.gold.withOpacity(0.04),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.add_circle_outline, size: 20.sp, color: AppColors.gold),
            SizedBox(width: 8.w),
            Text(
              'Add New Address',
              style: GoogleFonts.inter(
                fontSize: 14.sp,
                fontWeight: FontWeight.w600,
                color: AppColors.charcoal,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAccessLocation() {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 28.w),
          child: Column(
            children: [
              const Spacer(flex: 3),
              Container(
                width: 160.w,
                height: 160.w,
                decoration: BoxDecoration(
                  color: AppColors.cream,
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.location_on_outlined, size: 64.sp, color: AppColors.charcoal),
              ),
              SizedBox(height: 40.h),
              Text(
                'Allow access to your location for a faster delivery experience in your area.',
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(
                  fontSize: 15.sp,
                  color: AppColors.charcoal,
                  height: 1.5,
                  fontWeight: FontWeight.w400,
                ),
              ),
              const Spacer(flex: 2),
              SizedBox(
                width: double.infinity,
                height: 52.h,
                child: ElevatedButton.icon(
                  onPressed: _isLocationLoading ? null : _requestLocation,
                  icon: _isLocationLoading
                      ? SizedBox(
                          width: 18.w,
                          height: 18.w,
                          child: const CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : Icon(Icons.navigation_rounded, size: 18.sp),
                  label: Text(
                    'Allow Location Access',
                    style: GoogleFonts.inter(fontSize: 15.sp, fontWeight: FontWeight.w600),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.charcoal,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)),
                    elevation: 0,
                  ),
                ),
              ),
              SizedBox(height: 20.h),
              Row(
                children: [
                  const Expanded(child: Divider()),
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 12.w),
                    child: Text('OR', style: GoogleFonts.inter(fontSize: 12.sp, color: AppColors.grey400)),
                  ),
                  const Expanded(child: Divider()),
                ],
              ),
              SizedBox(height: 20.h),
              Container(
                height: 48.h,
                decoration: BoxDecoration(
                  border: Border.all(color: AppColors.grey200),
                  borderRadius: BorderRadius.circular(10.r),
                ),
                child: TextField(
                  controller: _searchCtrl,
                  style: GoogleFonts.inter(fontSize: 14.sp, color: AppColors.charcoal),
                  decoration: InputDecoration(
                    hintText: 'Search for area, street name...',
                    hintStyle: GoogleFonts.inter(fontSize: 14.sp, color: AppColors.grey400),
                    prefixIcon: Icon(Icons.search, color: AppColors.grey400, size: 20.sp),
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(vertical: 14.h),
                  ),
                ),
              ),
              SizedBox(height: 16.h),
              TextButton.icon(
                onPressed: _showAddAddressSheet,
                icon: Icon(Icons.location_city_outlined, size: 18.sp, color: AppColors.charcoal),
                label: Text(
                  'Enter Location Manually',
                  style: GoogleFonts.inter(fontSize: 14.sp, color: AppColors.charcoal, fontWeight: FontWeight.w500),
                ),
              ),
              const Spacer(),
              _buildFooter(),
              SizedBox(height: 24.h),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFooter() {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.shield_outlined, size: 12.sp, color: AppColors.grey400),
            SizedBox(width: 4.w),
            Text(
              'Your location data is encrypted and secure.',
              style: GoogleFonts.inter(fontSize: 11.sp, color: AppColors.grey400),
            ),
          ],
        ),
        SizedBox(height: 6.h),
        RichText(
          text: TextSpan(
            text: 'By continuing, you agree to Locaura\'s ',
            style: GoogleFonts.inter(fontSize: 10.sp, color: AppColors.grey400),
            children: [
              TextSpan(
                text: 'Terms of Service',
                style: GoogleFonts.inter(
                  fontSize: 10.sp,
                  color: AppColors.charcoal,
                  decoration: TextDecoration.underline,
                ),
              ),
              const TextSpan(text: ' and '),
              TextSpan(
                text: 'Privacy Policy',
                style: GoogleFonts.inter(
                  fontSize: 10.sp,
                  color: AppColors.charcoal,
                  decoration: TextDecoration.underline,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _AddressTile extends StatelessWidget {
  final AddressEntity address;
  final bool isSelected;
  final VoidCallback onTap;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  const _AddressTile({
    required this.address,
    required this.isSelected,
    required this.onTap,
    required this.onEdit,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: EdgeInsets.only(bottom: 10.h),
        padding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 12.h),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.gold.withOpacity(0.06) : Colors.white,
          borderRadius: BorderRadius.circular(12.r),
          border: Border.all(
            color: isSelected ? AppColors.gold : AppColors.grey200,
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Row(
          children: [
            // Icon
            Container(
              width: 40.w,
              height: 40.w,
              decoration: BoxDecoration(
                color: isSelected ? AppColors.charcoal : AppColors.cream,
                borderRadius: BorderRadius.circular(10.r),
              ),
              child: Icon(
                _labelIcon(address.label),
                color: isSelected ? Colors.white : AppColors.charcoal,
                size: 20.sp,
              ),
            ),
            SizedBox(width: 12.w),
            // Text
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        address.label,
                        style: GoogleFonts.inter(
                          fontSize: 14.sp,
                          fontWeight: FontWeight.w600,
                          color: AppColors.charcoal,
                        ),
                      ),
                      if (address.isDefault) ...[
                        SizedBox(width: 6.w),
                        Container(
                          padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 2.h),
                          decoration: BoxDecoration(
                            color: AppColors.gold.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(4.r),
                          ),
                          child: Text(
                            'Default',
                            style: GoogleFonts.inter(
                              fontSize: 9.sp,
                              color: AppColors.gold,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                  SizedBox(height: 2.h),
                  Text(
                    '${address.line1}, ${address.city}',
                    style: GoogleFonts.inter(fontSize: 12.sp, color: AppColors.grey500),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            // Actions
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Radio indicator
                Container(
                  width: 18.w,
                  height: 18.w,
                  margin: EdgeInsets.only(right: 8.w),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: isSelected ? AppColors.gold : AppColors.grey300,
                      width: isSelected ? 5.w : 1.5,
                    ),
                  ),
                ),
                IconButton(
                  onPressed: onEdit,
                  icon: Icon(Icons.edit_outlined, size: 16.sp, color: AppColors.grey500),
                  padding: EdgeInsets.all(4.w),
                  constraints: BoxConstraints(minWidth: 28.w, minHeight: 28.w),
                  tooltip: 'Edit',
                ),
                IconButton(
                  onPressed: onDelete,
                  icon: Icon(Icons.delete_outline, size: 16.sp, color: Colors.red.shade400),
                  padding: EdgeInsets.all(4.w),
                  constraints: BoxConstraints(minWidth: 28.w, minHeight: 28.w),
                  tooltip: 'Delete',
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  IconData _labelIcon(String label) {
    switch (label.toLowerCase()) {
      case 'home':
        return Icons.home_outlined;
      case 'work':
      case 'office':
        return Icons.work_outline;
      default:
        return Icons.location_on_outlined;
    }
  }
}
