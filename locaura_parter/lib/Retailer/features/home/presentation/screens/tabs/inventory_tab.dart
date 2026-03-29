import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:locaura_parter/core/extensions/context_extensions.dart';
import 'package:locaura_parter/core/router/app_router.dart';
import 'package:locaura_parter/core/theme/app_text_styles.dart';
import 'package:locaura_parter/core/utils/app_sizes.dart';
import 'package:locaura_parter/core/widgets/common/app_image.dart';
import 'package:locaura_parter/Retailer/features/product/presentation/controllers/product_controller.dart';
import 'package:locaura_parter/Retailer/features/store/presentation/controllers/store_controller.dart';
import 'package:locaura_parter/Retailer/features/store/domain/entities/store.entity.dart';

class InventoryTab extends ConsumerStatefulWidget {
  const InventoryTab({super.key});

  @override
  ConsumerState<InventoryTab> createState() => _InventoryTabState();
}

class _InventoryTabState extends ConsumerState<InventoryTab> {
  StoreEntity? _selectedStore;

  final currencyFormatter = NumberFormat.currency(
    locale: 'en_IN',
    symbol: '₹',
    decimalDigits: 0,
  );

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(storeControllerProvider.notifier).fetchMyStores();
    });
  }

  Future<void> _toggleOnlineStatus(String id) async {
    if (_selectedStore == null) return;
    // We can rely on the controller logic which toggles the status and refreshes the list
    await ref
        .read(storeControllerProvider.notifier)
        .toggleOnlineStatus(_selectedStore!.id);
  }

  @override
  Widget build(BuildContext context) {
    final storeState = ref.watch(storeControllerProvider);

    ref.listen(storeControllerProvider, (previous, next) {
      next.maybeWhen(
        success: (stores) {
          if (stores.isNotEmpty) {
            if (_selectedStore == null) {
              // Initial load
              setState(() => _selectedStore = stores.first);
              ref
                  .read(productControllerProvider.notifier)
                  .fetchStoreProducts(stores.first.id);
            } else {
              // Synchronize _selectedStore with updated data from the list
              final updatedStore = stores.firstWhere(
                (s) => s.id == _selectedStore!.id,
                orElse: () => stores.first,
              );
              if (_selectedStore != updatedStore) {
                setState(() => _selectedStore = updatedStore);
              }
            }
          }
        },
        orElse: () {},
      );
    });

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FB),
      body: SafeArea(
        child: storeState.maybeWhen(
          success: (stores) {
            if (stores.isEmpty) return _buildEmptyState(context);
            // Ensure we have a selection if logic above missed it for some reason
            _selectedStore ??= stores.first;

            return CustomScrollView(
              slivers: [
                _buildHeader(context, stores),
                SliverToBoxAdapter(child: SizedBox(height: 16.h)),
                ..._buildProducts(context),
                // SliverToBoxAdapter(child: SizedBox(height: 16.h)),
                // _buildSalesOverview(context),
                SliverToBoxAdapter(child: SizedBox(height: 16.h)),
                _buildRecentOrdersHeader(context),
                _buildRecentOrdersList(context),
                SliverToBoxAdapter(
                  child: SizedBox(height: 100.h),
                ), // For padding/FAB
              ],
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (msg) => _buildErrorState(context, msg),
          orElse: () => const Center(child: CircularProgressIndicator()),
        ),
      ),
      floatingActionButton: _buildDualFAB(context),
    );
  }

  List<Widget> _buildProducts(BuildContext context) {
    return [
      SliverPadding(
        padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 8.h),
        sliver: SliverToBoxAdapter(
          child: Text(
            'Products',
            style: AppTextStyles.titleMedium,
          ),
        ),
      ),
      ref
          .watch(productControllerProvider)
          .maybeWhen(
            success: (products) => SliverPadding(
              padding: EdgeInsets.symmetric(horizontal: 20.w),
              sliver: products.isEmpty
                  ? SliverToBoxAdapter(child: Text('No products', style: AppTextStyles.bodyMedium))
                  : SliverGrid(
                      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        crossAxisSpacing: 12.w,
                        mainAxisSpacing: 12.h,
                        childAspectRatio: 0.8, // Adjust to fit image + texts
                      ),
                      delegate: SliverChildBuilderDelegate((context, index) {
                        final product = products[index];
                        return GestureDetector(
                          onTap: () {
                            if (_selectedStore != null) {
                              context.push(
                                AppRoutes.productForm.replaceAll(':storeId', _selectedStore!.id),
                                extra: product.id,
                              );
                            }
                          },
                          child: Container(
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(12.r),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.05),
                                  blurRadius: 10,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Expanded(
                                  child: ClipRRect(
                                    borderRadius: BorderRadius.vertical(
                                      top: Radius.circular(12.r),
                                    ),
                                    child: AppImage(
                                      imageUrl: product.coverImages.isNotEmpty
                                          ? product.coverImages.first
                                          : null,
                                      height: 150.h,
                                      width: double.infinity,
                                      fit: BoxFit.cover,
                                    ),
                                  ),
                                ),
                                Padding(
                                  padding: EdgeInsets.all(8.w),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Expanded(
                                            child: Text(
                                              product.name,
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                              style: AppTextStyles.bodyMedium.copyWith(color: Colors.black, fontWeight: FontWeight.bold),
                                            ),
                                          ),
                                          Consumer(
                                            builder: (context, ref, child) => PopupMenuButton<String>(
                                              icon: const Icon(Icons.more_vert, size: 16, color: Colors.grey),
                                              padding: EdgeInsets.zero,
                                              constraints: const BoxConstraints(),
                                              onSelected: (value) {
                                                ref.read(productControllerProvider.notifier).updateExistingProduct(
                                                      _selectedStore!.id,
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
                                      SizedBox(height: 2.h),
                                      Row(
                                        children: [
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                                            decoration: BoxDecoration(
                                              color: product.status == 'active' ? Colors.green.shade50 : Colors.orange.shade50,
                                              borderRadius: BorderRadius.circular(4.r),
                                            ),
                                            child: Text(
                                              product.status.toUpperCase(),
                                              style: TextStyle(
                                                fontSize: 8.sp,
                                                fontWeight: FontWeight.bold,
                                                color: product.status == 'active' ? Colors.green.shade700 : Colors.orange.shade700,
                                              ),
                                            ),
                                          ),
                                          const Spacer(),
                                          Text(
                                            'Stock: ${product.totalStock}',
                                            style: AppTextStyles.labelSmall.copyWith(fontSize: 9.sp, color: Colors.grey),
                                          ),
                                        ],
                                      ),
                                      SizedBox(height: 4.h),
                                      Text.rich(
                                        TextSpan(
                                          children: [
                                            if (product.baseCompareAtPrice != null && product.baseCompareAtPrice! > 0)
                                              TextSpan(
                                                text: '${currencyFormatter.format(product.basePrice)} ',
                                                style: AppTextStyles.labelSmall.copyWith(
                                                  color: Colors.grey.shade500,
                                                  decoration: TextDecoration.lineThrough,
                                                ),
                                              ),
                                            TextSpan(
                                              text: product.baseCompareAtPrice != null && product.baseCompareAtPrice! > 0
                                                  ? currencyFormatter.format(product.baseCompareAtPrice)
                                                  : currencyFormatter.format(product.basePrice),
                                              style: AppTextStyles.labelMedium.copyWith(
                                                color: const Color(0xFFFA641E),
                                                fontWeight: FontWeight.w900,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      }, childCount: products.length),
                    ),
            ),
            orElse: () => const SliverToBoxAdapter(child: SizedBox.shrink()),
          ),
      SliverToBoxAdapter(child: SizedBox(height: 16.h)),
    ];
  }

  Widget _buildHeader(BuildContext context, List<StoreEntity> stores) {
    return SliverToBoxAdapter(
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 8.h),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                GestureDetector(
                  onTap: () => _toggleOnlineStatus(_selectedStore!.id),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 300),
                    padding: EdgeInsets.symmetric(
                      horizontal: 12.w,
                      vertical: 4.h,
                    ),
                    decoration: BoxDecoration(
                      color: _selectedStore!.isActive
                          ? const Color(0xFF00BFA5)
                          : Colors.grey.shade400,
                      borderRadius: BorderRadius.circular(20.r),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          _selectedStore!.isActive ? 'online' : 'offline',
                          style: AppTextStyles.labelSmall.copyWith(color: Colors.white),
                        ),
                        SizedBox(width: 4.w),
                        AnimatedAlign(
                          duration: const Duration(milliseconds: 200),
                          alignment: _selectedStore!.isActive
                              ? Alignment.centerRight
                              : Alignment.centerLeft,
                          child: Container(
                            width: 14.w,
                            height: 14.w,
                            decoration: const BoxDecoration(
                              color: Colors.white,
                              shape: BoxShape.circle,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const Spacer(),
                IconButton(
                  icon: const Icon(
                    Icons.notifications_none,
                    color: Colors.black,
                  ),
                  onPressed: () {},
                ),
                IconButton(
                  icon: const Icon(Icons.search, color: Colors.black),
                  onPressed: () {},
                ),
              ],
            ),
            SizedBox(height: 12.h),
            PopupMenuButton<StoreEntity>(
              offset: Offset(0, 48.h),
              onSelected: (store) {
                setState(() => _selectedStore = store);
                ref
                    .read(productControllerProvider.notifier)
                    .fetchStoreProducts(store.id);
              },
              itemBuilder: (context) => stores
                  .map((s) => PopupMenuItem(value: s, child: Text(s.storeName)))
                  .toList(),
              child: Row(
                children: [
                  Container(
                    width: 40.w,
                    height: 40.w,
                    decoration: BoxDecoration(
                      color: const Color(0xFFE3F2FD),
                      borderRadius: BorderRadius.circular(8.r),
                    ),
                    child: const Icon(
                      Icons.storefront,
                      color: Color(0xFF1976D2),
                    ),
                  ),
                  SizedBox(width: 12.w),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(
                              _selectedStore?.storeName ?? 'Select Hub',
                              style: AppTextStyles.titleMedium.copyWith(fontWeight: FontWeight.bold),
                            ),
                            Icon(Icons.keyboard_arrow_down, size: 20.sp),
                          ],
                        ),
                        Text(
                          'Merchant ID: #${_selectedStore?.id.substring(0, 5) ?? '00000'}',
                          style: AppTextStyles.bodySmall.copyWith(color: Colors.grey.shade500),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStats(BuildContext context) {
    return SliverToBoxAdapter(
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 20.w),
        child: Row(
          children: [
            _buildStatCard(
              context,
              'ACTIVE ORDERS',
              '128',
              '+12% vs last week',
              const Color(0xFFE8F1FF),
              const Color(0xFF0D47A1),
              Icons.local_shipping_outlined,
            ),
            SizedBox(width: 16.w),
            _buildStatCard(
              context,
              'PENDING',
              '₹4,250',
              '+5% expected today',
              const Color(0xFFFFF4E8),
              const Color(0xFFE65100),
              Icons.assignment_late_outlined,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(
    BuildContext context,
    String label,
    String value,
    String trend,
    Color bgColor,
    Color textColor,
    IconData icon,
  ) {
    return Expanded(
      child: Container(
        padding: EdgeInsets.all(16.w),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(16.r),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, size: 16.sp, color: textColor),
                SizedBox(width: 8.w),
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 10.sp,
                    color: textColor.withOpacity(0.8),
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            SizedBox(height: 8.h),
            Text(
              value,
              style: TextStyle(
                fontSize: 22.sp,
                fontWeight: FontWeight.bold,
                color: Colors.black87,
              ),
            ),
            SizedBox(height: 4.h),
            Row(
              children: [
                Icon(Icons.trending_up, size: 12.sp, color: Colors.green),
                SizedBox(width: 4.w),
                Text(
                  trend,
                  style: TextStyle(fontSize: 9.sp, color: Colors.grey.shade600),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSalesOverview(BuildContext context) {
    return SliverToBoxAdapter(
      child: Container(
        margin: EdgeInsets.symmetric(horizontal: 20.w),
        padding: EdgeInsets.all(20.w),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20.r),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Total Sales Overview',
                  style: TextStyle(
                    fontSize: 14.sp,
                    color: Colors.grey.shade500,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE8F5E9),
                    borderRadius: BorderRadius.circular(6.r),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.arrow_upward,
                        size: 12.sp,
                        color: Colors.green,
                      ),
                      SizedBox(width: 4.w),
                      Text(
                        '18.5%',
                        style: TextStyle(
                          color: Colors.green,
                          fontSize: 11.sp,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            SizedBox(height: 4.h),
            Text(
              '₹1,24,500',
              style: TextStyle(fontSize: 28.sp, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 24.h),
            SizedBox(
              height: 150.h,
              child: LineChart(
                LineChartData(
                  gridData: const FlGridData(show: false),
                  titlesData: FlTitlesData(
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        getTitlesWidget: (value, meta) {
                          const titles = ['WEEK 1', 'EEK 2', 'EEK 3', 'EEK 4'];
                          if (value % 2 == 0 && value < titles.length * 2) {
                            return Padding(
                              padding: EdgeInsets.only(top: 8.h),
                              child: Text(
                                titles[(value / 2).floor()],
                                style: TextStyle(
                                  color: Colors.grey,
                                  fontSize: 10.sp,
                                ),
                              ),
                            );
                          }
                          return const SizedBox();
                        },
                      ),
                    ),
                    leftTitles: const AxisTitles(
                      sideTitles: SideTitles(showTitles: false),
                    ),
                    topTitles: const AxisTitles(
                      sideTitles: SideTitles(showTitles: false),
                    ),
                    rightTitles: const AxisTitles(
                      sideTitles: SideTitles(showTitles: false),
                    ),
                  ),
                  borderData: FlBorderData(show: false),
                  lineBarsData: [
                    LineChartBarData(
                      isCurved: true,
                      color: const Color(0xFF1976D2),
                      barWidth: 3,
                      dotData: const FlDotData(show: false),
                      spots: const [
                        FlSpot(0, 1),
                        FlSpot(1, 1.8),
                        FlSpot(2, 1.2),
                        FlSpot(3, 2.5),
                        FlSpot(4, 1.5),
                        FlSpot(5, 3),
                        FlSpot(6, 1),
                        FlSpot(7, 2.2),
                      ],
                      belowBarData: BarAreaData(
                        show: true,
                        gradient: LinearGradient(
                          colors: [
                            const Color(0xFF1976D2).withOpacity(0.3),
                            const Color(0xFF1976D2).withOpacity(0.0),
                          ],
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRecentOrdersHeader(BuildContext context) {
    return SliverToBoxAdapter(
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 20.w),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Icon(
                  Icons.assignment_outlined,
                  size: 20.sp,
                  color: const Color(0xFF1976D2),
                ),
                SizedBox(width: 8.w),
                Text(
                  'Recent Orders',
                  style: AppTextStyles.titleSmall,
                ),
              ],
            ),
            TextButton(
              onPressed: () {},
              child: Text(
                'View All',
                style: AppTextStyles.labelLarge.copyWith(color: const Color(0xFF1976D2)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRecentOrdersList(BuildContext context) {
    final mockOrders = [
      {
        'title': 'Sporty Red Sneakers',
        'id': '#ORD-9910',
        'time': '30 mins ago',
        'price': '₹1,299',
        'status': 'SHIPPED',
        'color': Color(0xFFE8F5E9),
        'iconColor': Color(0xFF4CAF50),
      },
      {
        'title': 'Minimalist Analog Watch',
        'id': '#ORD-9910',
        'time': '1 hour ago',
        'price': '₹2,450',
        'status': 'SHIPPED',
        'color': Color(0xFFE8F5E9),
        'iconColor': Color(0xFF4CAF50),
      },
    ];

    return SliverList(
      delegate: SliverChildBuilderDelegate((context, index) {
        final order = mockOrders[index];
        return Container(
          margin: EdgeInsets.symmetric(horizontal: 20.w, vertical: 8.h),
          padding: EdgeInsets.all(12.w),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16.r),
          ),
          child: Row(
            children: [
              Container(
                width: 60.w,
                height: 60.w,
                decoration: BoxDecoration(
                  color: Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(12.r),
                ),
                child: const Icon(Icons.image_outlined, color: Colors.grey),
              ),
              SizedBox(width: 12.w),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      order['title'] as String,
                      style: AppTextStyles.titleSmall,
                    ),
                    Text(
                      'Order ${order['id']} • ${order['time']}',
                      style: AppTextStyles.bodySmall.copyWith(color: Colors.grey.shade500),
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    order['price'] as String,
                    style: AppTextStyles.titleSmall,
                  ),
                  Container(
                    padding: EdgeInsets.symmetric(
                      horizontal: 6.w,
                      vertical: 2.h,
                    ),
                    decoration: BoxDecoration(
                      color: order['color'] as Color,
                      borderRadius: BorderRadius.circular(4.r),
                    ),
                    child: Text(
                      order['status'] as String,
                      style: AppTextStyles.labelSmall.copyWith(
                        color: order['iconColor'] as Color,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      }, childCount: mockOrders.length),
    );
  }

  Widget _buildDualFAB(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        FloatingActionButton.extended(
          heroTag: 'upload_product',
          onPressed: () {
            if (_selectedStore != null) {
              context.push(
                AppRoutes.productForm.replaceAll(':storeId', _selectedStore!.id),
              );
            } else {
              context.showSnackbar('Please select a store first to add products', isError: true);
            }
          },
          backgroundColor: const Color(0xFF0D47A1),
          foregroundColor: Colors.white,
          elevation: 4,
          icon: const Icon(Icons.add_circle_outline),
          label: Text('Upload New Product', style: AppTextStyles.labelLarge.copyWith(color: Colors.white)),
        ),
        SizedBox(height: 12.h),
        FloatingActionButton.extended(
          heroTag: 'new_store',
          onPressed: () => context.push(AppRoutes.registerStore),
          backgroundColor: const Color(0xFF0D47A1),
          foregroundColor: Colors.white,
          elevation: 4,
          icon: const Icon(Icons.add_circle_outline),
          label: Text('New Store', style: AppTextStyles.labelLarge.copyWith(color: Colors.white)),
        ),
      ],
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.storefront, size: 64, color: Colors.grey),
          SizedBox(height: AppSizes.s16.h),
          Text('No stores found', style: context.textTheme.titleMedium),
          SizedBox(height: AppSizes.s16.h),
          ElevatedButton(
            onPressed: () => context.push(AppRoutes.registerStore),
            child: const Text('Register Your First Store'),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(BuildContext context, String msg) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(msg, style: const TextStyle(color: Colors.red)),
          SizedBox(height: 16.h),
          ElevatedButton(
            onPressed: () =>
                ref.read(storeControllerProvider.notifier).fetchMyStores(),
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }
}
