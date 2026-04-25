import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../../core/theme/app_colors.dart';
import '../../../../../core/router/app_router.dart';
import 'package:locaura_parter/Retailer/features/auth/presentation/controllers/auth_controller.dart';
import '../widgets/nearby_store_card.dart';
import '../../domain/entities/nearby_store.entity.dart';
import '../providers/home_provider.dart';
class ConsumerHomeScreen extends ConsumerStatefulWidget {
  const ConsumerHomeScreen({super.key});

  @override
  ConsumerState<ConsumerHomeScreen> createState() => _ConsumerHomeScreenState();
}

class _ConsumerHomeScreenState extends ConsumerState<ConsumerHomeScreen> {
  final ScrollController _scrollCtrl = ScrollController();
  bool _isScrolled = false;

  // Removed mock data, now using homeNotifierProvider

  @override
  void initState() {
    super.initState();
    _scrollCtrl.addListener(() {
      final scrolled = _scrollCtrl.offset > 40;
      if (scrolled != _isScrolled) setState(() => _isScrolled = scrolled);
    });
  }

  @override
  void dispose() {
    _scrollCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final homeState = ref.watch(homeNotifierProvider);
    return Scaffold(
      backgroundColor: AppColors.offWhite,
      body: homeState.isLoading 
          ? const Center(child: CircularProgressIndicator()) 
          : CustomScrollView(
              controller: _scrollCtrl,
              slivers: [
                _buildAppBar(homeState),
                SliverToBoxAdapter(child: _buildBody(homeState)),
              ],
            ),
    );
  }

