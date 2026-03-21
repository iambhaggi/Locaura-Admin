import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:locaura_parter/core/extensions/context_extensions.dart';
import 'package:locaura_parter/features/store/domain/entities/store.entity.dart';
import 'package:geolocator/geolocator.dart';
import 'package:logger/logger.dart';
import '../controllers/store_controller.dart';

class StoreFormScreen extends ConsumerStatefulWidget {
  final String? storeId;
  const StoreFormScreen({super.key, this.storeId});

  @override
  ConsumerState<StoreFormScreen> createState() => _StoreFormScreenState();
}

class _StoreFormScreenState extends ConsumerState<StoreFormScreen> {
  final _pageController = PageController();
  final _formKey = GlobalKey<FormState>();
  int _currentPage = 0;

  // Image Picking
  File? _logoFile;
  final _picker = ImagePicker();

  // Location State
  double? _lat;
  double? _lng;
  bool _isFetchingLocation = false;

  // Form Controllers
  final _nameController = TextEditingController();
  final _descController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _retailerNameController = TextEditingController();
  final _streetController = TextEditingController();
  final _cityController = TextEditingController();
  final _stateController = TextEditingController();
  final _zipController = TextEditingController();
  final _gstController = TextEditingController();
  final _fssaiController = TextEditingController();
  final _ifscController = TextEditingController();
  final _accNoController = TextEditingController();
  final _accHolderController = TextEditingController();
  // "Individual"|"Partnership"|"Private Limited"|"Public Limited"
  List<String> _businessTypes = [
    "Individual",
    "Partnership",
    "Private Limited",
    "Public Limited",
  ];

  String _businessType = "Individual";

