import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:locaura_parter/core/extensions/context_extensions.dart';
import 'package:locaura_parter/core/router/app_router.dart';
import 'package:locaura_parter/core/utils/app_sizes.dart';
import 'package:locaura_parter/features/store/presentation/controllers/store_controller.dart';
import 'package:locaura_parter/features/store/domain/entities/store.entity.dart';

class HomeTab extends ConsumerStatefulWidget {
  const HomeTab({super.key});

  @override
  ConsumerState<HomeTab> createState() => _HomeTabState();
}

class _HomeTabState extends ConsumerState<HomeTab> {
  bool _isOnline = true;
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

  @override
  Widget build(BuildContext context) {
    final storeState = ref.watch(storeControllerProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FB),
      body: SafeArea(
        child: storeState.maybeWhen(
          success: (stores) {
            if (stores.isEmpty) return _buildEmptyState(context);
            _selectedStore ??= stores.first;

            return CustomScrollView(
              slivers: [
                _buildHeader(context, stores),
                SliverToBoxAdapter(child: SizedBox(height: 16.h)),
                // _buildStats(context),
                SliverToBoxAdapter(child: SizedBox(height: 16.h)),
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
                  onTap: () => setState(() => _isOnline = !_isOnline),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 300),
                    padding: EdgeInsets.symmetric(
                      horizontal: 12.w,
                      vertical: 4.h,
                    ),
                    decoration: BoxDecoration(
                      color: _isOnline
                          ? const Color(0xFF00BFA5)
                          : Colors.grey.shade400,
                      borderRadius: BorderRadius.circular(20.r),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          _isOnline ? 'online' : 'offline',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 12.sp,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        SizedBox(width: 4.w),
                        AnimatedAlign(
                          duration: const Duration(milliseconds: 200),
                          alignment: _isOnline
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
              onSelected: (store) => setState(() => _selectedStore = store),
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
                              style: TextStyle(
                                fontSize: 18.sp,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Icon(Icons.keyboard_arrow_down, size: 20.sp),
                          ],
                        ),
                        Text(
                          'Merchant ID: #${_selectedStore?.id.substring(0, 5) ?? '00000'}',
                          style: TextStyle(
                            fontSize: 12.sp,
                            color: Colors.grey.shade500,
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
                  style: TextStyle(
                    fontSize: 16.sp,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            TextButton(
              onPressed: () {},
              child: Text(
                'View All',
                style: TextStyle(
                  color: const Color(0xFF1976D2),
                  fontSize: 14.sp,
                ),
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
                      style: TextStyle(
                        fontSize: 14.sp,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      'Order ${order['id']} • ${order['time']}',
                      style: TextStyle(
                        fontSize: 11.sp,
                        color: Colors.grey.shade500,
                      ),
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    order['price'] as String,
                    style: TextStyle(
                      fontSize: 14.sp,
                      fontWeight: FontWeight.bold,
                    ),
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
                      style: TextStyle(
                        fontSize: 10.sp,
                        color: order['iconColor'] as Color,
                        fontWeight: FontWeight.bold,
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
          onPressed: () {},
          backgroundColor: const Color(0xFF0D47A1),
          foregroundColor: Colors.white,
          elevation: 4,
          icon: const Icon(Icons.add_circle_outline),
          label: const Text('Upload New Product'),
        ),
        SizedBox(height: 12.h),
        FloatingActionButton.extended(
          heroTag: 'new_store',
          onPressed: () => context.push(AppRoutes.registerStore),
          backgroundColor: const Color(0xFF0D47A1),
          foregroundColor: Colors.white,
          elevation: 4,
          icon: const Icon(Icons.add_circle_outline),
          label: const Text(
            'New Store          ',
          ), // Spacing to match widths approx
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
