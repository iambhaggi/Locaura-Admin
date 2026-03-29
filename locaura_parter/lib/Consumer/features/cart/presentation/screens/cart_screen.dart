import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../../core/theme/app_colors.dart';
import '../../../../../core/router/app_router.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  // Mock cart items
  final List<Map<String, dynamic>> _cartItems = [
    {
      'id': '1',
      'name': 'Oxford Cotton Shirt',
      'store': 'The Reserve Pantry',
      'price': 2499,
      'originalPrice': 3999,
      'size': 'M',
      'qty': 1,
    },
    {
      'id': '2',
      'name': 'Minimalist Chrono Watch',
      'store': 'Urban Drip Co.',
      'price': 4500,
      'originalPrice': 6000,
      'size': 'Free',
      'qty': 1,
    },
  ];

  @override
  Widget build(BuildContext context) {
    if (_cartItems.isEmpty) return _buildEmptyCart();

    final subtotal = _cartItems.fold<num>(0, (sum, item) => sum + (item['price'] * item['qty']));
    final delivery = 40;
    final total = subtotal + delivery;

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
      body: CustomScrollView(
        slivers: [
          SliverPadding(
            padding: EdgeInsets.all(16.w),
            sliver: SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) => _buildCartItem(_cartItems[index], index),
                childCount: _cartItems.length,
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.w),
              child: _buildBillDetails(subtotal, delivery, total),
            ),
          ),
          SliverToBoxAdapter(child: SizedBox(height: 120.h)),
        ],
      ),
      bottomSheet: _buildCheckoutBottomBar(total),
    );
  }

  Widget _buildCartItem(Map<String, dynamic> item, int index) {
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
            ),
            child: Icon(Icons.image_outlined, color: AppColors.grey300, size: 30.sp),
          ),
          SizedBox(width: 12.w),
          // Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item['name'],
                  style: GoogleFonts.inter(fontSize: 14.sp, fontWeight: FontWeight.w600, color: AppColors.charcoal),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                SizedBox(height: 4.h),
                Text(
                  'Size: ${item['size']} • ${item['store']}',
                  style: GoogleFonts.inter(fontSize: 12.sp, color: AppColors.grey500),
                ),
                SizedBox(height: 12.h),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Text(
                          '₹${item['price']}',
                          style: GoogleFonts.inter(fontSize: 15.sp, fontWeight: FontWeight.w700, color: AppColors.charcoal),
                        ),
                        SizedBox(width: 6.w),
                        Text(
                          '₹${item['originalPrice']}',
                          style: GoogleFonts.inter(
                            fontSize: 12.sp,
                            color: AppColors.grey400,
                            decoration: TextDecoration.lineThrough,
                          ),
                        ),
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
                          _buildQtyBtn(Icons.remove, () {
                            if (item['qty'] > 1) {
                              setState(() => item['qty']--);
                            }
                          }),
                          Container(
                            width: 32.w,
                            alignment: Alignment.center,
                            child: Text(
                              '${item['qty']}',
                              style: GoogleFonts.inter(fontSize: 14.sp, fontWeight: FontWeight.w600, color: AppColors.charcoal),
                            ),
                          ),
                          _buildQtyBtn(Icons.add, () => setState(() => item['qty']++)),
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

  Widget _buildBillDetails(num subtotal, num delivery, num total) {
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
          _buildBillRow('Item Total', '₹$subtotal'),
          SizedBox(height: 12.h),
          _buildBillRow('Delivery Fee', '₹$delivery'),
          SizedBox(height: 12.h),
          _buildBillRow('Platform Fee', '₹5'),
          SizedBox(height: 12.h),
          const Divider(),
          SizedBox(height: 12.h),
          _buildBillRow('To Pay', '₹${total + 5}', isTotal: true),
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
                '₹${total + 5}',
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
