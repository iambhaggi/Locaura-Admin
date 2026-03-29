import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../../core/theme/app_colors.dart';

class CategoryChipWidget extends StatelessWidget {
  final String label;
  final String? iconUrl;
  
  const CategoryChipWidget({
    super.key,
    required this.label,
    this.iconUrl,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          width: 56.w,
          height: 56.w,
          decoration: BoxDecoration(
            color: Colors.white,
            shape: BoxShape.circle,
            border: Border.all(color: AppColors.grey200),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.02),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: iconUrl != null && iconUrl!.isNotEmpty 
              ? ClipOval(
                  child: Image.network(
                    iconUrl!,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Icon(Icons.category_rounded, color: AppColors.charcoal, size: 24.sp),
                  ),
                )
              : Icon(Icons.category_rounded, color: AppColors.charcoal, size: 24.sp),
        ),
        SizedBox(height: 8.h),
        Text(
          label,
          style: GoogleFonts.inter(fontSize: 11.sp, color: AppColors.charcoal),
        ),
      ],
    );
  }
}
