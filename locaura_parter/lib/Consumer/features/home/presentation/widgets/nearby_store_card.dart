import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../../core/theme/app_colors.dart';
import '../../domain/entities/nearby_store.entity.dart';

class NearbyStoreCard extends StatelessWidget {
  final NearbyStoreEntity store;
  final VoidCallback onTap;

  const NearbyStoreCard({super.key, required this.store, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.all(12.w),
        decoration: BoxDecoration(
          color: AppColors.cream,
          borderRadius: BorderRadius.circular(12.r),
        ),
        child: Row(
          children: [
            // Store Image Placeholder or Banner
            Container(
              width: 60.w,
              height: 60.w,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8.r),
                border: Border.all(color: AppColors.grey200),
              ),
              child: store.banner_url != null && store.banner_url!.isNotEmpty
                  ? ClipRRect(
                      borderRadius: BorderRadius.circular(8.r),
                      child: Image.network(
                        store.banner_url!,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Icon(Icons.storefront_outlined, color: AppColors.grey400, size: 28.sp),
                      ),
                    )
                  : Icon(Icons.storefront_outlined, color: AppColors.grey400, size: 28.sp),
            ),
            SizedBox(width: 12.w),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          store.name,
                          style: GoogleFonts.inter(fontSize: 14.sp, fontWeight: FontWeight.w700, color: AppColors.charcoal),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Container(
                        padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 2.h),
                        decoration: BoxDecoration(
                          color: AppColors.gold.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(4.r),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.star_rounded, color: AppColors.charcoal, size: 12.sp),
                            SizedBox(width: 2.w),
                            Text(
                              store.rating.toStringAsFixed(1),
                              style: GoogleFonts.inter(fontSize: 10.sp, fontWeight: FontWeight.w700, color: AppColors.charcoal),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 2.h),
                  Text(
                    store.categories.join(' • '),
                    style: GoogleFonts.inter(fontSize: 11.sp, color: AppColors.grey500),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  SizedBox(height: 6.h),
                  Row(
                    children: [
                      Icon(Icons.schedule_rounded, size: 12.sp, color: AppColors.charcoal),
                      SizedBox(width: 4.w),
                      Text(
                        '${store.estimated_delivery_time_min ?? 30} min',
                        style: GoogleFonts.inter(fontSize: 10.sp, color: AppColors.charcoal, fontWeight: FontWeight.w500),
                      ),
                      SizedBox(width: 12.w),
                      Icon(Icons.location_on_outlined, size: 12.sp, color: AppColors.charcoal),
                      SizedBox(width: 4.w),
                      Text(
                        store.distanceKm != null ? '${store.distanceKm!.toStringAsFixed(1)} km' : 'Near you',
                        style: GoogleFonts.inter(fontSize: 10.sp, color: AppColors.charcoal, fontWeight: FontWeight.w500),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