  @override
  void initState() {
    super.initState();
    _businessType = _businessTypes.first;

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (widget.storeId != null) {
        ref
            .read(storeControllerProvider.notifier)
            .fetchStoreDetails(widget.storeId!);
      } else {
        // Option to prefill for dev testing only in create mode
        // Form Controllers (Prefilled with test data for dev purpose)
        _nameController.text = 'Urban Threads Boutique';
        _descController.text =
            'Premium casual wear and trendy outfits for men and women.';
        _phoneController.text = '9876543210';
        _emailController.text = 'rahul.sharma@example.com';
        _retailerNameController.text = 'Rahul Sharma';
        _streetController.text = '100ft Ring Road';
        _cityController.text = 'Bangalore';
        _stateController.text = 'Karnataka';
        _zipController.text = '560034';
        _gstController.text = '29XYZPB9876Q1Z2';
        _ifscController.text = 'KKBK0008068';
        _accNoController.text = '54123698745';
        _accHolderController.text = 'Rahul Sharma';
        _businessType = _businessTypes.first;
        setState(() {});
      }
    });
  }

  void _prefillFromStore(StoreEntity store) {
    _nameController.text = store.storeName;
    _descController.text = store.description ?? '';
    _phoneController.text = store.retailerPhone;
    _emailController.text = store.retailerEmail;
    _retailerNameController.text = store.retailerName;
    _streetController.text = store.address?.street ?? '';
    _cityController.text = store.address?.city ?? '';
    _stateController.text = store.address?.state ?? '';
    _zipController.text = store.address?.zipCode ?? '';
    _gstController.text = store.gstin ?? '';
    _fssaiController.text =
        store.fssaiLicense ?? ''; // Assuming fssaiLicense exists in StoreEntity
    _ifscController.text = store.bankDetails?.ifscCode ?? '';
    _accNoController.text = store.bankDetails?.accountNumber ?? '';
    _accHolderController.text = store.bankDetails?.accountHolderName ?? '';

    // Load coordinates
    if (store.location?.coordinates != null &&
        store.location!.coordinates!.length == 2) {
      _lng = store.location!.coordinates![0];
      _lat = store.location!.coordinates![1];
    }

    if (_businessTypes.contains(store.businessType)) {
      _businessType = store.businessType!;
    }
    setState(() {});
  }

  @override
  void dispose() {
    _pageController.dispose();
    _nameController.dispose();
    _descController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _retailerNameController.dispose();
    _streetController.dispose();
    _cityController.dispose();
    _stateController.dispose();
    _zipController.dispose();
    _gstController.dispose();
    _fssaiController.dispose();
    _ifscController.dispose();
    _accNoController.dispose();
    _accHolderController.dispose();
    super.dispose();
  }

  Future<void> _pickLogo() async {
    final picked = await _picker.pickImage(source: ImageSource.gallery);
    if (picked != null) {
      setState(() => _logoFile = File(picked.path));
    }
  }

  Future<void> _getCurrentLocation() async {
    setState(() => _isFetchingLocation = true);
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          context.showSnackbar('Location permission denied', isError: true);
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        context.showSnackbar(
          'Location permissions are permanently denied. Please enable in settings.',
          isError: true,
        );
        return;
      }

      final position = await Geolocator.getCurrentPosition(
        locationSettings: LocationSettings(
          accuracy: LocationAccuracy.high,
        )
      );

      setState(() {
        _lat = position.latitude;
        _lng = position.longitude;
      });

      context.showSnackbar('Location fetched successfully!');
    } catch (e) {
      context.showSnackbar('Failed to get location: $e', isError: true);
      Logger().e(e.toString());
    } finally {
      setState(() => _isFetchingLocation = false);
    }
  }

  void _onNext() {
    if (_currentPage < 4) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    } else {
      _submit();
    }
  }

  void _submit() {
    if (_formKey.currentState!.validate()) {
      final storeData = {
        'store_name': _nameController.text,
        'description': _descController.text,
        'business_type': _businessType,
        'retailer_name': _retailerNameController.text,
        'retailer_phone': _phoneController.text,
        'retailer_email': _emailController.text,
        'address': {
          'street': _streetController.text,
          'city': _cityController.text,
          'state': _stateController.text,
          'zip_code': _zipController.text,
        },
        'location': {
          'type': 'Point',
          'coordinates': [_lng ?? 0.0, _lat ?? 0.0],
        },
        'gstin': _gstController.text,
        'fssai_license': _fssaiController.text,
        'bank_details': {
          'account_number': _accNoController.text,
          'ifsc_code': _ifscController.text,
          'account_holder_name': _accHolderController.text,
        },
        // In real app, we'd upload the _logoFile and put URL here
        'logo_url': '',
      };

      if (widget.storeId == null) {
        ref.read(storeControllerProvider.notifier).registerNewStore(storeData);
      } else {
        ref
            .read(storeControllerProvider.notifier)
            .updateExistingStore(widget.storeId!, storeData);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    ref.listen(storeControllerProvider, (previous, next) {
      next.maybeWhen(
        storeCreated: (_) {
          context.showSnackbar('Store created! Awaiting admin approval.');
          context.pop();
        },
        storeUpdated: (_) {
          context.showSnackbar('Store updated successfully!');
          context.pop();
        },
        storeLoaded: (store) => _prefillFromStore(store),
        error: (msg) => context.showSnackbar(msg, isError: true),
        orElse: () {},
      );
    });

    final isLoading = ref
        .watch(storeControllerProvider)
        .maybeWhen(loading: () => true, orElse: () => false);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () {
            if (_currentPage > 0) {
              _pageController.previousPage(
                duration: const Duration(milliseconds: 300),
                curve: Curves.easeInOut,
              );
            } else {
              context.pop();
            }
          },
        ),
        title: Text(
          widget.storeId == null ? 'Add New Store' : 'Edit Store',
          style: const TextStyle(
            color: Colors.black,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
      ),
      body: Column(
        children: [
          LinearProgressIndicator(
            value: (_currentPage + 1) / 5,
            backgroundColor: Colors.grey.shade100,
            valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFFFA641E)),
            minHeight: 2,
          ),
          Expanded(
            child: Form(
              key: _formKey,
              child: PageView(
                controller: _pageController,
                physics: const NeverScrollableScrollPhysics(),
                onPageChanged: (page) => setState(() => _currentPage = page),
                children: [
                  _buildSlide1(),
                  _buildSlide2(),
                  _buildSlide3(),
                  _buildSlide4(),
                  _buildSlide5(),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: _buildFooter(isLoading),
    );
  }

  Widget _buildSlide1() {
    return _buildSlideWrapper(
      title: 'Store Details',
      subtitle:
          'Tell us about your business to get started\nselling on our platform.',
      children: [
        _buildLabel('Store Name'),
        _buildTextField(
          controller: _nameController,
          hint: 'e.g. Sunny Day Groceries',
          validator: (v) => v!.isEmpty ? 'Store name is required' : null,
        ),
        SizedBox(height: 20.h),
        _buildLabel('Business Category'),
        _buildDropdown(),
        SizedBox(height: 20.h),
        _buildLabel('Store Description (Optional)'),
        _buildTextField(
          controller: _descController,
          hint: 'Tell your customers what makes your\nstore special...',
          maxLines: 4,
        ),
        SizedBox(height: 24.h),
        _buildLabel('Store Logo'),
        _buildImageUploadArea(),
      ],
    );
  }

  Widget _buildSlide2() {
    return _buildSlideWrapper(
      title: 'Contact Details',
      subtitle:
          'Provide the primary contact information for\nthis store branch.',
      children: [
        _buildLabel('Retailer Name'),
        _buildTextField(
          controller: _retailerNameController,
          hint: 'e.g. John Doe',
          validator: (v) => v!.isEmpty ? 'Retailer name is required' : null,
        ),
        SizedBox(height: 20.h),
        _buildLabel('Retailer Phone'),
        _buildTextField(
          controller: _phoneController,
          hint: 'e.g. +91 9876543210',
          keyboardType: TextInputType.phone,
          validator: (v) => v!.isEmpty ? 'Phone is required' : null,
        ),
        SizedBox(height: 20.h),
        _buildLabel('Retailer Email'),
        _buildTextField(
          controller: _emailController,
          hint: 'e.g. john@example.com',
          keyboardType: TextInputType.emailAddress,
          validator: (v) => v!.isEmpty ? 'Email is required' : null,
        ),
      ],
    );
  }

  Widget _buildSlide3() {
    return _buildSlideWrapper(
      title: 'Store Location',
      subtitle: 'This will be your pickup address for\norders and delivery.',
      children: [
        _buildLabel('Street Address'),
        _buildTextField(
          controller: _streetController,
          hint: 'Plot No, Street Name',
        ),
        SizedBox(height: 20.h),
        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildLabel('City'),
                  _buildTextField(
                    controller: _cityController,
                    hint: 'e.g. Mumbai',
                  ),
                ],
              ),
            ),
            SizedBox(width: 16.w),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildLabel('State'),
                  _buildTextField(
                    controller: _stateController,
                    hint: 'e.g. Maharashtra',
                  ),
                ],
              ),
            ),
          ],
        ),
        SizedBox(height: 20.h),
        _buildLabel('Pincode'),
        _buildTextField(
          controller: _zipController,
          hint: '6-digit code',
          keyboardType: TextInputType.number,
        ),
        SizedBox(height: 24.h),
        _buildLabel('Fetch Geolocation'),
        Container(
          padding: EdgeInsets.all(16.w),
          decoration: BoxDecoration(
            color: Colors.grey.shade50,
            borderRadius: BorderRadius.circular(12.r),
            border: Border.all(color: Colors.grey.shade200),
          ),
          child: Column(
            children: [
              if (_lat != null && _lng != null) ...[
                Row(
                  children: [
                    Icon(Icons.location_on, color: Colors.green, size: 20.sp),
                    SizedBox(width: 8.w),
                    Text(
                      'Lat: ${_lat!.toStringAsFixed(6)}, Lng: ${_lng!.toStringAsFixed(6)}',
                      style: TextStyle(
                          fontSize: 13.sp,
                          fontWeight: FontWeight.w600,
                          color: Colors.green.shade700),
                    ),
                  ],
                ),
                SizedBox(height: 12.h),
              ],
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: _isFetchingLocation ? null : _getCurrentLocation,
                  icon: _isFetchingLocation
                      ? SizedBox(
                          width: 16.w,
                          height: 16.w,
                          child: const CircularProgressIndicator(
                              strokeWidth: 2, color: Color(0xFFFA641E)),
                        )
                      : const Icon(Icons.my_location),
                  label: Text(_isFetchingLocation
                      ? 'Fetching Location...'
                      : 'Fetch Current GPS Location'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFFFA641E),
                    side: const BorderSide(color: Color(0xFFFA641E)),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8.r),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSlide4() {
    return _buildSlideWrapper(
      title: 'Legal & Compliance',
      subtitle: 'Help us verify your business for\nsmooth operations.',
      children: [
        _buildLabel('GSTIN (Optional)'),
        _buildTextField(
          controller: _gstController,
          hint: 'e.g. 22AAAAA0000A1Z5',
        ),
        SizedBox(height: 20.h),
        _buildLabel('FSSAI License (Optional)'),
        _buildTextField(
          controller: _fssaiController,
          hint: '14-digit registration number',
        ),
        SizedBox(height: 12.h),
        Text(
          'Note: For food businesses, FSSAI is highly recommended for trust.',
          style: TextStyle(fontSize: 11.sp, color: Colors.grey),
        ),
      ],
    );
  }

  Widget _buildSlide5() {
    return _buildSlideWrapper(
      title: 'Settlement Account',
      subtitle: 'Where should we send your payouts for\neach order?',
      children: [
        _buildLabel('Account Holder Name'),
        _buildTextField(
          controller: _accHolderController,
          hint: 'Name as per bank records',
        ),
        SizedBox(height: 20.h),
        _buildLabel('Account Number'),
        _buildTextField(
          controller: _accNoController,
          hint: 'Enter bank account number',
        ),
        SizedBox(height: 20.h),
        _buildLabel('IFSC Code'),
        _buildTextField(controller: _ifscController, hint: 'e.g. SBIN0001234'),
      ],
    );
  }

  Widget _buildSlideWrapper({
    required String title,
    required String subtitle,
    required List<Widget> children,
  }) {
    return ListView(
      padding: EdgeInsets.symmetric(horizontal: 24.w, vertical: 16.h),
      children: [
        Text(
          title,
          style: TextStyle(fontSize: 24.sp, fontWeight: FontWeight.bold),
        ),
        SizedBox(height: 8.h),
        Text(
          subtitle,
          style: TextStyle(
            fontSize: 14.sp,
            color: Colors.grey.shade600,
            height: 1.4,
          ),
        ),
        SizedBox(height: 32.h),
        ...children,
      ],
    );
  }

  Widget _buildLabel(String text) {
    return Padding(
      padding: EdgeInsets.only(bottom: 8.h),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 14.sp,
          color: Colors.black87,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    String? hint,
    int maxLines = 1,
    TextInputType? keyboardType,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      maxLines: maxLines,
      keyboardType: keyboardType,
      validator: validator,
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 13.sp),
        contentPadding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12.r),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12.r),
          borderSide: const BorderSide(color: Color(0xFFFA641E)),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12.r),
          borderSide: const BorderSide(color: Colors.red),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12.r),
          borderSide: const BorderSide(color: Colors.red),
        ),
      ),
    );
  }

  Widget _buildDropdown() {
    return DropdownButtonFormField<String>(
      value: _businessType,
      decoration: InputDecoration(
        contentPadding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12.r),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12.r),
          borderSide: const BorderSide(color: Color(0xFFFA641E)),
        ),
      ),
      items: _businessTypes
          .map((e) => DropdownMenuItem(value: e, child: Text(e)))
          .toList(),
      onChanged: (v) => setState(() => _businessType = v!),
    );
  }

  Widget _buildImageUploadArea() {
    return GestureDetector(
      onTap: _pickLogo,
      child: Container(
        height: 100.h,
        decoration: BoxDecoration(
          color: const Color(0xFFFFF2E8),
          borderRadius: BorderRadius.circular(12.r),
          border: Border.all(
            color: const Color(0xFFFFCCAC),
            style: BorderStyle.solid,
          ), // No dotted in standard BoxDecor, will use solid for now
        ),
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 20.w),
          child: Row(
            children: [
              Container(
                width: 60.w,
                height: 60.w,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12.r),
                ),
                child: _logoFile != null
                    ? ClipRRect(
                        borderRadius: BorderRadius.circular(12.r),
                        child: Image.file(_logoFile!, fit: BoxFit.cover),
                      )
                    : Icon(
                        Icons.add_a_photo_outlined,
                        color: const Color(0xFFFA641E),
                        size: 24.sp,
                      ),
              ),
              SizedBox(width: 16.w),
              Expanded(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'JPG, PNG or GIF. Max size of 5MB.',
                      style: TextStyle(
                        fontSize: 10.sp,
                        color: Colors.grey.shade600,
                      ),
                    ),
                    Text(
                      'Click to upload',
                      style: TextStyle(
                        fontSize: 12.sp,
                        color: const Color(0xFFFA641E),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFooter(bool isLoading) {
    return Container(
      padding: EdgeInsets.all(24.w),
      color: const Color(0xFFF9F9FB),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox(
            width: double.infinity,
            height: 52.h,
            child: ElevatedButton(
              onPressed: isLoading ? null : _onNext,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFFA641E),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12.r),
                ),
                elevation: 0,
              ),
              child: isLoading
                  ? const CircularProgressIndicator(color: Colors.white)
                  : Text(
                      _currentPage == 4 ? 'Create Store' : 'Continue',
                      style: TextStyle(
                        fontSize: 16.sp,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
            ),
          ),
          SizedBox(height: 16.h),
          RichText(
            textAlign: TextAlign.center,
            text: TextSpan(
              style: TextStyle(fontSize: 11.sp, color: Colors.grey.shade500),
              children: const [
                TextSpan(text: 'By creating a store, you agree to our '),
                TextSpan(
                  text: 'Terms of Service',
                  style: TextStyle(decoration: TextDecoration.underline),
                ),
                TextSpan(text: ' and '),
                TextSpan(
                  text: 'Privacy Policy',
                  style: TextStyle(decoration: TextDecoration.underline),
                ),
                TextSpan(text: '.'),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
