import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../../core/theme/app_colors.dart';
import '../../../../../core/router/app_router.dart';
import '../../../home/presentation/providers/home_provider.dart';
import '../../../home/presentation/widgets/nearby_store_card.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class BrowseScreen extends ConsumerStatefulWidget {
  const BrowseScreen({super.key});

  @override
  ConsumerState<BrowseScreen> createState() => _BrowseScreenState();
}

class _BrowseScreenState extends ConsumerState<BrowseScreen> {
  final _searchCtrl = TextEditingController();

  // Removed mock products, using homeNotifierProvider for stores

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final homeState = ref.watch(homeNotifierProvider);

    return Scaffold(
      backgroundColor: AppColors.offWhite,
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(),
            _buildFilterRow(),
            Expanded(
              child: homeState.isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : _buildStoreGrid(homeState.nearbyStores),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: EdgeInsets.fromLTRB(16.w, 16.h, 16.w, 8.h),
      child: Row(
        children: [
          Expanded(
            child: Container(
              height: 48.h,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12.r),
                border: Border.all(color: AppColors.grey200),
              ),
              child: TextField(
                controller: _searchCtrl,
                style: GoogleFonts.inter(fontSize: 14.sp, color: AppColors.charcoal),
                decoration: InputDecoration(
                  hintText: 'Search products, brands, stores',
                  hintStyle: GoogleFonts.inter(fontSize: 14.sp, color: AppColors.grey400),
                  prefixIcon: Icon(Icons.search, color: AppColors.grey500),
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.symmetric(vertical: 14.h),
                ),
              ),
            ),
          ),
          SizedBox(width: 12.w),
          Container(
            height: 48.h,
            width: 48.w,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12.r),
              border: Border.all(color: AppColors.grey200),
            ),
            child: Icon(Icons.tune_rounded, color: AppColors.charcoal, size: 24.sp),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterRow() {
    final filters = ['All', 'Clothes', 'Footwear', 'Accessories', 'Beauty'];
    return SizedBox(
      height: 40.h,
      child: ListView.separated(
        padding: EdgeInsets.symmetric(horizontal: 16.w),
        scrollDirection: Axis.horizontal,
        itemCount: filters.length,
        separatorBuilder: (_, __) => SizedBox(width: 8.w),
        itemBuilder: (context, index) {
          final isSelected = index == 0;
          return Chip(
            label: Text(
              filters[index],
              style: GoogleFonts.inter(
                fontSize: 13.sp,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                color: isSelected ? Colors.white : AppColors.charcoal,
              ),
            ),
            backgroundColor: isSelected ? AppColors.charcoal : Colors.white,
            side: BorderSide(color: isSelected ? AppColors.charcoal : AppColors.grey200),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20.r)),
            materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
          );
        },
      ),
    );
  }

  Widget _buildStoreGrid(List<dynamic> stores) {
    if (stores.isEmpty) {
      return Center(
        child: Text(
          'No stores found matching your criteria',
          style: GoogleFonts.inter(color: AppColors.grey500),
        ),
      );
    }

    return ListView.builder(
      padding: EdgeInsets.all(16.w),
      itemCount: stores.length,
      itemBuilder: (context, index) {
        final store = stores[index];
        return Padding(
          padding: EdgeInsets.only(bottom: 12.h),
          child: NearbyStoreCard(
            store: store,
            onTap: () => context.push(
              AppRoutes.consumerStoreProducts.replaceAll(':storeId', store.id),
            ),
          ),
        );
      },
    );
  }
}
