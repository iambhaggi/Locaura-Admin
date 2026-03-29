import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../../core/theme/app_colors.dart';
import '../../../../../core/router/app_router.dart';
import '../providers/product_detail_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ConsumerProductDetailScreen extends ConsumerStatefulWidget {
  final String productId;

  const ConsumerProductDetailScreen({super.key, required this.productId});

  @override
  ConsumerState<ConsumerProductDetailScreen> createState() => _ConsumerProductDetailScreenState();
}

class _ConsumerProductDetailScreenState extends ConsumerState<ConsumerProductDetailScreen> {
  // Selection state
  // String? _selectedVariantId; // TODO: Use for add to cart
  String? _selectedSize;
  // String? _selectedColor; // TODO: Use for product variants if color exists

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

    // Extract unique sizes and colors from variants
    final uniqueSizes = product.variants.map((v) => v.size).whereType<String>().toSet().toList();
    // Initialize initial selection if not set
    if (_selectedSize == null && uniqueSizes.isNotEmpty) {
      _selectedSize = uniqueSizes.first;
    }

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
                // Image gallery placeholder
                Container(
                  width: double.infinity,
                  height: 380.h,
                  color: AppColors.offWhite,
                  child: product.cover_images.isNotEmpty
                      ? Image.network(product.cover_images.first, fit: BoxFit.cover)
                      : Center(child: Icon(Icons.image_outlined, color: AppColors.grey300, size: 80.sp)),
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
                          if (product.base_compare_at_price != null && product.base_compare_at_price! > product.base_price)
                            Container(
                              padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                              decoration: BoxDecoration(
                                color: AppColors.discountRed.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(6.r),
                              ),
                              child: Text(
                                '${(((product.base_compare_at_price! - product.base_price) / product.base_compare_at_price!) * 100).toInt()}% OFF',
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
                            '₹${product.base_price.toInt()}',
                            style: GoogleFonts.inter(fontSize: 24.sp, fontWeight: FontWeight.w700, color: AppColors.charcoal),
                          ),
                          if (product.base_compare_at_price != null) ...[
                            SizedBox(width: 8.w),
                            Padding(
                              padding: EdgeInsets.only(bottom: 4.h),
                              child: Text(
                                'M.R.P: ₹${product.base_compare_at_price!.toInt()}',
                                style: GoogleFonts.inter(
                                  fontSize: 13.sp,
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
                            return GestureDetector(
                              onTap: () => setState(() => _selectedSize = size),
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 200),
                                margin: EdgeInsets.only(right: 12.w),
                                width: 48.w,
                                height: 48.w,
                                decoration: BoxDecoration(
                                  color: isSelected ? AppColors.charcoal : Colors.white,
                                  border: Border.all(color: isSelected ? AppColors.charcoal : AppColors.grey300),
                                  borderRadius: BorderRadius.circular(24.r),
                                ),
                                alignment: Alignment.center,
                                child: Text(
                                  size,
                                  style: GoogleFonts.inter(
                                    fontSize: 14.sp,
                                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                                    color: isSelected ? Colors.white : AppColors.charcoal,
                                  ),
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                        SizedBox(height: 32.h),
                      ],
                      
                      // Store Info (Simplified for MVP)
                      Container(
                        padding: EdgeInsets.all(16.w),
                        decoration: BoxDecoration(
                          color: AppColors.cream,
                          borderRadius: BorderRadius.circular(12.r),
                          border: Border.all(color: AppColors.gold.withOpacity(0.3)),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 48.w,
                              height: 48.w,
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(8.r),
                              ),
                              child: Icon(Icons.store_mall_directory_outlined, color: AppColors.gold, size: 24.sp),
                            ),
                            SizedBox(width: 12.w),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Sold by Partner Store',
                                    style: GoogleFonts.inter(fontSize: 13.sp, fontWeight: FontWeight.w600, color: AppColors.charcoal),
                                  ),
                                  SizedBox(height: 4.h),
                                  Row(
                                    children: [
                                      Icon(Icons.star_rounded, color: AppColors.gold, size: 14.sp),
                                      SizedBox(width: 4.w),
                                      Text('${product.rating}', style: GoogleFonts.inter(fontSize: 12.sp, fontWeight: FontWeight.w600)),
                                      SizedBox(width: 12.w),
                                      Text('${product.total_reviews} reviews', style: GoogleFonts.inter(fontSize: 12.sp, color: AppColors.grey500)),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            Icon(Icons.chevron_right_rounded, color: AppColors.grey400),
                          ],
                        ),
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
                      child: ElevatedButton(
                        onPressed: () {
                          // TODO: Real Add to Cart
                          context.push(AppRoutes.consumerCart);
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.charcoal,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)),
                          elevation: 0,
                        ),
                        child: Text(
                          'Add to Cart',
                          style: GoogleFonts.inter(fontSize: 16.sp, fontWeight: FontWeight.w600),
                        ),
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
}
