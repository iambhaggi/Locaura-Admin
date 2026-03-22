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
  File? _bannerFile;
  List<File> _galleryFiles = [];
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

  // Address
  final _shopNoController = TextEditingController();
  final _buildingController = TextEditingController();
  final _streetController = TextEditingController();
  final _cityController = TextEditingController();
  final _stateController = TextEditingController();
  final _zipController = TextEditingController();
  final _landmarkController = TextEditingController();

  // Social
  final _instaController = TextEditingController();
  final _whatsappController = TextEditingController();

  // Legal
  final _gstController = TextEditingController();
  final _fssaiController = TextEditingController();

  // Bank
  final _ifscController = TextEditingController();
  final _accNoController = TextEditingController();
  final _accHolderController = TextEditingController();

  // Operations
  final _radiusController = TextEditingController(text: '10');
  final _minOrderController = TextEditingController(text: '0');
  final _deliveryFeeController = TextEditingController(text: '0');
  bool _isDeliveryAvailable = false;

  // Categories & Hours
  List<String> _selectedCategories = [];
  List<BusinessHourEntity> _businessHours = [
    BusinessHourEntity(day: 'Monday', open: '09:00', close: '21:00'),
    BusinessHourEntity(day: 'Tuesday', open: '09:00', close: '21:00'),
    BusinessHourEntity(day: 'Wednesday', open: '09:00', close: '21:00'),
    BusinessHourEntity(day: 'Thursday', open: '09:00', close: '21:00'),
    BusinessHourEntity(day: 'Friday', open: '09:00', close: '21:00'),
    BusinessHourEntity(day: 'Saturday', open: '09:00', close: '21:00'),
    BusinessHourEntity(day: 'Sunday', open: '09:00', close: '21:00', isClosed: true),
  ];

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
        _shopNoController.text = '102-B';
        _buildingController.text = 'Skyline Heights';
        _streetController.text = '100ft Ring Road';
        _cityController.text = 'Bangalore';
        _stateController.text = 'Karnataka';
        _zipController.text = '560034';
        _landmarkController.text = 'Near HDFC Bank';
        _instaController.text = 'urban_threads';
        _whatsappController.text = '9876543210';
        _gstController.text = '29XYZPB9876Q1Z2';
        _ifscController.text = 'KKBK0008068';
        _accNoController.text = '54123698745';
        _accHolderController.text = 'Rahul Sharma';
        _radiusController.text = '15';
        _minOrderController.text = '500';
        _deliveryFeeController.text = '40';
        _isDeliveryAvailable = true;
        _selectedCategories = ['Groceries', 'Fashion'];
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
    _shopNoController.text = store.address?.shopNumber ?? '';
    _buildingController.text = store.address?.buildingName ?? '';
    _streetController.text = store.address?.street ?? '';
    _cityController.text = store.address?.city ?? '';
    _stateController.text = store.address?.state ?? '';
    _zipController.text = store.address?.zipCode ?? '';
    _landmarkController.text = store.address?.landmark ?? '';
    _instaController.text = store.socialLinks?.instagram ?? '';
    _whatsappController.text = store.socialLinks?.whatsapp ?? '';
    _gstController.text = store.gstin ?? '';
    _fssaiController.text = store.fssaiLicense ?? '';
    _ifscController.text = store.bankDetails?.ifscCode ?? '';
    _accNoController.text = store.bankDetails?.accountNumber ?? '';
    _accHolderController.text = store.bankDetails?.accountHolderName ?? '';
    _radiusController.text = store.deliveryRadiusKm.toString();
    _minOrderController.text = store.minOrderAmount.toString();
    _deliveryFeeController.text = store.deliveryFee.toString();
    _isDeliveryAvailable = store.isDeliveryAvailable;
    _selectedCategories = List.from(store.categories);
    if (store.businessHours.isNotEmpty) {
      _businessHours = List.from(store.businessHours);
    }

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
    _shopNoController.dispose();
    _buildingController.dispose();
    _streetController.dispose();
    _cityController.dispose();
    _stateController.dispose();
    _zipController.dispose();
    _landmarkController.dispose();
    _instaController.dispose();
    _whatsappController.dispose();
    _gstController.dispose();
    _fssaiController.dispose();
    _ifscController.dispose();
    _accNoController.dispose();
    _accHolderController.dispose();
    _radiusController.dispose();
    _minOrderController.dispose();
    _deliveryFeeController.dispose();
    super.dispose();
  }

  Future<void> _pickLogo() async {
    final picked = await _picker.pickImage(source: ImageSource.gallery);
    if (picked != null) {
      setState(() => _logoFile = File(picked.path));
    }
  }

  Future<void> _pickBanner() async {
    final picked = await _picker.pickImage(source: ImageSource.gallery);
    if (picked != null) {
      setState(() => _bannerFile = File(picked.path));
    }
  }

  Future<void> _pickGallery() async {
    final picked = await _picker.pickMultiImage();
    if (picked.isNotEmpty) {
      setState(() {
        _galleryFiles.addAll(picked.map((e) => File(e.path)));
      });
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
    if (_currentPage < 6) {
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
        'social_links': {
          'instagram': _instaController.text,
          'whatsapp': _whatsappController.text,
        },
        'address': {
          'shop_number': _shopNoController.text,
          'building_name': _buildingController.text,
          'street': _streetController.text,
          'city': _cityController.text,
          'state': _stateController.text,
          'zip_code': _zipController.text,
          'landmark': _landmarkController.text,
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
        'categories': _selectedCategories,
        'business_hours': _businessHours.map((e) => {
          'day': e.day,
          'open': e.open,
          'close': e.close,
          'is_closed': e.isClosed,
        }).toList(),
        'delivery_radius_km': double.tryParse(_radiusController.text) ?? 10.0,
        'min_order_amount': double.tryParse(_minOrderController.text) ?? 0.0,
        'delivery_fee': double.tryParse(_deliveryFeeController.text) ?? 0.0,
        'is_delivery_available': _isDeliveryAvailable,
        // In real app, we'd upload files and put URLs here
        'logo_url': '',
        'banner_url': '',
        'store_images': [],
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
            value: (_currentPage + 1) / 7,
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
                  _buildSlide6(),
                  _buildSlide7(),
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
      title: 'Store Identity',
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
        _buildLabel('Business Type'),
        _buildDropdown(),
        SizedBox(height: 20.h),
        _buildLabel('Store Description (Optional)'),
        _buildTextField(
          controller: _descController,
          hint: 'Tell your customers what makes your\nstore special...',
          maxLines: 3,
        ),
        SizedBox(height: 24.h),
        _buildLabel('Store Branding'),
        Row(
          children: [
            Expanded(
              child: _buildImageUploadArea(
                label: 'Store Logo',
                file: _logoFile,
                onTap: _pickLogo,
              ),
            ),
            SizedBox(width: 16.w),
            Expanded(
              child: _buildImageUploadArea(
                label: 'Store Banner',
                file: _bannerFile,
                onTap: _pickBanner,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildSlide2() {
    return _buildSlideWrapper(
      title: 'Contact & Social',
      subtitle:
          'Provide the primary contact information and\nsocial profiles for this hub.',
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
        SizedBox(height: 24.h),
        _buildLabel('Social Presence (Optional)'),
        Row(
          children: [
            Expanded(
              child: _buildTextField(
                controller: _instaController,
                hint: 'Instagram @handle',
                prefixIcon: Icons.camera_alt_outlined,
              ),
            ),
            SizedBox(width: 16.w),
            Expanded(
              child: _buildTextField(
                controller: _whatsappController,
                hint: 'WhatsApp Number',
                prefixIcon: Icons.chat_bubble_outline,
                keyboardType: TextInputType.phone,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildSlide3() {
    return _buildSlideWrapper(
      title: 'Store Location',
      subtitle: 'This will be your pickup address for\norders and delivery.',
      children: [
        Row(
          children: [
            Expanded(
              flex: 2,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildLabel('Shop/Plot No'),
                  _buildTextField(
                    controller: _shopNoController,
                    hint: 'e.g. 102/B',
                  ),
                ],
              ),
            ),
            SizedBox(width: 16.w),
            Expanded(
              flex: 3,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildLabel('Building Name'),
                  _buildTextField(
                    controller: _buildingController,
                    hint: 'e.g. Skyline Heights',
                  ),
                ],
              ),
            ),
          ],
        ),
        SizedBox(height: 20.h),
        _buildLabel('Street Address'),
        _buildTextField(
          controller: _streetController,
          hint: 'Area, Cross Road Name',
        ),
        SizedBox(height: 20.h),
        _buildLabel('Landmark (Optional)'),
        _buildTextField(
          controller: _landmarkController,
          hint: 'e.g. Near HDFC Bank',
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
                  _buildLabel('Pincode'),
                  _buildTextField(
                    controller: _zipController,
                    hint: '6-digit code',
                    keyboardType: TextInputType.number,
                  ),
                ],
              ),
            ),
          ],
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
      title: 'Delivery & Gallery',
      subtitle: 'Set your delivery rules and showcase\nyour store with photos.',
      children: [
        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildLabel('Delivery Radius (km)'),
                  _buildTextField(
                    controller: _radiusController,
                    hint: 'e.g. 10',
                    keyboardType: TextInputType.number,
                  ),
                ],
              ),
            ),
            SizedBox(width: 16.w),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildLabel('Min Order (₹)'),
                  _buildTextField(
                    controller: _minOrderController,
                    hint: 'e.g. 100',
                    keyboardType: TextInputType.number,
                  ),
                ],
              ),
            ),
          ],
        ),
        SizedBox(height: 20.h),
        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildLabel('Delivery Fee (₹)'),
                  _buildTextField(
                    controller: _deliveryFeeController,
                    hint: 'e.g. 30',
                    keyboardType: TextInputType.number,
                  ),
                ],
              ),
            ),
            SizedBox(width: 16.w),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildLabel('Allow Delivery?'),
                  SwitchListTile(
                    value: _isDeliveryAvailable,
                    onChanged: (v) => setState(() => _isDeliveryAvailable = v),
                    activeColor: const Color(0xFFFA641E),
                    contentPadding: EdgeInsets.zero,
                    title: Text(
                      _isDeliveryAvailable ? 'Active' : 'Disabled',
                      style: TextStyle(fontSize: 14.sp),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        SizedBox(height: 24.h),
        _buildLabel('Business Categories'),
        Wrap(
          spacing: 8.w,
          runSpacing: 4.h,
          children: ['Groceries', 'Pharmacy', 'Fashion', 'Electronics', 'Home Decor', 'Food']
              .map((cat) {
            final isSelected = _selectedCategories.contains(cat);
            return FilterChip(
              label: Text(cat, style: TextStyle(fontSize: 12.sp)),
              selected: isSelected,
              onSelected: (v) {
                setState(() {
                  if (v) {
                    _selectedCategories.add(cat);
                  } else {
                    _selectedCategories.remove(cat);
                  }
                });
              },
              selectedColor: const Color(0xFFFA641E).withOpacity(0.2),
              checkmarkColor: const Color(0xFFFA641E),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20.r)),
            );
          }).toList(),
        ),
        SizedBox(height: 24.h),
        _buildLabel('Store Gallery'),
        _buildGalleryGrid(),
      ],
    );
  }

  Widget _buildSlide5() {
    return _buildSlideWrapper(
      title: 'Business Hours',
      subtitle: 'Set when your store is open and closed\nfor customers.',
      children: [
        ..._businessHours.asMap().entries.map((entry) {
          int idx = entry.key;
          var hour = entry.value;
          return Padding(
            padding: EdgeInsets.only(bottom: 12.h),
            child: Row(
              children: [
                SizedBox(
                  width: 90.w,
                  child: Text(
                    hour.day,
                    style: TextStyle(
                      fontSize: 14.sp,
                      fontWeight: FontWeight.w600,
                      color: hour.isClosed ? Colors.grey : Colors.black87,
                    ),
                  ),
                ),
                Expanded(
                  child: hour.isClosed
                      ? Text('Closed',
                          style: TextStyle(
                              fontSize: 13.sp, color: Colors.grey.shade400))
                      : Row(
                          children: [
                            _buildTimeBox(hour.open ?? '09:00', () => _selectTime(idx, true)),
                            Padding(
                              padding: EdgeInsets.symmetric(horizontal: 8.w),
                              child: Text('-', style: TextStyle(color: Colors.grey)),
                            ),
                            _buildTimeBox(hour.close ?? '21:00', () => _selectTime(idx, false)),
                          ],
                        ),
                ),
                Transform.scale(
                  scale: 0.8,
                  child: Switch(
                    value: !hour.isClosed,
                    onChanged: (v) {
                      setState(() {
                        _businessHours[idx] = hour.copyWith(isClosed: !v);
                      });
                    },
                    activeColor: const Color(0xFFFA641E),
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ],
    );
  }

  Widget _buildTimeBox(String time, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 8.h),
        decoration: BoxDecoration(
          color: Colors.grey.shade100,
          borderRadius: BorderRadius.circular(8.r),
          border: Border.all(color: Colors.grey.shade200),
        ),
        child: Text(
          time,
          style: TextStyle(fontSize: 13.sp, fontWeight: FontWeight.w500),
        ),
      ),
    );
  }

  Future<void> _selectTime(int idx, bool isOpen) async {
    final current = isOpen ? _businessHours[idx].open : _businessHours[idx].close;
    final parts = current?.split(':') ?? ['09', '00'];
    final initialTime = TimeOfDay(hour: int.parse(parts[0]), minute: int.parse(parts[1]));

    final picked = await showTimePicker(
      context: context,
      initialTime: initialTime,
      builder: (context, child) {
        return Theme(
          data: ThemeData.light().copyWith(
            colorScheme: const ColorScheme.light(primary: Color(0xFFFA641E)),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      final newTime = '${picked.hour.toString().padLeft(2, '0')}:${picked.minute.toString().padLeft(2, '0')}';
      setState(() {
        if (isOpen) {
          _businessHours[idx] = _businessHours[idx].copyWith(open: newTime);
        } else {
          _businessHours[idx] = _businessHours[idx].copyWith(close: newTime);
        }
      });
    }
  }

  Widget _buildGalleryGrid() {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 12.w,
        mainAxisSpacing: 12.w,
      ),
      itemCount: _galleryFiles.length + 1,
      itemBuilder: (context, index) {
        if (index == _galleryFiles.length) {
          return GestureDetector(
            onTap: _pickGallery,
            child: Container(
              decoration: BoxDecoration(
                color: Colors.grey.shade50,
                borderRadius: BorderRadius.circular(12.r),
                border: Border.all(color: Colors.grey.shade300, style: BorderStyle.solid),
              ),
              child: Icon(Icons.add_photo_alternate_outlined, color: Colors.grey, size: 28.sp),
            ),
          );
        }
        return Stack(
          children: [
            Positioned.fill(
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12.r),
                child: Image.file(_galleryFiles[index], fit: BoxFit.cover),
              ),
            ),
            Positioned(
              top: 4.h,
              right: 4.w,
              child: GestureDetector(
                onTap: () => setState(() => _galleryFiles.removeAt(index)),
                child: Container(
                  padding: EdgeInsets.all(4.w),
                  decoration: const BoxDecoration(color: Colors.black54, shape: BoxShape.circle),
                  child: Icon(Icons.close, color: Colors.white, size: 12.sp),
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildSlide6() {
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

  Widget _buildSlide7() {
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
    IconData? prefixIcon,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      maxLines: maxLines,
      keyboardType: keyboardType,
      validator: validator,
      style: TextStyle(fontSize: 14.sp),
      decoration: InputDecoration(
        hintText: hint,
        prefixIcon: prefixIcon != null ? Icon(prefixIcon, size: 20.sp, color: Colors.grey) : null,
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

  Widget _buildImageUploadArea({
    required String label,
    required File? file,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 100.h,
        decoration: BoxDecoration(
          color: const Color(0xFFFFF2E8),
          borderRadius: BorderRadius.circular(12.r),
          border: Border.all(
            color: const Color(0xFFFFCCAC),
            style: BorderStyle.solid,
          ),
        ),
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 12.w),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 44.w,
                height: 44.w,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(10.r),
                ),
                child: file != null
                    ? ClipRRect(
                        borderRadius: BorderRadius.circular(10.r),
                        child: Image.file(file, fit: BoxFit.cover),
                      )
                    : Icon(
                        Icons.add_a_photo_outlined,
                        color: const Color(0xFFFA641E),
                        size: 20.sp,
                      ),
              ),
              SizedBox(height: 8.h),
              Text(
                label,
                style: TextStyle(
                  fontSize: 12.sp,
                  color: const Color(0xFFFA641E),
                  fontWeight: FontWeight.bold,
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
                      _currentPage == 6 ? (widget.storeId == null ? 'Create Store' : 'Update Store') : 'Continue',
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
