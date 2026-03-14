import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:locaura_parter/core/extensions/context_extensions.dart';
import 'package:locaura_parter/core/utils/app_sizes.dart';
import 'package:locaura_parter/core/utils/app_feedback.dart';
import 'package:locaura_parter/core/widgets/common/app_image.dart';
import '../controllers/product_controller.dart';
import '../../domain/entities/product.entity.dart';

class ProductFormScreen extends ConsumerStatefulWidget {
  final String storeId;
  final String? productId;

  const ProductFormScreen({
    super.key,
    required this.storeId,
    this.productId,
  });

  @override
  ConsumerState<ProductFormScreen> createState() => _ProductFormScreenState();
}

class _ProductFormScreenState extends ConsumerState<ProductFormScreen> {
  final _pageController = PageController();
  final _formKey = GlobalKey<FormState>();

  int _currentPage = 0;

  final _nameController = TextEditingController();
  final _brandController = TextEditingController();
  final _descController = TextEditingController();
  final _priceController = TextEditingController();

  String? _selectedGender;
  final List<String> _genders = ['men', 'women', 'unisex', 'kids', 'boys', 'girls'];

  ProductEntity? _createdProduct;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (widget.productId != null) {
        ref.read(productControllerProvider.notifier).fetchProductDetails(
              widget.storeId,
              widget.productId!,
            );
      }
    });
  }

  @override
  void dispose() {
    _pageController.dispose();
    _nameController.dispose();
    _brandController.dispose();
    _descController.dispose();
    _priceController.dispose();
    super.dispose();
  }

  void _prefillFromProduct(ProductEntity product) {
    _createdProduct = product;
    _nameController.text = product.name;
    _brandController.text = product.brand ?? '';
    _descController.text = product.description ?? '';
    _priceController.text = product.basePrice.toString();
    _selectedGender = product.gender;

    ref.read(productControllerProvider.notifier).fetchVariants(
          widget.storeId,
          product.id,
        );

    setState(() {});
  }

  void _moveToVariantsStep() {
    if (!_pageController.hasClients || _currentPage == 1) {
      return;
    }

    _pageController.nextPage(
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(productControllerProvider);

    ref.listen(productControllerProvider, (previous, next) {
      next.maybeWhen(
        productCreated: (product) {
          setState(() => _createdProduct = product);
          context.showSnackbar('Product created! Now add variations.');
          ref.read(productControllerProvider.notifier).fetchVariants(widget.storeId, product.id);
          _moveToVariantsStep();
        },
        productUpdated: (product) {
          setState(() => _createdProduct = product);
          context.showSnackbar('Product updated.');
          ref.read(productControllerProvider.notifier).fetchVariants(widget.storeId, product.id);
          _moveToVariantsStep();
        },
        productLoaded: (product) {
          _prefillFromProduct(product);
        },
        variantCreated: (_) => context.showSnackbar('Variation added.'),
        variantUpdated: (_) => context.showSnackbar('Variation updated.'),
        variantDeleted: () => context.showSnackbar('Variation deleted.'),
        error: (msg) => context.showSnackbar(msg, isError: true),
        orElse: () {},
      );
    });

    final isLoading = state.maybeWhen(
      loading: () => true,
      orElse: () => false,
    );

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.productId == null ? 'Add New Product' : 'Edit Product'),
      ),
      body: Stack(
        children: [
          Column(
            children: [
              _buildStepper(),
              Expanded(
                child: PageView(
                  controller: _pageController,
                  physics: const NeverScrollableScrollPhysics(),
                  onPageChanged: (page) => setState(() => _currentPage = page),
                  children: [
                    _buildBasicInfoStep(),
                    _buildVariantsStep(),
                  ],
                ),
              ),
            ],
          ),
          if (isLoading)
            const Center(
              child: CircularProgressIndicator(),
            )
        ],
      ),
    );
  }

  Widget _buildStepper() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 20),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          _StepIcon(index: 0, currentIndex: _currentPage, label: 'Basic Info'),
          Container(
            width: 50,
            height: 2,
            margin: const EdgeInsets.symmetric(horizontal: 8),
            color: _currentPage > 0 ? context.colorScheme.primary : Colors.grey.shade300,
          ),
          GestureDetector(
            onTap: _createdProduct == null
                ? null
                : () {
                    _pageController.animateToPage(
                      1,
                      duration: const Duration(milliseconds: 300),
                      curve: Curves.easeInOut,
                    );
                  },
            child: _StepIcon(index: 1, currentIndex: _currentPage, label: 'Variations'),
          ),
        ],
      ),
    );
  }

  Widget _buildBasicInfoStep() {
    return Form(
      key: _formKey,
      child: ListView(
        padding: const EdgeInsets.all(AppSizes.pagePaddingH),
        children: [
          Text(
            'General Information',
            style: context.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: AppSizes.s20),

          TextFormField(
            controller: _nameController,
            decoration: const InputDecoration(labelText: 'Product Name'),
            validator: (v) => v == null || v.isEmpty ? 'Required' : null,
          ),

          const SizedBox(height: AppSizes.s16),

          TextFormField(
            controller: _brandController,
            decoration: const InputDecoration(labelText: 'Brand'),
          ),

          const SizedBox(height: AppSizes.s16),

          TextFormField(
            controller: _descController,
            maxLines: 3,
            decoration: const InputDecoration(labelText: 'Description'),
          ),

          const SizedBox(height: AppSizes.s16),

          TextFormField(
            controller: _priceController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'Base Price',
              prefixText: 'Rs ',
            ),
            validator: (v) => v == null || v.isEmpty ? 'Required' : null,
          ),

          const SizedBox(height: AppSizes.s16),

          DropdownButtonFormField<String>(
            value: _selectedGender,
            items: _genders
                .map((g) => DropdownMenuItem(
                      value: g,
                      child: Text(g),
                    ))
                .toList(),
            onChanged: (v) => setState(() => _selectedGender = v),
            decoration: const InputDecoration(labelText: 'Gender'),
          ),

          const SizedBox(height: AppSizes.s32),

          ElevatedButton(
            onPressed: () {
              if (_formKey.currentState!.validate()) {
                _saveBasicInfo();
              }
            },
            child: Text(widget.productId == null ? 'SAVE & CONTINUE' : 'UPDATE & CONTINUE'),
          ),
        ],
      ),
    );
  }

  Widget _buildVariantsStep() {
    if (_createdProduct == null) {
      return const Center(child: Text('Please save basic info first'));
    }

    final state = ref.watch(productControllerProvider);

    return state.maybeWhen(
      variantsLoaded: (variants) => ListView(
        padding: const EdgeInsets.all(AppSizes.pagePaddingH),
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Variations', style: context.textTheme.titleLarge),
              ElevatedButton.icon(
                onPressed: _showAddVariantDialog,
                icon: const Icon(Icons.add),
                label: const Text('Add Variant'),
              ),
            ],
          ),
          const SizedBox(height: AppSizes.s20),
          ...variants.map(
            (v) => Card(
              child: ListTile(
                title: Text(v.variantLabel ?? '${v.color ?? ''} / ${v.size ?? ''}'),
                subtitle: Text('Rs ${v.price} | Stock ${v.stockQuantity}'),
                trailing: IconButton(
                  icon: const Icon(Icons.delete_outline, color: Colors.red),
                  onPressed: () => _showDeleteVariantConfirmation(v),
                ),
              ),
            ),
          ),
          const SizedBox(height: AppSizes.s20),
          OutlinedButton(
            onPressed: () => context.pop(),
            child: const Text('FINISH'),
          ),
        ],
      ),
      loading: () => const Center(child: CircularProgressIndicator()),
      orElse: () {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (!mounted || _createdProduct == null) {
            return;
          }
          ref.read(productControllerProvider.notifier).fetchVariants(
                widget.storeId,
                _createdProduct!.id,
              );
        });
        return const Center(child: CircularProgressIndicator());
      },
    );
  }

  void _saveBasicInfo() {
    final price = double.tryParse(_priceController.text.trim()) ?? 0;
    final isEditMode = widget.productId != null;

    if (isEditMode) {
      final productId = widget.productId ?? _createdProduct?.id;
      if (productId == null) {
        context.showSnackbar('Unable to update product: missing product id', isError: true);
        return;
      }

      ref.read(productControllerProvider.notifier).updateExistingProduct(
            widget.storeId,
            productId,
            {
              'name': _nameController.text,
              'brand': _brandController.text,
              'description': _descController.text,
              'base_price': price,
              'gender': _selectedGender,
            },
          );
      return;
    }

    ref.read(productControllerProvider.notifier).createNewProduct(
          widget.storeId,
          name: _nameController.text,
          brand: _brandController.text,
          description: _descController.text,
          basePrice: price,
          categories: [],
          productAttributes: [],
          coverImages: [],
          gender: _selectedGender,
          tags: [],
        );
  }

  void _showAddVariantDialog() {}

  void _showDeleteVariantConfirmation(ProductVariantEntity variant) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Variation'),
        content: Text('Delete "${variant.variantLabel}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('CANCEL'),
          ),
          TextButton(
            onPressed: () {
              ref.read(productControllerProvider.notifier).deleteExistingVariant(
                    widget.storeId,
                    _createdProduct!.id,
                    variant.id,
                  );
              Navigator.pop(context);
            },
            child: const Text('DELETE', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }
}

class _StepIcon extends StatelessWidget {
  final int index;
  final int currentIndex;
  final String label;

  const _StepIcon({
    required this.index,
    required this.currentIndex,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    bool isActive = currentIndex == index;

    return Column(
      children: [
        CircleAvatar(
          radius: 12,
          backgroundColor:
              isActive ? context.colorScheme.primary : Colors.grey.shade300,
          child: Text('${index + 1}',
              style: const TextStyle(fontSize: 12, color: Colors.white)),
        ),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(fontSize: 10)),
      ],
    );
  }
}


