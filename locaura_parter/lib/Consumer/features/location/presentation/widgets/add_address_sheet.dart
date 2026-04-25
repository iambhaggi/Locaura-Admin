import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import 'package:locaura_parter/Consumer/features/auth/domain/entities/consumer.entity.dart';
import '../../../../../core/theme/app_colors.dart';
import '../../../../../Retailer/features/auth/presentation/controllers/auth_controller.dart';

class AddAddressSheet extends ConsumerStatefulWidget {
  final AddressEntity? initialAddress;
  const AddAddressSheet({super.key, this.initialAddress});

  @override
  ConsumerState<AddAddressSheet> createState() => _AddAddressSheetState();
}

class _AddAddressSheetState extends ConsumerState<AddAddressSheet> {
  final _formKey = GlobalKey<FormState>();
  final _labelController = TextEditingController();
  final _line1Controller = TextEditingController();
  final _line2Controller = TextEditingController();
  final _cityController = TextEditingController();
  final _stateController = TextEditingController();
  final _zipController = TextEditingController();
  bool _isDefault = false;

  double? _lat;
  double? _lng;
  bool _isLocating = false;
  String? _locationStatus; // 'success' | 'error' | null

  @override
  void initState() {
    super.initState();
    if (widget.initialAddress != null) {
      final addr = widget.initialAddress!;
      _labelController.text = addr.label;
      _line1Controller.text = addr.line1;
      _line2Controller.text = addr.line2 ?? '';
      _cityController.text = addr.city;
      _stateController.text = addr.state;
      _zipController.text = addr.pincode;
      _isDefault = addr.isDefault;
      if (addr.location != null) {
        _lat = addr.location!.coordinates[1];
        _lng = addr.location!.coordinates[0];
        _locationStatus = 'success';
      }
    }
  }

