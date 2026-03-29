import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:geolocator/geolocator.dart';
import 'package:locaura_parter/Consumer/features/auth/domain/entities/consumer.entity.dart';
import '../../../../../core/theme/app_colors.dart';
import '../../../../../core/router/app_router.dart';
import '../providers/location_provider.dart';
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
  bool _isLoading = false;

  // Replaced hardcoded _savedAddresses with live provider data

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _requestLocation() async {
    setState(() => _isLoading = true);
    final permission = await Geolocator.requestPermission();
    setState(() {
      _isLoading = false;
      _permissionGranted = permission == LocationPermission.always ||
          permission == LocationPermission.whileInUse;
    });
    if (_permissionGranted) {
      if (mounted) context.go(AppRoutes.consumerHome);
    }
  }

  void _selectAddress(AddressEntity address) {
    ref.read(locationProvider.notifier).selectAddress(address);
    // Router will automatically redirect because state changed
  }

  void _showAddAddressSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const AddAddressSheet(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: (ref.watch(locationProvider).addresses.isNotEmpty || _permissionGranted)
            ? _buildSavedAddresses()
            : _buildAccessLocation(),
      ),
    );
  }

  Widget _buildAccessLocation() {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 28.w),
      child: Column(
        children: [
          const Spacer(flex: 3),
          // Illustration placeholder
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
          // Allow location button
          SizedBox(
            width: double.infinity,
            height: 52.h,
            child: ElevatedButton.icon(
              onPressed: _isLoading ? null : _requestLocation,
              icon: _isLoading
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
          // Search area
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
          Column(
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
                      style: GoogleFonts.inter(fontSize: 10.sp, color: AppColors.charcoal, decoration: TextDecoration.underline),
                    ),
                    const TextSpan(text: ' and '),
                    TextSpan(
                      text: 'Privacy Policy',
                      style: GoogleFonts.inter(fontSize: 10.sp, color: AppColors.charcoal, decoration: TextDecoration.underline),
                    ),
                  ],
                ),
              ),
            ],
          ),
          SizedBox(height: 24.h),
        ],
      ),
    );
  }

  Widget _buildSavedAddresses() {
    final savedAddresses = ref.watch(locationProvider).addresses;

    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 20.w),
      child: Column(
        children: [
          if (savedAddresses.isEmpty)
            Padding(
              padding: EdgeInsets.symmetric(vertical: 32.h),
              child: Center(
                child: Text(
                  'No saved addresses found',
                  style: GoogleFonts.inter(fontSize: 12.sp, color: AppColors.grey400),
                ),
              ),
            )
          else
            ...savedAddresses.map((addr) {
              final selectedAddr = ref.watch(locationProvider).selectedAddress;
              final isSelected = selectedAddr != null && selectedAddr.id != null && selectedAddr.id == addr.id;
              return _AddressTile(
                address: addr,
                isSelected: isSelected,
                onTap: () => _selectAddress(addr),
                onEdit: () => _editAddress(addr),
                onDelete: () => _deleteAddress(addr),
              );
            }),
          SizedBox(height: 20.h),
          _buildAddNewButton(),
          const Spacer(),
          _buildFooter(),
          SizedBox(height: 24.h),
        ],
      ),
    );
  }

  void _editAddress(AddressEntity address) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => AddAddressSheet(initialAddress: address),
    );
  }

  void _deleteAddress(AddressEntity address) {
    if (address.id == null) return;
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Delete Address', style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
        content: Text('Are you sure you want to delete this address?', style: GoogleFonts.inter()),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Cancel', style: GoogleFonts.inter(color: AppColors.grey500)),
          ),
          TextButton(
            onPressed: () {
              ref.read(authControllerProvider.notifier).deleteConsumerAddress(address.id!);
              Navigator.pop(context);
            },
            child: Text('Delete', style: GoogleFonts.inter(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  Widget _buildAddNewButton() {
    return InkWell(
      onTap: _showAddAddressSheet,
      child: Container(
        padding: EdgeInsets.symmetric(vertical: 16.h),
        decoration: BoxDecoration(
          border: Border.all(color: AppColors.grey200, style: BorderStyle.solid),
          borderRadius: BorderRadius.circular(12.r),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.add_location_alt_outlined, size: 20.sp, color: AppColors.charcoal),
            SizedBox(width: 8.w),
            Text(
              'Add New Address',
              style: GoogleFonts.inter(fontSize: 14.sp, fontWeight: FontWeight.w600, color: AppColors.charcoal),
            ),
          ],
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
            Text('Your location data is encrypted and secure.',
                style: GoogleFonts.inter(fontSize: 11.sp, color: AppColors.grey400)),
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
                style: GoogleFonts.inter(fontSize: 10.sp, color: AppColors.charcoal, decoration: TextDecoration.underline),
              ),
              const TextSpan(text: ' and '),
              TextSpan(
                text: 'Privacy Policy',
                style: GoogleFonts.inter(fontSize: 10.sp, color: AppColors.charcoal, decoration: TextDecoration.underline),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// Removed _SavedAddress legacy class

class _AddressTile extends StatelessWidget {
  final AddressEntity address;
  final bool isSelected;
  final VoidCallback onTap;
  final VoidCallback onEdit;
  final VoidCallback onDelete;
  const _AddressTile({required this.address, required this.isSelected, required this.onTap, required this.onEdit, required this.onDelete});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: EdgeInsets.symmetric(vertical: 8.h, horizontal: 0),
      leading: Container(
        width: 40.w,
        height: 40.w,
        decoration: BoxDecoration(
          color: isSelected ? AppColors.charcoal : AppColors.cream,
          borderRadius: BorderRadius.circular(10.r),
        ),
        child: Icon(
          address.label == 'Home' ? Icons.home_outlined : Icons.work_outline,
          color: isSelected ? Colors.white : AppColors.charcoal,
          size: 20.sp,
        ),
      ),
      title: Row(
        children: [
          Expanded(
            child: Text(
              address.label,
              style: GoogleFonts.inter(fontSize: 14.sp, fontWeight: FontWeight.w600, color: AppColors.charcoal),
            ),
          ),
          IconButton(
            onPressed: onEdit,
            icon: Icon(Icons.edit_outlined, size: 16.sp, color: AppColors.grey500),
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(),
          ),
          SizedBox(width: 8.w),
          IconButton(
            onPressed: onDelete,
            icon: Icon(Icons.delete_outline, size: 16.sp, color: Colors.red.withOpacity(0.7)),
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(),
          ),
        ],
      ),
      subtitle: Text(
        '${address.line1}, ${address.city}',
        style: GoogleFonts.inter(fontSize: 12.sp, color: AppColors.grey500),
      ),
      trailing: Container(
        width: 20.w,
        height: 20.w,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(
            color: isSelected ? AppColors.gold : AppColors.grey300,
            width: isSelected ? 6.w : 2.w,
          ),
        ),
      ),
      onTap: onTap,
    );
  }
}
