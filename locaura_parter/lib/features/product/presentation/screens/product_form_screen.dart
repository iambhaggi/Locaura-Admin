import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:locaura_parter/core/extensions/context_extensions.dart';
import 'package:locaura_parter/core/utils/app_sizes.dart';
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
              SizedBox(
                width: 160,
                child: ElevatedButton.icon(
                  onPressed: _showAddVariantDialog,
                  icon: const Icon(Icons.add),
                  label: const Text('Add Variant'),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSizes.s20),
          if (variants.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 32),
              child: Center(child: Text('No child variants yet. Add one to enable pricing by size/color.')),
            ),
          ...variants.map(
            (v) => Card(
              child: ListTile(
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                onTap: () async {
                  final productId = _createdProduct?.id;
                  if (productId == null) {
                    return;
                  }

                  final variant = await ref.read(productControllerProvider.notifier).fetchVariantDetails(
                        widget.storeId,
                        productId,
                        v.id,
                      );
                  if (!mounted || variant == null) {
                    return;
                  }
                  _showVariantDetailsSheet(variant);
                },
                title: Text(v.variantLabel.isNotEmpty ? v.variantLabel : (v.sku.isNotEmpty ? v.sku : 'Variant')),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 4),
                    Text('Rs ${v.price} | Stock ${v.stockQuantity}'),
                    const SizedBox(height: 6),
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: _buildVariantMetaChips(v, compact: true),
                    ),
                  ],
                ),
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

  List<Widget> _buildVariantMetaChips(ProductVariantEntity variant, {bool compact = false}) {
    final chips = <Widget>[];

    void addChip(String label, String? value) {
      if (value == null || value.trim().isEmpty) {
        return;
      }
      chips.add(
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: Colors.grey.shade200,
            borderRadius: BorderRadius.circular(999),
          ),
          child: Text(
            '$label: $value',
            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
          ),
        ),
      );
    }

    addChip('Color', variant.color);
    addChip('Size', variant.size);
    addChip('Length', variant.length);

    if (!compact) {
      addChip('SKU', variant.sku);
      addChip('Barcode', variant.barcode);
    }

    for (final attr in variant.customVariationAttributes) {
      addChip(attr.name, attr.value);
    }

    return chips;
  }

  void _showVariantDetailsSheet(ProductVariantEntity variant) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (ctx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(AppSizes.pagePaddingH),
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    variant.variantLabel.isNotEmpty ? variant.variantLabel : 'Variant details',
                    style: context.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: AppSizes.s12),
                  if (variant.images.isNotEmpty)
                    SizedBox(
                      height: 180,
                      width: double.infinity,
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(AppSizes.radiusMd),
                        child: AppImage(
                          imageUrl: variant.images.first,
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                  if (variant.images.isNotEmpty) const SizedBox(height: AppSizes.s12),
                  Text('Price: Rs ${variant.price}', style: context.textTheme.titleMedium),
                  const SizedBox(height: 4),
                  Text('Stock Quantity: ${variant.stockQuantity}'),
                  const SizedBox(height: 4),
                  Text('Reserved Quantity: ${variant.reservedQuantity}'),
                  const SizedBox(height: 4),
                  Text('SKU: ${variant.sku}'),
                  const SizedBox(height: 4),
                  Text('Status: ${variant.isActive ? 'Active' : 'Inactive'}'),
                  const SizedBox(height: AppSizes.s12),
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: _buildVariantMetaChips(variant),
                  ),
                  const SizedBox(height: AppSizes.s16),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton(
                      onPressed: () => Navigator.of(ctx).pop(),
                      child: const Text('CLOSE'),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
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

  void _showAddVariantDialog() {
    if (_createdProduct == null) {
      context.showSnackbar('Save product first before adding variants.', isError: true);
      return;
    }

    final formKey = GlobalKey<FormState>();
    final colorController = TextEditingController();
    final sizeController = TextEditingController();
    final lengthController = TextEditingController();
    final skuController = TextEditingController();
    final priceController = TextEditingController();
    final stockController = TextEditingController(text: '0');
    final imageUrlController = TextEditingController();

    showDialog<void>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          title: const Text('Add Variant'),
          content: SingleChildScrollView(
            child: Form(
              key: formKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextFormField(
                    controller: colorController,
                    decoration: const InputDecoration(labelText: 'Color'),
                  ),
                  const SizedBox(height: 10),
                  TextFormField(
                    controller: sizeController,
                    decoration: const InputDecoration(labelText: 'Size'),
                  ),
                  const SizedBox(height: 10),
                  TextFormField(
                    controller: lengthController,
                    decoration: const InputDecoration(labelText: 'Length'),
                  ),
                  const SizedBox(height: 10),
                  TextFormField(
                    controller: skuController,
                    decoration: const InputDecoration(labelText: 'SKU (optional)'),
                  ),
                  const SizedBox(height: 10),
                  TextFormField(
                    controller: priceController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: 'Price (optional, defaults to parent)'),
                  ),
                  const SizedBox(height: 10),
                  TextFormField(
                    controller: stockController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: 'Stock Quantity'),
                    validator: (v) {
                      if (v == null || v.trim().isEmpty) {
                        return 'Required';
                      }
                      final qty = int.tryParse(v.trim());
                      if (qty == null || qty < 0) {
                        return 'Enter valid stock';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 10),
                  TextFormField(
                    controller: imageUrlController,
                    decoration: const InputDecoration(labelText: 'Image URL (optional)'),
                  ),
                ],
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(),
              child: const Text('CANCEL'),
            ),
            ElevatedButton(
              onPressed: () {
                if (!formKey.currentState!.validate()) {
                  return;
                }

                final parsedPrice = double.tryParse(priceController.text.trim());
                final variantData = <String, dynamic>{
                  if (colorController.text.trim().isNotEmpty) 'color': colorController.text.trim(),
                  if (sizeController.text.trim().isNotEmpty) 'size': sizeController.text.trim(),
                  if (lengthController.text.trim().isNotEmpty) 'length': lengthController.text.trim(),
                  if (skuController.text.trim().isNotEmpty) 'sku': skuController.text.trim(),
                  if (parsedPrice != null) 'price': parsedPrice,
                  'stock_quantity': int.parse(stockController.text.trim()),
                  if (imageUrlController.text.trim().isNotEmpty) 'images': [imageUrlController.text.trim()],
                };

                ref.read(productControllerProvider.notifier).addVariant(
                      widget.storeId,
                      _createdProduct!.id,
                      variantData,
                    );

                Navigator.of(dialogContext).pop();
              },
              child: const Text('ADD'),
            ),
          ],
        );
      },
    );
  }

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
    final isActive = currentIndex == index;

    return Column(
      children: [
        CircleAvatar(
          radius: 12,
          backgroundColor: isActive ? context.colorScheme.primary : Colors.grey.shade300,
          child: Text(
            '${index + 1}',
            style: const TextStyle(fontSize: 12, color: Colors.white),
          ),
        ),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(fontSize: 10)),
      ],
    );
  }
}