  Future<void> _fetchAndFillLocation() async {
    setState(() {
      _isLocating = true;
      _locationStatus = null;
    });

    try {
      // Check / request permission
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.deniedForever ||
          permission == LocationPermission.denied) {
        setState(() {
          _isLocating = false;
          _locationStatus = 'error';
        });
        return;
      }

      // Get GPS position
      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      setState(() {
        _lat = position.latitude;
        _lng = position.longitude;
      });

      // Reverse geocode to get address fields
      final placemarks = await placemarkFromCoordinates(
        position.latitude,
        position.longitude,
      );

      if (placemarks.isNotEmpty) {
        final place = placemarks.first;

        // Build street line 1
        final street = [place.subThoroughfare, place.thoroughfare]
            .where((s) => s != null && s.isNotEmpty)
            .join(' ');

        // Build line 2 (locality / sublocality)
        final locality = place.subLocality?.isNotEmpty == true
            ? place.subLocality!
            : place.locality ?? '';

        setState(() {
          if (street.isNotEmpty) _line1Controller.text = street;
          if (locality.isNotEmpty) _line2Controller.text = locality;
          if ((place.locality ?? '').isNotEmpty) _cityController.text = place.locality!;
          if ((place.administrativeArea ?? '').isNotEmpty) _stateController.text = place.administrativeArea!;
          if ((place.postalCode ?? '').isNotEmpty) _zipController.text = place.postalCode!;
          _isLocating = false;
          _locationStatus = 'success';
        });
      } else {
        setState(() {
          _isLocating = false;
          // Coordinates saved but no address found
          _locationStatus = 'success';
        });
      }
    } catch (e) {
      setState(() {
        _isLocating = false;
        _locationStatus = 'error';
      });
    }
  }

  @override
  void dispose() {
    _labelController.dispose();
    _line1Controller.dispose();
    _line2Controller.dispose();
    _cityController.dispose();
    _stateController.dispose();
    _zipController.dispose();
    super.dispose();
  }

  Future<void> _handleSave() async {
    if (!_formKey.currentState!.validate()) return;
    final isEditing = widget.initialAddress != null;

    final address = AddressEntity(
      id: widget.initialAddress?.id,
      label: _labelController.text.trim(),
      line1: _line1Controller.text.trim(),
      line2: _line2Controller.text.trim().isEmpty ? null : _line2Controller.text.trim(),
      city: _cityController.text.trim(),
      state: _stateController.text.trim(),
      pincode: _zipController.text.trim(),
      isDefault: _isDefault,
      location: (_lat != null && _lng != null)
          ? LocationEntity(coordinates: [_lng!, _lat!])
          : null,
    );

    if (isEditing) {
      await ref.read(authControllerProvider.notifier).updateConsumerAddress(widget.initialAddress!.id!, address);
    } else {
      await ref.read(authControllerProvider.notifier).addConsumerAddress(address);
    }

    if (mounted) Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = ref.watch(authControllerProvider).maybeWhen(
          loading: () => true,
          orElse: () => false,
        );
    final isEditing = widget.initialAddress != null;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(20.r),
          topRight: Radius.circular(20.r),
        ),
      ),
      padding: EdgeInsets.fromLTRB(
          24.w, 12.h, 24.w, MediaQuery.of(context).viewInsets.bottom + 24.h),
      child: SingleChildScrollView(
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Drag handle
              Center(
                child: Container(
                  width: 40.w,
                  height: 4.h,
                  decoration: BoxDecoration(
                    color: AppColors.grey200,
                    borderRadius: BorderRadius.circular(2.r),
                  ),
                ),
              ),
              SizedBox(height: 20.h),
              Text(
                isEditing ? 'Edit Address' : 'Add New Address',
                style: GoogleFonts.inter(
                    fontSize: 18.sp,
                    fontWeight: FontWeight.bold,
                    color: AppColors.charcoal),
              ),
              SizedBox(height: 16.h),

              // ── Auto-detect location button ──────────────────────────────
              _buildLocationButton(),
              SizedBox(height: 8.h),

              // Status banner
              if (_locationStatus == 'success')
                _buildStatusBanner(
                  icon: Icons.check_circle_outline,
                  color: Colors.green,
                  message: _lat != null
                      ? 'GPS pinned · Fields auto-filled from your location'
                      : 'Location captured',
                )
              else if (_locationStatus == 'error')
                _buildStatusBanner(
                  icon: Icons.error_outline,
                  color: Colors.orange,
                  message: 'Could not detect location — fill fields manually',
                ),

              SizedBox(height: 20.h),

              // ── Form fields ──────────────────────────────────────────────
              _buildFieldLabel('Label'),
              _buildTextField(_labelController, 'Home, Office, Other…'),
              SizedBox(height: 14.h),

              _buildFieldLabel('Address Line 1'),
              _buildTextField(_line1Controller, 'Building, Street name'),
              SizedBox(height: 14.h),

              _buildFieldLabel('Address Line 2 (Optional)'),
              _buildTextField(_line2Controller, 'Apartment, Suite, Landmark',
                  isRequired: false),
              SizedBox(height: 14.h),

              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildFieldLabel('City'),
                        _buildTextField(_cityController, 'City'),
                      ],
                    ),
                  ),
                  SizedBox(width: 12.w),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildFieldLabel('State'),
                        _buildTextField(_stateController, 'State'),
                      ],
                    ),
                  ),
                ],
              ),
              SizedBox(height: 14.h),

              _buildFieldLabel('Pincode'),
              _buildTextField(_zipController, '6-digit pincode',
                  keyboardType: TextInputType.number),
              SizedBox(height: 14.h),

              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: Text(
                  'Set as Default Address',
                  style: GoogleFonts.inter(
                      fontSize: 14.sp,
                      fontWeight: FontWeight.w500,
                      color: AppColors.charcoal),
                ),
                activeColor: AppColors.gold,
                value: _isDefault,
                onChanged: (v) => setState(() => _isDefault = v),
              ),
              SizedBox(height: 24.h),

              // Save button
              SizedBox(
                width: double.infinity,
                height: 52.h,
                child: ElevatedButton(
                  onPressed: isLoading ? null : _handleSave,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.charcoal,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12.r)),
                  ),
                  child: isLoading
                      ? const CircularProgressIndicator(
                          color: Colors.white, strokeWidth: 2)
                      : Text(
                          isEditing ? 'Update Address' : 'Save Address',
                          style: GoogleFonts.inter(
                              fontSize: 15.sp, fontWeight: FontWeight.w600),
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLocationButton() {
    return SizedBox(
      width: double.infinity,
      height: 46.h,
      child: OutlinedButton.icon(
        onPressed: _isLocating ? null : _fetchAndFillLocation,
        icon: _isLocating
            ? SizedBox(
                width: 16.w,
                height: 16.w,
                child: CircularProgressIndicator(
                    strokeWidth: 2, color: AppColors.charcoal),
              )
            : Icon(Icons.my_location_rounded, size: 18.sp, color: AppColors.charcoal),
        label: Text(
          _isLocating ? 'Detecting location…' : 'Use Current Location',
          style: GoogleFonts.inter(
            fontSize: 13.sp,
            fontWeight: FontWeight.w600,
            color: AppColors.charcoal,
          ),
        ),
        style: OutlinedButton.styleFrom(
          side: BorderSide(color: AppColors.charcoal.withValues(alpha: 0.4)),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10.r)),
          backgroundColor: AppColors.cream.withValues(alpha: 0.5),
        ),
      ),
    );
  }

  Widget _buildStatusBanner({
    required IconData icon,
    required Color color,
    required String message,
  }) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 8.h),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(8.r),
        border: Border.all(color: color.withValues(alpha: 0.25)),
      ),
      child: Row(
        children: [
          Icon(icon, color: color, size: 16.sp),
          SizedBox(width: 8.w),
          Expanded(
            child: Text(
              message,
              style: GoogleFonts.inter(fontSize: 12.sp, color: color.withValues(alpha: 0.85)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFieldLabel(String label) {
    return Padding(
      padding: EdgeInsets.only(bottom: 6.h),
      child: Text(
        label,
        style: GoogleFonts.inter(
            fontSize: 12.sp,
            fontWeight: FontWeight.w600,
            color: AppColors.grey600),
      ),
    );
  }

  Widget _buildTextField(
    TextEditingController controller,
    String hint, {
    TextInputType? keyboardType,
    bool isRequired = true,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      validator: (v) {
        if (!isRequired) return null;
        return v == null || v.isEmpty ? 'Required' : null;
      },
      style: GoogleFonts.inter(fontSize: 14.sp),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: GoogleFonts.inter(color: AppColors.grey400, fontSize: 13.sp),
        filled: true,
        fillColor: AppColors.offWhite,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10.r),
          borderSide: BorderSide.none,
        ),
        contentPadding:
            EdgeInsets.symmetric(horizontal: 16.w, vertical: 14.h),
      ),
    );
  }
}
