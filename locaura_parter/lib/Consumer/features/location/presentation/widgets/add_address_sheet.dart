import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:geolocator/geolocator.dart';
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
      }
    } else {
      _fetchCurrentLocation();
    }
  }

  Future<void> _fetchCurrentLocation() async {
    setState(() => _isLocating = true);
    try {
      final position = await Geolocator.getCurrentPosition();
      setState(() {
        _lat = position.latitude;
        _lng = position.longitude;
        _isLocating = false;
      });
    } catch (e) {
      setState(() => _isLocating = false);
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
      location: (_lat != null && _lng != null) ? LocationEntity(coordinates: [_lng!, _lat!]) : null,
    );

    if (isEditing) {
      await ref.read(authControllerProvider.notifier).updateConsumerAddress(widget.initialAddress!.id!, address);
    } else {
      await ref.read(authControllerProvider.notifier).addConsumerAddress(address);
    }

    if (mounted) {
      Navigator.pop(context);
    }
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
      padding: EdgeInsets.fromLTRB(24.w, 12.h, 24.w, MediaQuery.of(context).viewInsets.bottom + 24.h),
      child: SingleChildScrollView(
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
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
              SizedBox(height: 24.h),
              Text(
                isEditing ? 'Edit Address' : 'Add New Address',
                style: GoogleFonts.inter(fontSize: 18.sp, fontWeight: FontWeight.bold, color: AppColors.charcoal),
              ),
              SizedBox(height: 16.h),
              if (_isLocating)
                const LinearProgressIndicator(color: AppColors.gold)
              else if (_lat != null)
                Container(
                  padding: EdgeInsets.all(10.w),
                  decoration: BoxDecoration(
                    color: Colors.green.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(8.r),
                    border: Border.all(color: Colors.green.withOpacity(0.2)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.location_on, color: Colors.green, size: 16),
                      SizedBox(width: 8.w),
                      Text(
                        isEditing ? 'Location Pin Saved' : 'GPS Coordinates Locked',
                        style: GoogleFonts.inter(fontSize: 12.sp, color: Colors.green[700]),
                      ),
                    ],
                  ),
                ),
              SizedBox(height: 20.h),
              _buildFieldLabel('Label'),
              _buildTextField(_labelController, 'Home, Office, etc.'),
              SizedBox(height: 16.h),
              _buildFieldLabel('Address Line 1'),
              _buildTextField(_line1Controller, 'Building, Street name'),
              SizedBox(height: 16.h),
              _buildFieldLabel('Address Line 2 (Optional)'),
              _buildTextField(_line2Controller, 'Apartment, Suite, Landmark', isRequired: false),
              SizedBox(height: 16.h),
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
              SizedBox(height: 16.h),
              _buildFieldLabel('Zip Code'),
              _buildTextField(_zipController, 'Pincode', keyboardType: TextInputType.number),
              SizedBox(height: 16.h),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: Text(
                  'Set as Default Address',
                  style: GoogleFonts.inter(fontSize: 14.sp, fontWeight: FontWeight.w500, color: AppColors.charcoal),
                ),
                activeColor: AppColors.gold,
                value: _isDefault,
                onChanged: (v) => setState(() => _isDefault = v),
              ),
              SizedBox(height: 32.h),
              SizedBox(
                width: double.infinity,
                height: 52.h,
                child: ElevatedButton(
                  onPressed: (isLoading || (_isLocating && !isEditing)) ? null : _handleSave,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.charcoal,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)),
                  ),
                  child: isLoading
                      ? const CircularProgressIndicator(color: Colors.white, strokeWidth: 2)
                      : Text(
                          isEditing ? 'Update Address' : 'Save Address',
                          style: GoogleFonts.inter(fontSize: 15.sp, fontWeight: FontWeight.w600),
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFieldLabel(String label) {
    return Padding(
      padding: EdgeInsets.only(bottom: 6.h),
      child: Text(label, style: GoogleFonts.inter(fontSize: 12.sp, fontWeight: FontWeight.w600, color: AppColors.grey600)),
    );
  }

  Widget _buildTextField(TextEditingController controller, String hint, {TextInputType? keyboardType, bool isRequired = true}) {
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
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10.r), borderSide: BorderSide.none),
        contentPadding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 14.h),
      ),
    );
  }
}
