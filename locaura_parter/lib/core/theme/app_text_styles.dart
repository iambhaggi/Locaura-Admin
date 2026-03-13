import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

abstract class AppTextStyles {
  static TextStyle displayLarge = TextStyle(
    fontSize: 57.sp,
    fontWeight: FontWeight.w700,
    letterSpacing: -0.25,
    height: 1.12,
  );

  static TextStyle displayMedium = TextStyle(
    fontSize: 45.sp,
    fontWeight: FontWeight.w700,
    letterSpacing: 0,
    height: 1.16,
  );

  static TextStyle headlineLarge = TextStyle(
    fontSize: 32.sp,
    fontWeight: FontWeight.w700,
    letterSpacing: 0,
    height: 1.25,
  );

  static TextStyle headlineMedium = TextStyle(
    fontSize: 28.sp,
    fontWeight: FontWeight.w600,
    letterSpacing: 0,
    height: 1.29,
  );

  static TextStyle headlineSmall = TextStyle(
    fontSize: 24.sp,
    fontWeight: FontWeight.w600,
    letterSpacing: 0,
    height: 1.33,
  );

  static TextStyle titleLarge = TextStyle(
    fontSize: 22.sp,
    fontWeight: FontWeight.w600,
    letterSpacing: 0,
    height: 1.27,
  );

  static TextStyle titleMedium = TextStyle(
    fontSize: 16.sp,
    fontWeight: FontWeight.w500,
    letterSpacing: 0.15,
    height: 1.5,
  );

  static TextStyle titleSmall = TextStyle(
    fontSize: 14.sp,
    fontWeight: FontWeight.w500,
    letterSpacing: 0.1,
    height: 1.43,
  );

  static TextStyle bodyLarge = TextStyle(
    fontSize: 16.sp,
    fontWeight: FontWeight.w400,
    letterSpacing: 0.5,
    height: 1.5,
  );

  static TextStyle bodyMedium = TextStyle(
    fontSize: 14.sp,
    fontWeight: FontWeight.w400,
    letterSpacing: 0.25,
    height: 1.43,
  );

  static TextStyle bodySmall = TextStyle(
    fontSize: 12.sp,
    fontWeight: FontWeight.w400,
    letterSpacing: 0.4,
    height: 1.33,
  );

  static TextStyle labelLarge = TextStyle(
    fontSize: 14.sp,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.1,
    height: 1.43,
  );

  static TextStyle labelMedium = TextStyle(
    fontSize: 12.sp,
    fontWeight: FontWeight.w500,
    letterSpacing: 0.5,
    height: 1.33,
  );

  static TextStyle labelSmall = TextStyle(
    fontSize: 11.sp,
    fontWeight: FontWeight.w500,
    letterSpacing: 0.5,
    height: 1.45,
  );
}