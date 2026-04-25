import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:locaura_parter/Retailer/features/auth/presentation/controllers/auth_controller.dart';
import '../../../../../core/theme/app_colors.dart';
import '../../../../../core/router/app_router.dart';
import '../providers/product_detail_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../home/domain/entities/nearby_store.entity.dart';

class ConsumerProductDetailScreen extends ConsumerStatefulWidget {
  final String productId;

  const ConsumerProductDetailScreen({super.key, required this.productId});

  @override
  ConsumerState<ConsumerProductDetailScreen> createState() => _ConsumerProductDetailScreenState();
}

class _ConsumerProductDetailScreenState extends ConsumerState<ConsumerProductDetailScreen> {
  String? _selectedSize;
  int _currentImageIndex = 0;
  final PageController _pageController = PageController();

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  // Removed mock data

  @override
  Widget build(BuildContext context) {
    final productState = ref.watch(productDetailNotifierProvider(widget.productId));

    if (productState.isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (productState.error != null) {
      return Scaffold(body: Center(child: Text('Error: ${productState.error}')));
    }

    final product = productState.product;
    if (product == null) {
      return const Scaffold(body: Center(child: Text('Product not found')));
    }

    // Extract unique sizes from active variants
    final activeVariants = product.variants.where((v) => v.is_active).toList();
    final uniqueSizes = activeVariants.map((v) => v.size).whereType<String>().toSet().toList();
    
    // Initialize initial selection if not set
    if (_selectedSize == null && uniqueSizes.isNotEmpty) {
      _selectedSize = uniqueSizes.first;
    }

    // Get selected variant details
    final selectedVariant = activeVariants.firstWhere(
      (v) => v.size == _selectedSize,
      orElse: () => activeVariants.first,
    );

    final currentPrice = selectedVariant.price;
    final comparePrice = selectedVariant.compare_at_price ?? product.base_compare_at_price;
    final hasDiscount = comparePrice != null && comparePrice > currentPrice;
    final discountPercent = hasDiscount ? (((comparePrice - currentPrice) / comparePrice) * 100).toInt() : 0;
    final isOutOfStock = selectedVariant.stock <= 0;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new, color: AppColors.charcoal, size: 20.sp),
          onPressed: () => context.pop(),
        ),
        actions: [
          IconButton(
            icon: Icon(Icons.share_outlined, color: AppColors.charcoal, size: 22.sp),
            onPressed: () {},
          ),
          IconButton(
            icon: Icon(Icons.favorite_border_rounded, color: AppColors.charcoal, size: 22.sp),
            onPressed: () {},
          ),
          SizedBox(width: 8.w),
        ],
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: EdgeInsets.only(bottom: 100.h),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Image Carousel
                Stack(
                  children: [
                    Container(
                      width: double.infinity,
                      height: 420.h,
                      color: AppColors.offWhite,
                      child: product.cover_images.isNotEmpty
                          ? PageView.builder(
                              controller: _pageController,
                              onPageChanged: (index) => setState(() => _currentImageIndex = index),
                              itemCount: product.cover_images.length,
                              itemBuilder: (context, index) => Image.network(
                                product.cover_images[index],
                                fit: BoxFit.cover,
                              ),
                            )
                          : Center(child: Icon(Icons.image_outlined, color: AppColors.grey300, size: 80.sp)),
                    ),
                    if (product.cover_images.length > 1)
                      Positioned(
                        bottom: 16.h,
                        left: 0,
                        right: 0,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: List.generate(
                            product.cover_images.length,
                            (index) => AnimatedContainer(
                              duration: const Duration(milliseconds: 300),
                              margin: EdgeInsets.symmetric(horizontal: 4.w),
                              width: _currentImageIndex == index ? 24.w : 8.w,
                              height: 8.w,
                              decoration: BoxDecoration(
                                color: _currentImageIndex == index ? AppColors.charcoal : AppColors.grey300,
                                borderRadius: BorderRadius.circular(4.r),
                              ),
                            ),
                          ),
                        ),
                      ),
                    if (isOutOfStock)
                      Positioned(
                        top: 20.h,
                        right: 20.w,
                        child: Container(
                          padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
                          decoration: BoxDecoration(
                            color: Colors.black.withOpacity(0.7),
                            borderRadius: BorderRadius.circular(4.r),
                          ),
                          child: Text(
                            'OUT OF STOCK',
                            style: GoogleFonts.inter(fontSize: 10.sp, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                        ),
                      ),
                  ],
                ),
                Padding(
                  padding: EdgeInsets.all(20.w),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                if (product.brand != null)
                                  Text(
                                    product.brand!,
                                    style: GoogleFonts.inter(fontSize: 12.sp, fontWeight: FontWeight.w600, color: AppColors.grey500),
                                  ),
                                SizedBox(height: 4.h),
                                Text(
                                  product.name,
                                  style: GoogleFonts.inter(fontSize: 20.sp, fontWeight: FontWeight.w700, color: AppColors.charcoal),
                                ),
                              ],
                            ),
                          ),
                          if (hasDiscount)
                            Container(
                              padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                              decoration: BoxDecoration(
                                color: AppColors.discountRed.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(6.r),
                              ),
                              child: Text(
                                '$discountPercent% OFF',
                                style: GoogleFonts.inter(fontSize: 12.sp, fontWeight: FontWeight.w700, color: AppColors.discountRed),
                              ),
                            ),
                        ],
                      ),
                      SizedBox(height: 12.h),
                      // Pricing
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            '₹${currentPrice.toInt()}',
                            style: GoogleFonts.inter(fontSize: 26.sp, fontWeight: FontWeight.w900, color: AppColors.charcoal),
                          ),
                          if (hasDiscount) ...[
                            SizedBox(width: 8.w),
                            Padding(
                              padding: EdgeInsets.only(bottom: 4.h),
                              child: Text(
                                '₹${comparePrice.toInt()}',
                                style: GoogleFonts.inter(
                                  fontSize: 14.sp,
                                  color: AppColors.grey500,
                                  decoration: TextDecoration.lineThrough,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                      SizedBox(height: 24.h),
                      
                      // Size Selector
                      if (uniqueSizes.isNotEmpty) ...[
                        Text(
                          'Select Size',
                          style: GoogleFonts.inter(fontSize: 14.sp, fontWeight: FontWeight.w600, color: AppColors.charcoal),
                        ),
                        SizedBox(height: 12.h),
                        Row(
                          children: uniqueSizes.map((size) {
                            final isSelected = _selectedSize == size;
                            final variant = activeVariants.firstWhere((v) => v.size == size);
                            final isVariantOutOfStock = variant.stock <= 0;

                            return GestureDetector(
                              onTap: () => setState(() => _selectedSize = size),
                              child: Opacity(
                                opacity: isVariantOutOfStock ? 0.5 : 1.0,
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 200),
                                  margin: EdgeInsets.only(right: 12.w),
                                  width: 52.w,
                                  height: 52.w,
                                  decoration: BoxDecoration(
                                    color: isSelected ? AppColors.charcoal : Colors.white,
                                    border: Border.all(
                                      color: isSelected ? AppColors.charcoal : AppColors.grey300,
                                      width: isSelected ? 2 : 1,
                                    ),
                                    borderRadius: BorderRadius.circular(12.r),
                                  ),
                                  alignment: Alignment.center,
                                  child: Stack(
                                    alignment: Alignment.center,
                                    children: [
                                      Text(
                                        size,
                                        style: GoogleFonts.inter(
                                          fontSize: 14.sp,
                                          fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                                          color: isSelected ? Colors.white : AppColors.charcoal,
                                        ),
                                      ),
                                      if (isVariantOutOfStock)
                                        Transform.rotate(
                                          angle: -0.5,
                                          child: Container(
                                            width: 40.w,
                                            height: 1,
                                            color: AppColors.grey400,
                                          ),
                                        ),
                                    ],
                                  ),
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                        SizedBox(height: 32.h),
                      ],
                      
                      // Store Info
                      Consumer(
                        builder: (context, ref, child) {
                          NearbyStoreEntity? store;
                          if (product.store is Map<String, dynamic>) {
                            store = NearbyStoreEntity.fromJson(product.store as Map<String, dynamic>);
                          } else if (product.store is NearbyStoreEntity) {
                            store = product.store as NearbyStoreEntity;
                          }

                          return Container(
                            padding: EdgeInsets.all(16.w),
                            decoration: BoxDecoration(
                              color: AppColors.cream,
                              borderRadius: BorderRadius.circular(12.r),
                              border: Border.all(color: AppColors.gold.withOpacity(0.3)),
                            ),
                            child: InkWell(
                              onTap: () {
                                if (store != null) {
                                  context.push(
                                    AppRoutes.consumerStoreProducts.replaceAll(':storeId', store.id),
                                  );
                                }
                              },
                              child: Row(
                                children: [
                                  Container(
                                    width: 48.w,
                                    height: 48.w,
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(8.r),
                                      image: store?.banner_url != null
                                          ? DecorationImage(
                                              image: NetworkImage(store!.banner_url!),
                                              fit: BoxFit.cover,
                                            )
                                          : null,
                                    ),
                                    child: store?.banner_url == null
                                        ? Icon(Icons.store_mall_directory_outlined, color: AppColors.gold, size: 24.sp)
                                        : null,
                                  ),
                                  SizedBox(width: 12.w),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          store?.name ?? 'Partner Store',
                                          style: GoogleFonts.inter(fontSize: 13.sp, fontWeight: FontWeight.w600, color: AppColors.charcoal),
                                        ),
                                        SizedBox(height: 4.h),
                                        Row(
                                          children: [
                                            Icon(Icons.star_rounded, color: AppColors.gold, size: 14.sp),
                                            SizedBox(width: 4.w),
                                            Text('${store?.rating ?? product.rating}',
                                                style: GoogleFonts.inter(fontSize: 12.sp, fontWeight: FontWeight.w600)),
                                            SizedBox(width: 12.w),
                                            Text('${store?.rating_count ?? product.total_reviews} reviews',
                                                style: GoogleFonts.inter(fontSize: 12.sp, color: AppColors.grey500)),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                  Icon(Icons.chevron_right_rounded, color: AppColors.grey400),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                      
                      if (product.description != null) ...[
                        SizedBox(height: 24.h),
                        Text(
                          'Product Description',
                          style: GoogleFonts.inter(fontSize: 16.sp, fontWeight: FontWeight.w700, color: AppColors.charcoal),
                        ),
                        SizedBox(height: 8.h),
                        Text(
                          product.description!,
                          style: GoogleFonts.inter(fontSize: 14.sp, color: AppColors.grey600, height: 1.6),
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
          
          // Sticky Bottom Bar
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: Container(
              padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 16.h).copyWith(
                bottom: MediaQuery.of(context).padding.bottom + 16.h,
              ),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -5)),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    width: 56.w,
                    height: 56.h,
                    decoration: BoxDecoration(
                      border: Border.all(color: AppColors.grey300),
                      borderRadius: BorderRadius.circular(12.r),
                    ),
                    child: IconButton(
                      icon: Icon(Icons.bookmark_border_rounded, color: AppColors.charcoal, size: 24.sp),
                      onPressed: () {},
                    ),
                  ),
                  SizedBox(width: 16.w),
                  Expanded(
                    child: SizedBox(
                      height: 56.h,
                      child: Consumer(
                        builder: (context, ref, child) {
                          final authState = ref.watch(authControllerProvider);
                          final isLoading = authState.maybeWhen(loading: () => true, orElse: () => false);
                          
                          return ElevatedButton(
                            onPressed: (isOutOfStock || isLoading)
                                ? null
                                : () async {
                                    final curAuthState = ref.read(authControllerProvider);
                                    final consumer = curAuthState.maybeMap(
                                      consumerAuthenticated: (c) => c.consumer,
                                      orElse: () => null,
                                    );

                                    if (consumer == null) {
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        const SnackBar(content: Text('Please login to add to cart')),
                                      );
                                      return;
                                    }

                                    final cart = consumer.cart;
                                    final isInCart = cart?.items.any((item) => item.variantId == selectedVariant.id) ?? false;

                                    if (isInCart) {
                                      context.push(AppRoutes.consumerCart);
                                      return;
                                    }

                                    String? storeId;
                                    if (product.store is String) {
                                      storeId = product.store as String;
                                    } else if (product.store is NearbyStoreEntity) {
                                      storeId = (product.store as NearbyStoreEntity).id;
                                    } else if (product.store is Map<String, dynamic>) {
                                      storeId = product.store['_id'] ?? product.store['id'];
                                    }

                                    if (storeId == null) {
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        const SnackBar(content: Text('Store information is missing')),
                                      );
                                      return;
                                    }

                                    // Attempt to add
                                    final success = await ref.read(authControllerProvider.notifier).addToCart(
                                          storeId,
                                          selectedVariant.id,
                                          1,
                                        );

                                    if (!success && context.mounted) {
                                      // Potential store conflict
                                      final shouldReplace = await _showConflictDialog(context, cart?.storeId ?? "Another Store");
                                      if (shouldReplace == true) {
                                        await ref.read(authControllerProvider.notifier).clearCart();
                                        await ref.read(authControllerProvider.notifier).addToCart(
                                              storeId,
                                              selectedVariant.id,
                                              1,
                                              force: true,
                                            );
                                      }
                                    } else if (success && context.mounted) {
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        SnackBar(
                                          content: Text('Added ${product.name} to cart!'),
                                          backgroundColor: Colors.green,
                                          behavior: SnackBarBehavior.floating,
                                          action: SnackBarAction(
                                            label: 'VIEW CART',
                                            textColor: Colors.white,
                                            onPressed: () => context.push(AppRoutes.consumerCart),
                                          ),
                                        ),
                                      );
                                    }
                                  },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.charcoal,
                              foregroundColor: Colors.white,
                              disabledBackgroundColor: AppColors.grey300,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)),
                              elevation: 0,
                            ),
                            child: isLoading
                                ? SizedBox(
                                    width: 20.w,
                                    height: 20.w,
                                    child: const CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                  )
                                : Consumer(builder: (context, ref, _) {
                                    final auth = ref.watch(authControllerProvider);
                                    final cart = auth.maybeMap(
                                      consumerAuthenticated: (c) => c.consumer.cart,
                                      orElse: () => null,
                                    );
                                    final isInCart = cart?.items.any((item) => item.variantId == selectedVariant.id) ?? false;
                                    
                                    return Text(
                                      isOutOfStock 
                                        ? 'Out of Stock' 
                                        : (isInCart ? 'Go to Cart' : 'Add to Cart'),
                                      style: GoogleFonts.inter(fontSize: 16.sp, fontWeight: FontWeight.bold),
                                    );
                                  }),
                          );
                        },
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
  Future<bool?> _showConflictDialog(BuildContext context, String currentStore) {
    return showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Replace Cart Items?'),
        content: Text('Your cart contains items from $currentStore. Would you like to clear your cart and add items from this store instead?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('CANCEL'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('REPLACE', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }
}
