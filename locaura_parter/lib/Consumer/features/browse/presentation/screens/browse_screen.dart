import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../../core/theme/app_colors.dart';
import '../../../../../core/router/app_router.dart';
import '../../../home/presentation/providers/home_provider.dart';
import '../../../home/presentation/widgets/nearby_store_card.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/search_provider.dart';

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
    final searchState = ref.watch(searchNotifierProvider);
    final homeState = ref.watch(homeNotifierProvider);

    return Scaffold(
      backgroundColor: AppColors.offWhite,
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(),
            _buildFilterRow(),
            Expanded(
              child: _buildSearchResults(searchState, homeState),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchResults(SearchState searchState, dynamic homeState) {
    if (searchState.isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (searchState.error != null) {
      return Center(child: Text(searchState.error!, style: const TextStyle(color: Colors.red)));
    }

    // If search is active (query has been typed)
    if (_searchCtrl.text.trim().isNotEmpty) {
      if (searchState.stores.isEmpty && searchState.products.isEmpty) {
        return Center(
          child: Text(
            'No results found for "${_searchCtrl.text}"',
            style: GoogleFonts.inter(color: AppColors.grey500),
          ),
        );
      }

      return ListView(
        padding: EdgeInsets.all(16.w),
        children: [
          if (searchState.stores.isNotEmpty) ...[
            _buildSectionHeader('Stores'),
            ...searchState.stores.map((store) => Padding(
                  padding: EdgeInsets.only(bottom: 12.h),
                  child: NearbyStoreCard(
                    store: store,
                    onTap: () => context.push(
                      AppRoutes.consumerStoreProducts.replaceAll(':storeId', store.id),
                    ),
                  ),
                )),
          ],
          if (searchState.products.isNotEmpty) ...[
            SizedBox(height: 16.h),
            _buildSectionHeader('Products'),
            _buildProductList(searchState.products),
          ],
        ],
      );
    }

    // Default view: Nearby stores
    return homeState.isLoading
        ? const Center(child: CircularProgressIndicator())
        : _buildStoreGrid(homeState.nearbyStores);
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: EdgeInsets.only(bottom: 12.h),
      child: Text(
        title,
        style: GoogleFonts.inter(
          fontSize: 16.sp,
          fontWeight: FontWeight.w700,
          color: AppColors.charcoal,
        ),
      ),
    );
  }

  Widget _buildProductList(List<dynamic> products) {
    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: products.length,
      separatorBuilder: (_, __) => SizedBox(height: 12.h),
      itemBuilder: (context, index) {
        final product = products[index];
        return InkWell(
          onTap: () => context.push(
            AppRoutes.consumerProductDetail.replaceAll(':id', product['_id']),
          ),
          child: Container(
            padding: EdgeInsets.all(12.w),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12.r),
              border: Border.all(color: AppColors.grey200),
            ),
            child: Row(
              children: [
                Container(
                  width: 70.w,
                  height: 70.w,
                  decoration: BoxDecoration(
                    color: AppColors.grey100,
                    borderRadius: BorderRadius.circular(12.r),
                    image: product['cover_images'] != null && (product['cover_images'] as List).isNotEmpty
                        ? DecorationImage(
                            image: NetworkImage(product['cover_images'][0]),
                            fit: BoxFit.cover,
                          )
                        : null,
                  ),
                  child: product['cover_images'] == null || (product['cover_images'] as List).isEmpty
                      ? Icon(Icons.shopping_bag_outlined, size: 28.sp, color: AppColors.grey400)
                      : null,
                ),
                SizedBox(width: 12.w),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        product['name'] ?? '',
                        style: GoogleFonts.inter(fontSize: 14.sp, fontWeight: FontWeight.bold, color: AppColors.charcoal),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      Row(
                        children: [
                          Icon(Icons.storefront, size: 12.sp, color: AppColors.grey500),
                          SizedBox(width: 4.w),
                          Expanded(
                            child: Text(
                              product['store_id'] != null ? product['store_id']['store_name'] : (product['brand'] ?? ''),
                              style: GoogleFonts.inter(fontSize: 12.sp, color: AppColors.grey500),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                      SizedBox(height: 4.h),
                      Row(
                        children: [
                          Text(
                            '₹${product['base_price']}',
                            style: GoogleFonts.inter(
                              fontSize: 15.sp,
                              fontWeight: FontWeight.w900,
                              color: Theme.of(context).colorScheme.primary,
                            ),
                          ),
                          if (product['base_compare_at_price'] != null && product['base_compare_at_price'] > product['base_price']) ...[
                            SizedBox(width: 8.w),
                            Text(
                              '₹${product['base_compare_at_price']}',
                              style: GoogleFonts.inter(
                                fontSize: 12.sp,
                                color: AppColors.grey400,
                                decoration: TextDecoration.lineThrough,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),
                Icon(Icons.chevron_right, color: AppColors.grey300),
              ],
            ),
          ),
        );
      },
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
                onChanged: (value) => ref.read(searchNotifierProvider.notifier).search(value),
                style: GoogleFonts.inter(fontSize: 14.sp, color: AppColors.charcoal),
                decoration: InputDecoration(
                  hintText: 'Search products, brands, stores',
                  hintStyle: GoogleFonts.inter(fontSize: 14.sp, color: AppColors.grey400),
                  prefixIcon: Icon(Icons.search, color: AppColors.grey500),
                  suffixIcon: _searchCtrl.text.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear),
                          onPressed: () {
                            _searchCtrl.clear();
                            ref.read(searchNotifierProvider.notifier).search('');
                          },
                        )
                      : null,
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
