import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../../core/theme/app_colors.dart';
import '../../../../../core/router/app_router.dart';
import '../providers/store_products_provider.dart';

class ConsumerStoreProductsScreen extends ConsumerWidget {
  final String storeId;
  const ConsumerStoreProductsScreen({super.key, required this.storeId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(storeProductsProvider(storeId));

    return Scaffold(
      backgroundColor: AppColors.offWhite,
      appBar: AppBar(
        title: Text(
          'Store Products',
          style: GoogleFonts.inter(fontSize: 16.sp, fontWeight: FontWeight.w600),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 20),
          onPressed: () => context.pop(),
        ),
      ),
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator())
          : state.error != null
              ? Center(child: Text('Error: ${state.error}'))
              : state.products.isEmpty
                  ? Center(child: Text('No products found for this store', style: GoogleFonts.inter(color: AppColors.grey500)))
                  : GridView.builder(
                      padding: EdgeInsets.all(16.w),
                      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        childAspectRatio: 0.65,
                        crossAxisSpacing: 16.w,
                        mainAxisSpacing: 16.h,
                      ),
                      itemCount: state.products.length,
                      itemBuilder: (context, index) {
                        final product = state.products[index];
                        return _ProductCard(product: product);
                      },
                    ),
    );
  }
}

class _ProductCard extends StatelessWidget {
  final dynamic product;
  const _ProductCard({required this.product});

  @override
  Widget build(BuildContext context) {
    final discount = product.original_price > product.price 
        ? (((product.original_price - product.price) / product.original_price) * 100).toInt()
        : 0;

    return GestureDetector(
      onTap: () => context.push(AppRoutes.consumerProductDetail.replaceAll(':id', product.id)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Container(
              width: double.infinity,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12.r),
                border: Border.all(color: AppColors.grey200),
              ),
              child: Stack(
                children: [
                  if (product.image_urls != null && product.image_urls!.isNotEmpty)
                    ClipRRect(
                      borderRadius: BorderRadius.circular(12.r),
                      child: Image.network(
                        product.image_urls![0],
                        width: double.infinity,
                        height: double.infinity,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Center(child: Icon(Icons.image_outlined, color: AppColors.grey300, size: 48.sp)),
                      ),
                    )
                  else
                    Center(child: Icon(Icons.image_outlined, color: AppColors.grey300, size: 48.sp)),
                  
                  if (discount > 0)
                    Positioned(
                      top: 8.h,
                      left: 8.w,
                      child: Container(
                        padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 2.h),
                        decoration: BoxDecoration(
                          color: AppColors.charcoal,
                          borderRadius: BorderRadius.circular(4.r),
                        ),
                        child: Text(
                          '$discount% OFF',
                          style: GoogleFonts.inter(fontSize: 10.sp, fontWeight: FontWeight.w700, color: Colors.white),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),
          SizedBox(height: 8.h),
          Text(
            product.name,
            style: GoogleFonts.inter(fontSize: 13.sp, fontWeight: FontWeight.w600, color: AppColors.charcoal),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          SizedBox(height: 4.h),
          Row(
            children: [
              Text(
                '₹${product.price}',
                style: GoogleFonts.inter(fontSize: 14.sp, fontWeight: FontWeight.w700, color: AppColors.charcoal),
              ),
              if (discount > 0) ...[
                SizedBox(width: 6.w),
                Text(
                  '₹${product.original_price}',
                  style: GoogleFonts.inter(
                    fontSize: 11.sp,
                    color: AppColors.grey400,
                    decoration: TextDecoration.lineThrough,
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }
}
