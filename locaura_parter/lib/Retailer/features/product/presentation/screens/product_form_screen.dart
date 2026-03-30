import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:locaura_parter/core/extensions/context_extensions.dart';
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
  final _formKey = GlobalKey<FormState>();

  final _brandController = TextEditingController();
  final _nameController = TextEditingController();
  final _descController = TextEditingController();
  final _regPriceController = TextEditingController();
  final _discPriceController = TextEditingController();

  final List<String> _categories = ['Clothing','Beauty','Accessories'];
  String? _selectedCategory= "Clothing";

  final List<String> _availableSizes = ['S', 'M', 'L', 'XL', 'XXL'];
  final Set<String> _selectedSizes = {};

  final List<Map<String, dynamic>> _availableColors = [
    {'name': 'Black', 'color': Colors.black},
    {'name': 'Navy', 'color': const Color(0xFF1E3A8A)},
    {'name': 'Brown', 'color': const Color(0xFF5D4037)},
    {'name': 'Gold', 'color': const Color(0xFFFFD700)},
    {'name': 'White', 'color': Colors.white},
  ];
  final Set<String> _selectedColors = {};

  bool _trackInventory = true;
  bool _isSaving = false;
  List<String> _uploadedImageUrls = [];
  final Map<String, VariantRowData> _variantRows = {};

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      if (widget.productId != null) {
        // Try to find product in current list state first for instant prefill
        final currentState = ref.read(productControllerProvider);
        currentState.maybeWhen(
          success: (products) {
            ProductEntity? existing;
            for (final p in products) {
              if (p.id == widget.productId) {
                existing = p;
                break;
              }
            }
            if (existing != null) {
              _prefillFromProduct(existing);
            }
          },
          orElse: () {},
        );

        // Fetch fresh details and variants sequentially to avoid state overwriting
        // since both fire loading() and overwrite the single state object.
        final productData = await ref.read(productControllerProvider.notifier).getProductDetailsData(
              widget.storeId,
              widget.productId!,
            );
        if (mounted && productData != null) {
          _prefillFromProduct(productData);
        }
        
        if (mounted) {
          final variantsData = await ref.read(productControllerProvider.notifier).getProductVariantsData(
                widget.storeId,
                widget.productId!,
              );
          if (mounted && variantsData != null) {
             _prefillVariants(variantsData);
          }
        }
      }
    });
  }

  @override
  void dispose() {
    _brandController.dispose();
    _nameController.dispose();
    _descController.dispose();
    _regPriceController.dispose();
    _discPriceController.dispose();
    for (final row in _variantRows.values) {
      row.dispose();
    }
    super.dispose();
  }

  void _prefillFromProduct(ProductEntity product) {
    _brandController.text = product.brand ?? '';
    _nameController.text = product.name;
    _descController.text = product.description ?? '';
    _regPriceController.text = product.basePrice.toString();
    _discPriceController.text = (product.baseCompareAtPrice ?? '').toString();
    
    if (product.categories.isNotEmpty) {
      if (_categories.contains(product.categories.first)) {
        _selectedCategory = product.categories.first;
      }
    }
    _uploadedImageUrls = List.from(product.coverImages);
    setState(() {});
  }

  void _updateVariationsMatrix() {
    final List<String> colors = _selectedColors.isEmpty ? [''] : _selectedColors.toList();
    final List<String> sizes = _selectedSizes.isEmpty ? [''] : _selectedSizes.toList();

    final Set<String> newKeys = {};
    for (final c in colors) {
      for (final s in sizes) {
        if (c.isEmpty && s.isEmpty) continue; // Skip empty row if nothing selected
        final key = '${c}_$s';
        newKeys.add(key);
        if (!_variantRows.containsKey(key)) {
          _variantRows[key] = VariantRowData(
            color: c.isEmpty ? null : c,
            size: s.isEmpty ? null : s,
            price: _regPriceController.text.isNotEmpty ? _regPriceController.text : '',
            stock: '1',
            sku: '',
          );
        }
      }
    }

    _variantRows.removeWhere((key, row) {
      if (!newKeys.contains(key)) {
        row.dispose();
        return true;
      }
      return false;
    });
  }

  void _prefillVariants(List<ProductVariantEntity> variants) {
    if (variants.isEmpty) return;
    for (var v in variants) {
      if (v.size != null && v.size!.isNotEmpty) _selectedSizes.add(v.size!);
      if (v.color != null && v.color!.isNotEmpty) _selectedColors.add(v.color!);
      
      final c = v.color ?? '';
      final s = v.size ?? '';
      final key = '${c}_$s';
      
      _variantRows[key] = VariantRowData(
        id: v.id,
        color: c.isEmpty ? null : c,
        size: s.isEmpty ? null : s,
        price: v.price.toString(),
        stock: v.stockQuantity.toString(),
        sku: v.sku,
      );
    }
    // ensure any missing permutations are generated
    _updateVariationsMatrix(); 
    setState(() {});
  }

  void _saveChanges() async {
    if (!_formKey.currentState!.validate()) return;

    final priceStr = _regPriceController.text.trim();
    final comparePriceStr = _discPriceController.text.trim();

    if (priceStr.isEmpty) {
       context.showSnackbar('Please enter a Selling Price', isError: true);
       return;
    }

    final price = double.tryParse(priceStr) ?? 0;
    final comparePrice = double.tryParse(comparePriceStr);

    if (price <= 0) {
       context.showSnackbar('Selling Price must be greater than 0', isError: true);
       return;
    }

    if (comparePrice != null) {
       if (comparePrice <= price) {
          context.showSnackbar('Original Price must be strictly greater than Selling Price', isError: true);
          return;
       }
    }

    if (_selectedSizes.isNotEmpty || _selectedColors.isNotEmpty) {
       if (_variantRows.isEmpty) return; // Should not happen
       for (final row in _variantRows.values) {
          if (row.priceController.text.isEmpty || row.stockController.text.isEmpty) {
             context.showSnackbar('Please fill all price and stock fields for variations', isError: true);
             return;
          }
          final p = double.tryParse(row.priceController.text.trim()) ?? 0;
          final s = int.tryParse(row.stockController.text.trim()) ?? -1;
          if (p <= 0) {
             context.showSnackbar('All variation prices must be greater than 0', isError: true);
             return;
          }
          if (s < 0) {
             context.showSnackbar('Stock cannot be negative', isError: true);
             return;
          }
       }
    }

    setState(() => _isSaving = true);
    
    final notifier = ref.read(productControllerProvider.notifier);

    ProductEntity? savedProduct;

    if (widget.productId != null) {
      // Update parent product
      savedProduct = await notifier.updateProductData(
            widget.storeId,
            widget.productId!,
            {
              'brand': _brandController.text.trim(),
              'name': _nameController.text.trim(),
              'description': _descController.text.trim(),
              'base_price': price,
              'base_compare_at_price': comparePrice,
              'categories': _selectedCategory != null ? [_selectedCategory] : [],
              'cover_images': _uploadedImageUrls,
            },
          );
    } else {
      // Create new product
      savedProduct = await notifier.createProductData(
            widget.storeId,
            name: _nameController.text.trim(),
            brand: _brandController.text.trim(),
            description: _descController.text.trim(),
            basePrice: price,
            categories: _selectedCategory != null ? [_selectedCategory!] : [],
            productAttributes: [],
            coverImages: _uploadedImageUrls,
            gender: null,
            tags: [],
          );
    }

    if (savedProduct != null && _variantRows.isNotEmpty) {
      // Create or update child variants
      for (final row in _variantRows.values) {
        final variantData = {
          'color': row.color,
          'size': row.size,
          'sku': row.skuController.text.trim().isNotEmpty 
              ? row.skuController.text.trim()
              : '${savedProduct.slug ?? 'v'}-${row.color ?? 'x'}-${row.size ?? 'x'}', // fallback sku
          'price': double.tryParse(row.priceController.text.trim()) ?? price,
          'stock_quantity': int.tryParse(row.stockController.text.trim()) ?? 0,
        };

        if (row.id != null) {
          await notifier.updateVariantData(widget.storeId, savedProduct.id, row.id!, variantData);
        } else {
          await notifier.createVariantData(widget.storeId, savedProduct.id, variantData);
        }
      }
    }

    if (mounted) {
      setState(() => _isSaving = false);
      if (widget.productId == null) context.showSnackbar('Product created!');
      else context.showSnackbar('Product updated!');
      context.pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(productControllerProvider);

    ref.listen(productControllerProvider, (previous, next) {
      next.maybeWhen(
        productCreated: (p) => context.showSnackbar('Product created!'),
        productUpdated: (p) => context.showSnackbar('Product updated!'),
        imageUploaded: (url) {
          setState(() => _uploadedImageUrls.add(url));
          context.showSnackbar('Image uploaded successfully!');
        },
        error: (msg) => context.showSnackbar(msg, isError: true),
        orElse: () {},
      );
    });

    final isLoading = state.maybeWhen(loading: () => true, orElse: () => false);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: _buildAppBar(),
      body: Stack(
        children: [
          Form(
            key: _formKey,
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              children: [
                _buildImageSection(state),
                const SizedBox(height: 24),
                _buildTextField('Brand Name', 'Roadster', _brandController),
                const SizedBox(height: 16),
                _buildTextField('Product Name', 'Roadster white shirt', _nameController),
                const SizedBox(height: 16),
                _buildCategoryDropdown(),
                const SizedBox(height: 24),
                _buildSizeSelector(),
                const SizedBox(height: 24),
                _buildColorSelector(),
                const SizedBox(height: 24),
                _buildTextField(
                  'Product Description',
                  'White solid regular-fit shirt...',
                  _descController,
                  maxLines: 4,
                ),
                const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(child: _buildTextField('Selling Price', '400', _regPriceController, prefixText: 'Rs. ')),
                      const SizedBox(width: 16),
                      Expanded(child: _buildTextField('Original Price (optional)', '500', _discPriceController, prefixText: 'Rs. ')),
                    ],
                  ),
                const SizedBox(height: 24),
                _buildInventoryToggle(),
                const SizedBox(height: 24),
                _buildVariationsMatrix(),
                const SizedBox(height: 100), // Space for bottom buttons
              ],
            ),
          ),
          if (isLoading || _isSaving) const Center(child: CircularProgressIndicator()),
        ],
      ),
      bottomSheet: _buildBottomActions(),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: Colors.white,
      elevation: 0,
      centerTitle: false,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back_ios_new, color: Colors.black, size: 20),
        onPressed: () => context.pop(),
      ),
      title: const Text(
        'Edit Product',
        style: TextStyle(color: Colors.black, fontSize: 18, fontWeight: FontWeight.bold),
      ),
      actions: [
        TextButton(
          onPressed: () {},
          child: const Text('Preview', style: TextStyle(color: Color(0xFF1976D2), fontSize: 14)),
        ),
        const SizedBox(width: 8),
      ],
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(1),
        child: Container(color: Colors.grey.shade200, height: 1),
      ),
    );
  }

  Widget _buildImageSection(ProductState state) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Product Images', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.black87)),
        const SizedBox(height: 12),
        SizedBox(
          height: 120,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: _uploadedImageUrls.length + 1,
            itemBuilder: (context, index) {
              if (index == _uploadedImageUrls.length) {
                // Add Image Button
                return GestureDetector(
                  onTap: () async {
                    await ref.read(productControllerProvider.notifier).pickAndUploadImage();
                  },
                  child: Container(
                    width: 100,
                    margin: const EdgeInsets.only(right: 12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF4F8FB),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFB3D4FF), width: 1.5, style: BorderStyle.solid),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        state.maybeWhen(
                          imageUploading: () => const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF1976D2)),
                          ),
                          orElse: () => const Icon(Icons.add_a_photo_outlined, color: Color(0xFF1976D2), size: 24),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          state.maybeWhen(
                            imageUploading: () => 'Uploading...',
                            orElse: () => 'Add',
                          ),
                          style: const TextStyle(color: Color(0xFF1976D2), fontSize: 12, fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                  ),
                );
              }

              final url = _uploadedImageUrls[index];
              return Stack(
                children: [
                  Container(
                    width: 100,
                    margin: const EdgeInsets.only(right: 12),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.grey.shade200),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: AppImage(imageUrl: url, fit: BoxFit.cover),
                    ),
                  ),
                  Positioned(
                    top: 4,
                    right: 16,
                    child: GestureDetector(
                      onTap: () => setState(() => _uploadedImageUrls.removeAt(index)),
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(
                          color: Colors.black54,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.close, color: Colors.white, size: 14),
                      ),
                    ),
                  ),
                ],
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildTextField(String label, String hint, TextEditingController controller, {int maxLines = 1, String? prefixText}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.black87)),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          maxLines: maxLines,
          keyboardType: prefixText != null ? TextInputType.number : TextInputType.text,
          validator: (v) => v == null || v.isEmpty ? 'Required' : null,
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 14),
            prefixText: prefixText,
            prefixStyle: const TextStyle(color: Colors.black54, fontSize: 14),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: Colors.grey.shade300)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: Colors.grey.shade300)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFF1976D2))),
          ),
        ),
      ],
    );
  }

  Widget _buildCategoryDropdown() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Category', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.black87)),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          initialValue: _selectedCategory,
          items: _categories.map((c) => DropdownMenuItem(value: c, child: Text(c, style: const TextStyle(fontSize: 14)))).toList(),
          onChanged: (v) => setState(() => _selectedCategory = v),
          decoration: InputDecoration(
            hintText: 'Select category',
            hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 14),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: Colors.grey.shade300)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: Colors.grey.shade300)),
          ),
          icon: const Icon(Icons.keyboard_arrow_down, color: Colors.grey),
        ),
      ],
    );
  }

  Widget _buildSizeSelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Select Size', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.black87)),
        const SizedBox(height: 12),
        Row(
          children: _availableSizes.map((size) {
            final isSelected = _selectedSizes.contains(size);
            return GestureDetector(
              onTap: () {
                setState(() {
                  isSelected ? _selectedSizes.remove(size) : _selectedSizes.add(size);
                  _updateVariationsMatrix();
                });
              },
              child: Container(
                margin: const EdgeInsets.only(right: 12),
                width: 40,
                height: 40,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: isSelected ? const Color(0xFF1976D2) : Colors.grey.shade300,
                    width: isSelected ? 1.5 : 1,
                  ),
                  color: Colors.white,
                ),
                child: Text(
                  size,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                    color: isSelected ? const Color(0xFF1976D2) : Colors.black87,
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildColorSelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Select Color', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.black87)),
        const SizedBox(height: 12),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: _availableColors.map((colorMap) {
            final name = colorMap['name'] as String;
            final colorValue = colorMap['color'] as Color;
            final isSelected = _selectedColors.contains(name);
            final isWhite = colorValue == Colors.white;

            return GestureDetector(
              onTap: () {
                setState(() {
                  isSelected ? _selectedColors.remove(name) : _selectedColors.add(name);
                  _updateVariationsMatrix();
                });
              },
              child: Column(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: isSelected ? const Color(0xFF1976D2) : (isWhite ? Colors.grey.shade300 : Colors.transparent),
                        width: isSelected ? 2 : 1,
                      ),
                    ),
                    padding: const EdgeInsets.all(2),
                    child: Container(
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: colorValue,
                        border: isWhite ? Border.all(color: Colors.grey.shade300) : null,
                      ),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    name,
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                      color: isSelected ? const Color(0xFF1976D2) : Colors.grey.shade600,
                    ),
                  ),
                ],
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildVariationsMatrix() {
    if (_variantRows.isEmpty) return const SizedBox();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('Variant Inventory', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.black87)),
            Text('${_variantRows.length} combinations', style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
          ],
        ),
        const SizedBox(height: 16),
        ..._variantRows.entries.map((entry) {
          final row = entry.value;
          final labelParts = <String>[];
          if (row.color != null) labelParts.add(row.color!);
          if (row.size != null) labelParts.add(row.size!);
          final label = labelParts.join(' / ');
          
          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey.shade200),
              borderRadius: BorderRadius.circular(12),
              color: Colors.white,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.style, size: 16, color: Color(0xFF1976D2)),
                    const SizedBox(width: 8),
                    Text(label, style: const TextStyle(fontWeight: FontWeight.w600, color: Colors.black87)),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(child: _buildSmallTextField('Price', row.priceController)),
                    const SizedBox(width: 12),
                    Expanded(child: _buildSmallTextField('Stock', row.stockController, isNumber: true)),
                    // const SizedBox(width: 12),
                    // Expanded(child: _buildSmallTextField('SKU (opt)', row.skuController)),
                  ],
                ),
              ],
            ),
          );
        }).toList(),
      ],
    );
  }

  Widget _buildSmallTextField(String label, TextEditingController controller, {bool isNumber = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: Colors.grey.shade600)),
        const SizedBox(height: 4),
        SizedBox(
          height: 40,
          child: TextFormField(
            controller: controller,
            keyboardType: isNumber ? TextInputType.number : TextInputType.text,
            style: const TextStyle(fontSize: 13),
            // decoration
            decoration: InputDecoration(
              contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 0),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(6), borderSide: BorderSide(color: Colors.grey.shade300)),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(6), borderSide: BorderSide(color: Colors.grey.shade300)),
              focusedBorder: const OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(6)), borderSide: BorderSide(color: Color(0xFF1976D2))),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildInventoryToggle() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF9FAFB),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Track Inventory', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.black87)),
              const SizedBox(height: 4),
              Text('Automatically update stock levels', style: TextStyle(fontSize: 11, color: Colors.grey.shade500)),
            ],
          ),
          Switch(
            value: _trackInventory,
            onChanged: (val) => setState(() => _trackInventory = val),
            activeThumbColor: const Color(0xFF1976D2),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomActions() {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Colors.grey.shade200)),
      ),
      child: Row(
        children: [
          Expanded(
            child: TextButton(
              onPressed: () => context.pop(),
              style: TextButton.styleFrom(
                backgroundColor: const Color(0xFFF3F4F6),
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              child: const Text('Cancel', style: TextStyle(color: Colors.black87, fontWeight: FontWeight.w600)),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            flex: 2,
            child: ElevatedButton(
              onPressed: _saveChanges,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF1976D2),
                padding: const EdgeInsets.symmetric(vertical: 16),
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              child: const Text('Save Changes', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
            ),
          ),
        ],
      ),
    );
  }
}

class VariantRowData {
  final String? id;
  final String? color;
  final String? size;
  final TextEditingController priceController;
  final TextEditingController stockController;
  final TextEditingController skuController;

  VariantRowData({
    this.id,
    this.color,
    this.size,
    String price = '',
    String stock = '0',
    String sku = '',
  }) : priceController = TextEditingController(text: price),
       stockController = TextEditingController(text: stock),
       skuController = TextEditingController(text: sku);

  void dispose() {
    priceController.dispose();
    stockController.dispose();
    skuController.dispose();
  }
}

