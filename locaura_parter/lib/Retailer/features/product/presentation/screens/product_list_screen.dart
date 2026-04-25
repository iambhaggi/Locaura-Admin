import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:locaura_parter/core/extensions/context_extensions.dart';
import 'package:locaura_parter/core/router/app_router.dart';
import 'package:locaura_parter/core/utils/app_sizes.dart';
import 'package:locaura_parter/core/widgets/common/app_image.dart';
import '../controllers/product_controller.dart';
import '../../domain/entities/product.entity.dart';

class ProductListScreen extends ConsumerStatefulWidget {
  final String storeId;
  const ProductListScreen({super.key, required this.storeId});

  @override
  ConsumerState<ProductListScreen> createState() => _ProductListScreenState();
}

class _ProductListScreenState extends ConsumerState<ProductListScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(productControllerProvider.notifier).fetchStoreProducts(widget.storeId);
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(productControllerProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Store Products'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref
                .read(productControllerProvider.notifier)
                .fetchStoreProducts(widget.storeId),
          ),
        ],
      ),
      body: state.maybeWhen(
        success: (products) => products.isEmpty
            ? _buildEmptyState(context)
            : _buildProductGrid(context, products),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (msg) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(msg, style: const TextStyle(color: Colors.red)),
              const SizedBox(height: AppSizes.s16),
              ElevatedButton(
                onPressed: () => ref
                    .read(productControllerProvider.notifier)
                    .fetchStoreProducts(widget.storeId),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
        orElse: () {
          // This case should ideally never happen, but we handle it just in case
          return const Center(child: Text('Unexpected state')); 
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push(
          AppRoutes.productForm.replaceAll(':storeId', widget.storeId),
        ),
        label: const Text('Add Product'),
        icon: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.inventory_2_outlined, size: 64, color: Colors.grey),
          const SizedBox(height: AppSizes.s16),
          Text('No products found', style: context.textTheme.titleMedium),
          const SizedBox(height: AppSizes.s8),
          const Text('Tap "+" to add your first product'),
        ],
      ),
    );
  }

  Widget _buildProductGrid(BuildContext context, List<ProductEntity> products) {
    return GridView.builder(
      padding: const EdgeInsets.all(AppSizes.pagePaddingH),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.75,
        crossAxisSpacing: AppSizes.s16,
        mainAxisSpacing: AppSizes.s16,
      ),
      itemCount: products.length,
      itemBuilder: (context, index) {
        final product = products[index];
        return _ProductCard(product: product, storeId: widget.storeId);
      },
    );
  }
}

class _ProductCard extends StatelessWidget {
  final ProductEntity product;
  final String storeId;
  const _ProductCard({required this.product, required this.storeId});

  @override
  Widget build(BuildContext context) {
    return Card(
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppSizes.radiusMd)),
      child: InkWell(
        onTap: () => context.push(
          AppRoutes.productForm.replaceAll(':storeId', storeId),
          extra: product.id,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Container(
                width: double.infinity,
                color: Colors.grey.shade100,
                child: product.coverImages.isNotEmpty
                    ? AppImage(
                        imageUrl: product.coverImages.first,
                        fit: BoxFit.cover,
                      )
                    : const Icon(Icons.image_outlined, size: 40, color: Colors.grey),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(AppSizes.s8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Text(
                          product.name,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: context.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.delete_outline, size: 18, color: Colors.grey),
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                        onPressed: () => _showDeleteConfirmation(context),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSizes.s4),
                  // strike through price with discount and final price in rich text
                  Text.rich(
                    TextSpan(
                      children: [
                        if (product.baseCompareAtPrice != null && product.baseCompareAtPrice! > 0)
                          TextSpan(
                            text: '₹${product.basePrice} ',
                            style: context.textTheme.bodyMedium?.copyWith(
                              color: Colors.grey.shade600,
                              decoration: TextDecoration.lineThrough,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        TextSpan(
                          text: product.baseCompareAtPrice != null && product.baseCompareAtPrice! > 0
                              ? '₹${product.baseCompareAtPrice}'
                              : '₹${product.basePrice}',
                          style: context.textTheme.bodyLarge?.copyWith(
                            color: context.colorScheme.primary,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: AppSizes.s4),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: product.status == 'active' ? Colors.green.shade100 : Colors.orange.shade100,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          product.status.toUpperCase(),
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: product.status == 'active' ? Colors.green.shade900 : Colors.orange.shade900,
                          ),
                        ),
                      ),
                      const SizedBox(width: AppSizes.s8),
                      Text(
                        'Stock: ${product.totalStock}',
                        style: context.textTheme.bodySmall?.copyWith(fontSize: 10),
                      ),
                      const Spacer(),
                      Consumer(
                        builder: (context, ref, child) => PopupMenuButton<String>(
                          icon: const Icon(Icons.more_vert, size: 18, color: Colors.grey),
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(),
                          onSelected: (value) {
                            ref.read(productControllerProvider.notifier).updateExistingProduct(
                                  storeId,
                                  product.id,
                                  {'status': value},
                                );
                          },
                          itemBuilder: (context) => [
                            const PopupMenuItem(
                              value: 'active',
                              child: Text('Set Active'),
                            ),
                            const PopupMenuItem(
                              value: 'inactive',
                              child: Text('Set Inactive'),
                            ),
                            const PopupMenuItem(
                              value: 'draft',
                              child: Text('Set Draft'),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showDeleteConfirmation(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Product?'),
        content: Text('Are you sure you want to delete "${product.name}"? This will also delete all its variations.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('CANCEL')),
          Consumer(
            builder: (context, ref, child) => TextButton(
              onPressed: () {
                ref.read(productControllerProvider.notifier).deleteExistingProduct(storeId, product.id);
                Navigator.pop(ctx);
              },
              child: const Text('DELETE', style: TextStyle(color: Colors.red)),
            ),
          ),
        ],
      ),
    );
  }
}