  Widget _buildAppBar(HomeState state) {
    return SliverAppBar(
      floating: true,
      backgroundColor: Colors.white,
      elevation: _isScrolled ? 4 : 0,
      automaticallyImplyLeading: false,
      toolbarHeight: 100.h,
      flexibleSpace: FlexibleSpaceBar(
        background: Container(
          color: Colors.white,
          padding: EdgeInsets.symmetric(horizontal: 16.w).copyWith(top: MediaQuery.of(context).padding.top + 8.h),
          child: Column(
            children: [
              // Row 1: Deliver to
              Row(
                children: [
                  Icon(Icons.location_on_outlined, size: 16.sp, color: AppColors.charcoal),
                  SizedBox(width: 4.w),
                  Expanded(
                    child: InkWell(
                      onTap: () => context.push(AppRoutes.location),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'DELIVER TO ·',
                            style: GoogleFonts.inter(fontSize: 9.sp, color: AppColors.grey500, letterSpacing: 0.8),
                          ),
                          Consumer(
                            builder: (context, ref, _) {
                              final authState = ref.watch(authControllerProvider);
                              final address = authState.maybeWhen(
                                consumerAuthenticated: (c) => c.selectedAddress,
                                orElse: () => null,
                              );
                              return Text(
                                address != null ? '${address.label} (${address.line1})' : 'Select Location',
                                style: GoogleFonts.inter(fontSize: 12.sp, fontWeight: FontWeight.w600, color: AppColors.charcoal),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              );
                            },
                          ),
                        ],
                      ),
                    ),
                  ),
                  Icon(Icons.favorite_border_rounded, size: 22.sp, color: AppColors.grey600),
                  SizedBox(width: 12.w),
                  Icon(Icons.person_outline_rounded, size: 22.sp, color: AppColors.grey600),
                ],
              ),
              SizedBox(height: 10.h),
              // Row 2: Search bar
              Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () => context.push(AppRoutes.browse),
                      child: Container(
                        height: 40.h,
                        decoration: BoxDecoration(
                          color: AppColors.cream,
                          borderRadius: BorderRadius.circular(10.r),
                        ),
                        padding: EdgeInsets.symmetric(horizontal: 12.w),
                        child: Row(
                          children: [
                            Icon(Icons.search, size: 18.sp, color: AppColors.grey500),
                            SizedBox(width: 8.w),
                            Text(
                              'Search curated luxury...',
                              style: GoogleFonts.inter(fontSize: 13.sp, color: AppColors.grey400),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  SizedBox(width: 10.w),
                  Container(
                    width: 40.w,
                    height: 40.h,
                    decoration: BoxDecoration(
                      color: AppColors.cream,
                      borderRadius: BorderRadius.circular(10.r),
                    ),
                    child: Icon(Icons.qr_code_scanner_rounded, size: 18.sp, color: AppColors.charcoal),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBody(HomeState state) {
    if (state.error != null) {
      return Center(
        child: Padding(
          padding: EdgeInsets.all(24.0),
          child: Text('Error: ${state.error}', style: GoogleFonts.inter(color: Colors.red)),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(height: 12.h),
        Padding(
          padding: EdgeInsets.symmetric(horizontal: 16.w),
          child: _buildHeroBanner(),
        ),
        SizedBox(height: 24.h),
        _buildNearbyStores(state.nearbyStores),
        SizedBox(height: 80.h),
      ],
    );
  }

  Widget _buildHeroBanner() {
    return Container(
      width: double.infinity,
      height: 190.h,
      decoration: BoxDecoration(
        color: AppColors.charcoal,
        borderRadius: BorderRadius.circular(16.r),
      ),
      child: Stack(
        children: [
          // Subtle pattern overlay
          Positioned.fill(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(16.r),
              child: CustomPaint(painter: _PatternPainter()),
            ),
          ),
          Padding(
            padding: EdgeInsets.all(20.w),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 3.h),
                      decoration: BoxDecoration(
                        color: AppColors.gold,
                        borderRadius: BorderRadius.circular(4.r),
                      ),
                      child: Text(
                        'EXCLUSIVE',
                        style: GoogleFonts.inter(fontSize: 9.sp, fontWeight: FontWeight.w700, color: AppColors.charcoal, letterSpacing: 1),
                      ),
                    ),
                    SizedBox(width: 8.w),
                    Expanded(child: Divider(color: Colors.white.withOpacity(0.2), height: 1)),
                  ],
                ),
                SizedBox(height: 8.h),
                Text(
                  'Instant Delivery',
                  style: GoogleFonts.inter(fontSize: 22.sp, fontWeight: FontWeight.w700, color: Colors.white, height: 1.1),
                ),
                Text(
                  'on Fashion',
                  style: GoogleFonts.inter(fontSize: 22.sp, fontWeight: FontWeight.w700, color: AppColors.gold, height: 1.1),
                ),
                SizedBox(height: 4.h),
                Text(
                  'Essentials at your doorstep in 30 mins',
                  style: GoogleFonts.inter(fontSize: 10.sp, color: Colors.white.withOpacity(0.7)),
                ),
                SizedBox(height: 12.h),
                GestureDetector(
                  onTap: () => context.push(AppRoutes.browse),
                  child: Container(
                    padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
                    decoration: BoxDecoration(
                      color: AppColors.gold,
                      borderRadius: BorderRadius.circular(8.r),
                    ),
                    child: Text(
                      'Shop Collection',
                      style: GoogleFonts.inter(fontSize: 11.sp, fontWeight: FontWeight.w600, color: AppColors.charcoal),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNearbyStores(List<NearbyStoreEntity> stores) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: EdgeInsets.symmetric(horizontal: 16.w),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Top Stores Near You',
                    style: GoogleFonts.inter(fontSize: 16.sp, fontWeight: FontWeight.w700, color: AppColors.charcoal),
                  ),
                  Text(
                    'Exclusive partners in your area',
                    style: GoogleFonts.inter(fontSize: 11.sp, color: AppColors.grey500),
                  ),
                ],
              ),
              TextButton(
                onPressed: () => context.push(AppRoutes.browse),
                child: Text(
                  'View All',
                  style: GoogleFonts.inter(fontSize: 12.sp, color: AppColors.charcoal, fontWeight: FontWeight.w600),
                ),
              ),
            ],
          ),
        ),
        SizedBox(height: 12.h),
        if (stores.isEmpty)
          Center(
            child: Padding(
              padding: EdgeInsets.all(24.0),
              child: Text('No stores found near your location.', style: GoogleFonts.inter(color: AppColors.grey500)),
            ),
          )
        else
          ...stores.map(
            (store) => Padding(
              padding: EdgeInsets.fromLTRB(16.w, 0, 16.w, 12.h),
              child: NearbyStoreCard(
                store: store,
                onTap: () => context.push(
                  AppRoutes.consumerStoreProducts.replaceAll(':storeId', store.id),
                ),
              ),
            ),
          ),
      ],
    );
  }
}

// Removed _CategoryItem in favor of CategoryEntity

// Simple subtle grid pattern
class _PatternPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withOpacity(0.03)
      ..strokeWidth = 1
      ..style = PaintingStyle.stroke;
    const spacing = 30.0;
    for (double x = 0; x < size.width; x += spacing) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }
    for (double y = 0; y < size.height; y += spacing) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
