import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:locaura_parter/core/extensions/context_extensions.dart';
import 'package:locaura_parter/core/utils/app_sizes.dart';
import 'package:locaura_parter/features/store/domain/entities/store.entity.dart';
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

  
  // Form Controllers (Empty by default)
  final _nameController = TextEditingController();
  final _descController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _retailerNameController = TextEditingController();
  final _streetController = TextEditingController();
  final _cityController = TextEditingController();
  final _stateController = TextEditingController();
  final _zipController = TextEditingController();
  final _panController = TextEditingController();
  final _gstController = TextEditingController();
  final _ifscController = TextEditingController();
  final _accNoController = TextEditingController();
  final _accHolderController = TextEditingController();
  // "Individual"|"Partnership"|"Private Limited"|"Public Limited"
  List<String> _businessTypes = [
    "Individual",
    "Partnership",
    "Private Limited",
    "Public Limited"
  ];

  String _businessType = "Individual";

  @override
  void initState() {
    super.initState();
    _businessType = _businessTypes.first;
    
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (widget.storeId != null) {
        // Log 
        Logger().i('Store ID: ${widget.storeId}');
        ref.read(storeControllerProvider.notifier).fetchStoreDetails(widget.storeId!);
      } else {
        // Option to prefill for dev testing only in create mode
        // Form Controllers (Prefilled with test data for dev purpose)
        _nameController.text = 'Urban Threads Boutique';
        _descController.text = 'Premium casual wear and trendy outfits for men and women.';
        _phoneController.text = '9876543210';
        _emailController.text = 'rahul.sharma@example.com';
        _retailerNameController.text = 'Rahul Sharma';
        _streetController.text = '100ft Ring Road';
        _cityController.text = 'Bangalore';
        _stateController.text = 'Karnataka';
        _zipController.text = '560034';
        _panController.text = 'ABCDE1234F';
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
    _descController.text = store.description??'';
    _phoneController.text = store.retailerPhone;
    _emailController.text = store.retailerEmail;
    _retailerNameController.text = store.retailerName;
    _streetController.text = store.address?.street??'';
    _cityController.text = store.address?.city??'';
    _stateController.text = store.address?.state??'';
    _zipController.text = store.address?.zipCode??'';
    _panController.text = store.panCard??'';
    _gstController.text = store.gstin??'';
    _ifscController.text = store.bankDetails?.ifscCode??'';
    _accNoController.text = store.bankDetails?.accountNumber??'';
    _accHolderController.text = store.bankDetails?.accountHolderName??'';
    _businessType = store.businessType??_businessTypes.first;
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
    _panController.dispose();
    _gstController.dispose();
    _ifscController.dispose();
    _accNoController.dispose();
    _accHolderController.dispose();
    super.dispose();
  }

  void _nextPage() {
    if (_currentPage < 4) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    } else {
      _submit();
    }
  }

  void _prevPage() {
    if (_currentPage > 0) {
      _pageController.previousPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
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
        'pan_card': _panController.text,
        'gstin': _gstController.text,
        'bank_details': {
          'account_number': _accNoController.text,
          'ifsc_code': _ifscController.text,
          'account_holder_name': _accHolderController.text,
        },
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
          context.showSnackbar('Store registered successfully!');
          context.pop();
        },
        storeUpdated: (_) {
          context.showSnackbar('Store updated successfully!');
          context.pop();
        },
        storeLoaded: (store) {
          _prefillFromStore(store);
        },
        error: (msg) => context.showSnackbar(msg, isError: true),
        orElse: () {},
      );
    });

    final isLoading = ref
        .watch(storeControllerProvider)
        .maybeWhen(loading: () => true, orElse: () => false);

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.storeId == null ? 'Register Store' : 'Edit Store'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(4),
          child: SizedBox(
            height: 4,
            child: LinearProgressIndicator(
              value: (_currentPage + 1) / 5,
              backgroundColor: context.colorScheme.surfaceContainerHighest,
            ),
          ),
        ),
      ),
      body: Form(
        key: _formKey,
        child: PageView(
          controller: _pageController,
          physics: const NeverScrollableScrollPhysics(),
          onPageChanged: (page) => setState(() => _currentPage = page),
          children: [
            _buildIdentityStep(),
            _buildLocationStep(),
            _buildContactStep(),
            _buildComplianceStep(),
            _buildSettlementStep(),
          ],
        ),
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSizes.pagePaddingH),
          child: Row(
            children: [
              if (_currentPage > 0)
                TextButton(
                  onPressed: isLoading ? null : _prevPage,
                  child: const Text('BACK'),
                )
              else
                const SizedBox(width: 72),

              const Spacer(),

              ElevatedButton(
                onPressed: isLoading ? null : _nextPage,
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(0, 52),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 32,
                    vertical: 12,
                  ),
                ),
                child: isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : Text(_currentPage == 4 ? 'SUBMIT' : 'NEXT'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildIdentityStep() {
    return _StepWrapper(
      title: 'Store Identity',
      subtitle: 'Tell us about your store name and type.',
      children: [
        _buildTextField(
          controller: _nameController,
          label: 'Store Name',
          hint: 'e.g. Locaura Trends',
          helper: 'Make it catchy! Customers will see this name.',
          prefixIcon: Icons.store_outlined,
          validator: (v) => v?.isEmpty ?? true ? 'Name is required' : null,
        ),
        const SizedBox(height: AppSizes.s24),
        DropdownButtonFormField<String>(
          value: _businessType,
          decoration: const InputDecoration(
            labelText: 'Business Type',
            prefixIcon: Icon(Icons.category_outlined),
          ),
          items: _businessTypes.map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
          onChanged: (v) => setState(() => _businessType = v!),
        ),
        const SizedBox(height: AppSizes.s24),
        _buildTextField(
          controller: _descController,
          label: 'Description',
          hint: 'e.g. Best ethnic wear boutique in Hitech City.',
          maxLines: 3,
        ),
      ],
    );
  }

  Widget _buildLocationStep() {
    return _StepWrapper(
      title: 'Store Location',
      subtitle: 'Where can customers find you?',
      children: [
        _buildTextField(
          controller: _streetController,
          label: 'Street Address',
          hint: 'Plot No. 42, Jubilee Hills',
          prefixIcon: Icons.location_on_outlined,
          validator: (v) => v?.isEmpty ?? true ? 'Address is required' : null,
        ),
        const SizedBox(height: AppSizes.s20),
        Row(
          children: [
            Expanded(
              child: _buildTextField(
                controller: _cityController,
                label: 'City',
                hint: 'Hyderabad',
                validator: (v) => v?.isEmpty ?? true ? 'Required' : null,
              ),
            ),
            const SizedBox(width: AppSizes.s16),
            Expanded(
              child: _buildTextField(
                controller: _stateController,
                label: 'State',
                hint: 'Telangana',
                validator: (v) => v?.isEmpty ?? true ? 'Required' : null,
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSizes.s20),
        _buildTextField(
          controller: _zipController,
          label: 'ZIP Code',
          hint: '500081',
          validator: (v) => v?.isEmpty ?? true ? 'Required' : null,
        ),
      ],
    );
  }

  Widget _buildContactStep() {
    return _StepWrapper(
      title: 'Contact Details',
      subtitle: 'How can we and your customers reach you?',
      children: [
        _buildTextField(
          controller: _retailerNameController,
          label: 'Retailer Name',
          hint: 'Full Name',
          prefixIcon: Icons.person_outline,
          validator: (v) => v?.isEmpty ?? true ? 'Name is required' : null,
        ),
        const SizedBox(height: AppSizes.s24),
        _buildTextField(
          controller: _phoneController,
          label: 'Store Phone',
          hint: '9876543210',
          prefixIcon: Icons.phone_outlined,
          keyboardType: TextInputType.phone,
          validator: (v) => v?.isEmpty ?? true ? 'Phone is required' : null,
        ),
        const SizedBox(height: AppSizes.s24),
        _buildTextField(
          controller: _emailController,
          label: 'Store Email',
          hint: 'contact@store.com',
          prefixIcon: Icons.email_outlined,
          keyboardType: TextInputType.emailAddress,
          validator: (v) => v?.isEmpty ?? true ? 'Email is required' : null,
        ),
      ],
    );
  }

  Widget _buildComplianceStep() {
    return _StepWrapper(
      title: 'Compliance',
      subtitle: 'Tax and identity information.',
      children: [
        _buildTextField(
          controller: _panController,
          label: 'PAN Card (Optional)',
          hint: 'ABCDE1234F',
          helper: '10-digit alphanumeric permanent account number.',
          prefixIcon: Icons.badge_outlined,
        ),
        const SizedBox(height: AppSizes.s24),
        _buildTextField(
          controller: _gstController,
          label: 'GSTIN (Optional)',
          hint: '22AAAAA0000A1Z5',
          prefixIcon: Icons.assignment_outlined,
        ),
      ],
    );
  }

  Widget _buildSettlementStep() {
    return _StepWrapper(
      title: 'Settlement Account',
      subtitle: 'Where should we send your payouts?',
      children: [
        _buildTextField(
          controller: _accHolderController,
          label: 'Account Holder Name (Optional)',
          prefixIcon: Icons.account_box_outlined,
        ),
        const SizedBox(height: AppSizes.s24),
        _buildTextField(
          controller: _accNoController,
          label: 'Account Number (Optional)',
          prefixIcon: Icons.account_balance_outlined,
        ),
        const SizedBox(height: AppSizes.s24),
        _buildTextField(
          controller: _ifscController,
          label: 'IFSC Code (Optional)',
          hint: 'SBIN0001234',
          prefixIcon: Icons.code,
        ),
      ],
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    String? hint,
    String? helper,
    IconData? prefixIcon,
    TextInputType? keyboardType,
    int maxLines = 1,
    String? Function(String?)? validator,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          maxLines: maxLines,
          validator: validator,
          decoration: InputDecoration(
            labelText: label,
            hintText: hint,
            prefixIcon: prefixIcon != null ? Icon(prefixIcon) : null,
            alignLabelWithHint: maxLines > 1,
          ),
        ),
        if (helper != null)
          Padding(
            padding: const EdgeInsets.only(top: 4, left: 12),
            child: Text(
              helper,
              style: context.textTheme.bodySmall?.copyWith(color: Colors.grey),
            ),
          ),
      ],
    );
  }
}

class _StepWrapper extends StatelessWidget {
  final String title;
  final String subtitle;
  final List<Widget> children;

  const _StepWrapper({
    required this.title,
    required this.subtitle,
    required this.children,
  });

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(AppSizes.pagePaddingH),
      children: [
        Text(title, style: context.textTheme.headlineSmall),
        const SizedBox(height: 8),
        Text(
          subtitle,
          style: context.textTheme.bodyMedium?.copyWith(color: Colors.grey),
        ),
        const SizedBox(height: AppSizes.s32),
        ...children,
      ],
    );
  }
}
