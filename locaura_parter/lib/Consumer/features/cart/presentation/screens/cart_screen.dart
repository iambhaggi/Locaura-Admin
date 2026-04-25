import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../../core/theme/app_colors.dart';
import '../../../../../core/router/app_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:locaura_parter/Retailer/features/auth/presentation/controllers/auth_controller.dart';
import 'package:locaura_parter/Consumer/features/auth/domain/entities/consumer.entity.dart';

class CartScreen extends ConsumerStatefulWidget {
  const CartScreen({super.key});

  @override
  ConsumerState<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends ConsumerState<CartScreen> {
  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authControllerProvider);
    
    return authState.when(
      initial: () => const Scaffold(body: Center(child: Text('Please login'))),
      loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
      otpSent: (_, __) => const SizedBox.shrink(),
      authenticated: (_) => const Scaffold(body: Center(child: Text('Retailer account active'))),
      error: (msg) => Scaffold(body: Center(child: Text('Error: $msg'))),
      consumerAuthenticated: (consumer) {
        final cart = consumer.cart;
        if (cart == null || cart.items.isEmpty) return _buildEmptyCart();
        return _buildCartContent(cart);
      },
    );
  }

  Widget _buildCartContent(ConsumerCartEntity cart) {
    return Scaffold(
      backgroundColor: AppColors.offWhite,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          'My Cart',
          style: GoogleFonts.inter(fontSize: 18.sp, fontWeight: FontWeight.w600, color: AppColors.charcoal),
        ),
        centerTitle: true,
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.read(authControllerProvider.notifier).refreshConsumerProfile(),
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.fromLTRB(16.w, 16.h, 16.w, 8.h),
                child: Row(
                  children: [
                    Icon(Icons.storefront, color: AppColors.gold, size: 20.sp),
                    SizedBox(width: 8.w),
                    Text(
                      cart.storeName ?? 'Partner Store',
                      style: GoogleFonts.inter(fontSize: 18.sp, fontWeight: FontWeight.w700, color: AppColors.charcoal),
                    ),
                  ],
                ),
              ),
            ),
            SliverPadding(
              padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
              sliver: SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) { 
                    print(cart.items[index]);
                    return _buildCartItem(cart.items[index], index);},
                  childCount: cart.items.length,
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.symmetric(horizontal: 16.w),
                child: _buildBillDetails(cart),
              ),
            ),
            SliverToBoxAdapter(child: SizedBox(height: 140.h)),
          ],
        ),
      ),
      bottomSheet: _buildCheckoutBottomBar(cart.total),
    );
  }

  Widget _buildCartItem(ConsumerCartItemEntity item, int index) {
    return Container(
      margin: EdgeInsets.only(bottom: 16.h),
      padding: EdgeInsets.all(12.w),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16.r),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image
          Container(
            width: 80.w,
            height: 90.h,
            decoration: BoxDecoration(
              color: AppColors.cream,
              borderRadius: BorderRadius.circular(10.r),
              image: item.thumbUrl != null
                  ? DecorationImage(image: NetworkImage(item.thumbUrl!), fit: BoxFit.cover)
                  : null,
            ),
            child: item.thumbUrl == null
                ? Icon(Icons.image_outlined, color: AppColors.grey300, size: 30.sp)
                : null,
          ),
          SizedBox(width: 12.w),
          // Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.productName,
                  style: GoogleFonts.inter(fontSize: 14.sp, fontWeight: FontWeight.w600, color: AppColors.charcoal),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                if (item.brandName.isNotEmpty || item.size.isNotEmpty)
                  Padding(
                    padding: EdgeInsets.only(top: 4.h),
                    child: Text(
                      '${item.size.isNotEmpty ? "Size: ${item.size} • " : ""}${item.brandName}',
                      style: GoogleFonts.inter(fontSize: 12.sp, color: AppColors.grey500),
                    ),
                  ),
                SizedBox(height: 12.h),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Text(
                          '₹${item.price.toInt()}${item.quantity > 1 ? " (x${item.quantity})" : ""}',
                          style: GoogleFonts.inter(fontSize: 15.sp, fontWeight: FontWeight.w700, color: AppColors.charcoal),
                        ),
                        if (item.originalPrice != null && item.originalPrice! > item.price) ...[
                          SizedBox(width: 6.w),
                          Text(
                            '₹${item.originalPrice!.toInt()}',
                            style: GoogleFonts.inter(
                              fontSize: 12.sp,
                              color: AppColors.grey400,
                              decoration: TextDecoration.lineThrough,
                            ),
                          ),
                        ],
                      ],
                    ),
                    // Quantity control
                    Container(
                      decoration: BoxDecoration(
                        border: Border.all(color: AppColors.grey200),
                        borderRadius: BorderRadius.circular(8.r),
                      ),
                      child: Row(
                        children: [
                          _buildQtyBtn(item.quantity <= 1 ? Icons.delete_outline : Icons.remove, () {
                            if (item.quantity > 1) {
                              ref.read(authControllerProvider.notifier).updateCartQuantity(item.variantId, item.quantity - 1);
                            } else {
                              ref.read(authControllerProvider.notifier).removeFromCart(item.variantId);
                            }
                          }),
                          Container(
                            width: 32.w,
                            alignment: Alignment.center,
                            child: Text(
                              '${item.quantity}',
                              style: GoogleFonts.inter(fontSize: 14.sp, fontWeight: FontWeight.w600, color: AppColors.charcoal),
                            ),
                          ),
                          _buildQtyBtn(Icons.add, () {
                            ref.read(authControllerProvider.notifier).updateCartQuantity(item.variantId, item.quantity + 1);
                          }),
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
    );
  }

  Widget _buildQtyBtn(IconData icon, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 28.w,
        height: 28.h,
        alignment: Alignment.center,
        child: Icon(icon, size: 16.sp, color: AppColors.charcoal),
      ),
    );
  }

  Widget _buildBillDetails(ConsumerCartEntity cart) {
    return Container(
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16.r),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Bill Details',
            style: GoogleFonts.inter(fontSize: 16.sp, fontWeight: FontWeight.w600, color: AppColors.charcoal),
          ),
          SizedBox(height: 16.h),
          _buildBillRow(
            'Item Total (${cart.items.fold(0, (sum, item) => sum + item.quantity)} items)', 
            '₹${cart.subtotal.toInt()}'
          ),
          SizedBox(height: 12.h),
          _buildBillRow('Delivery Fee', '₹${cart.delivery_fee.toInt()}'),
          SizedBox(height: 12.h),
          _buildBillRow('Platform Fee', '₹${cart.platform_fee.toInt()}'),
          SizedBox(height: 12.h),
          const Divider(),
          SizedBox(height: 12.h),
          _buildBillRow('To Pay', '₹${cart.total.toInt()}', isTotal: true),
        ],
      ),
    );
  }

  Widget _buildBillRow(String label, String value, {bool isTotal = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: GoogleFonts.inter(
            fontSize: isTotal ? 15.sp : 13.sp,
            fontWeight: isTotal ? FontWeight.w700 : FontWeight.w500,
            color: isTotal ? AppColors.charcoal : AppColors.grey500,
          ),
        ),
        Text(
          value,
          style: GoogleFonts.inter(
            fontSize: isTotal ? 15.sp : 13.sp,
            fontWeight: isTotal ? FontWeight.w700 : FontWeight.w600,
            color: AppColors.charcoal,
          ),
        ),
      ],
    );
  }

  Widget _buildCheckoutBottomBar(num total) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 16.h),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -5)),
        ],
      ),
      child: Row(
        children: [
          Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Total Price',
                style: GoogleFonts.inter(fontSize: 12.sp, color: AppColors.grey500),
              ),
              Text(
                '₹${total.toInt()}',
                style: GoogleFonts.inter(fontSize: 20.sp, fontWeight: FontWeight.w700, color: AppColors.charcoal),
              ),
            ],
          ),
          SizedBox(width: 24.w),
          Expanded(
            child: SizedBox(
              height: 56.h,
              child: ElevatedButton(
                onPressed: () => context.push(AppRoutes.checkout),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.gold,
                  foregroundColor: AppColors.charcoal,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)),
                  elevation: 0,
                ),
                child: Text(
                  'Checkout',
                  style: GoogleFonts.inter(fontSize: 16.sp, fontWeight: FontWeight.w600),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyCart() {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text('My Cart', style: TextStyle(color: AppColors.charcoal, fontSize: 18.sp, fontWeight: FontWeight.w600)),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.shopping_bag_outlined, size: 80.sp, color: AppColors.grey300),
            SizedBox(height: 24.h),
            Text(
              'Your cart is empty',
              style: GoogleFonts.inter(fontSize: 18.sp, fontWeight: FontWeight.w600, color: AppColors.charcoal),
            ),
            SizedBox(height: 8.h),
            Text(
              'Looks like you haven\'t added\nanything to your cart yet',
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(fontSize: 14.sp, color: AppColors.grey500),
            ),
          ],
        ),
      ),
    );
  }
}
