import 'package:flutter/material.dart';
import 'app_colors.dart';
import 'app_text_styles.dart';

abstract class AppTheme {
  static ThemeData get light => ThemeData(
        useMaterial3: true,
        brightness: Brightness.light,
        colorScheme: const ColorScheme.light(
          primary: AppColors.primary,
          onPrimary: AppColors.white,
          secondary: AppColors.primaryLight,
          error: AppColors.error,
          surface: AppColors.white,
          onSurface: AppColors.grey900,
        ),
        scaffoldBackgroundColor: AppColors.grey50,
        textTheme: TextTheme(
          displayLarge: AppTextStyles.displayLarge.copyWith(color: AppColors.grey900),
          displayMedium: AppTextStyles.displayMedium.copyWith(color: AppColors.grey900),
          headlineLarge: AppTextStyles.headlineLarge.copyWith(color: AppColors.grey900),
          headlineMedium: AppTextStyles.headlineMedium.copyWith(color: AppColors.grey900),
          headlineSmall: AppTextStyles.headlineSmall.copyWith(color: AppColors.grey900),
          titleLarge: AppTextStyles.titleLarge.copyWith(color: AppColors.grey900),
          titleMedium: AppTextStyles.titleMedium.copyWith(color: AppColors.grey800),
          titleSmall: AppTextStyles.titleSmall.copyWith(color: AppColors.grey800),
          bodyLarge: AppTextStyles.bodyLarge.copyWith(color: AppColors.grey800),
          bodyMedium: AppTextStyles.bodyMedium.copyWith(color: AppColors.grey700),
          bodySmall: AppTextStyles.bodySmall.copyWith(color: AppColors.grey600),
          labelLarge: AppTextStyles.labelLarge.copyWith(color: AppColors.grey900),
          labelMedium: AppTextStyles.labelMedium.copyWith(color: AppColors.grey700),
          labelSmall: AppTextStyles.labelSmall.copyWith(color: AppColors.grey600),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: AppColors.white,
          foregroundColor: AppColors.grey900,
          elevation: 0,
          centerTitle: true,
          surfaceTintColor: Colors.transparent,
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: AppColors.white,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.grey200),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.grey200),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.primary, width: 2),
          ),
          errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.error),
          ),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            foregroundColor: AppColors.white,
            minimumSize: const Size(double.infinity, 52),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            textStyle: AppTextStyles.labelLarge,
          ),
        ),
      );

  static ThemeData get dark => ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        colorScheme: const ColorScheme.dark(
          primary: AppColors.primaryLight,
          onPrimary: AppColors.white,
          secondary: AppColors.primary,
          error: AppColors.error,
          surface: AppColors.darkSurface,
          onSurface: AppColors.grey100,
        ),
        scaffoldBackgroundColor: AppColors.darkBackground,
        appBarTheme: const AppBarTheme(
          backgroundColor: AppColors.darkSurface,
          foregroundColor: AppColors.grey100,
          elevation: 0,
          centerTitle: true,
          surfaceTintColor: Colors.transparent,
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: AppColors.darkSurface,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.darkSurfaceVariant),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.darkSurfaceVariant),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.primaryLight, width: 2),
          ),
          errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.error),
          ),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primaryLight,
            foregroundColor: AppColors.white,
            minimumSize: const Size(double.infinity, 52),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            textStyle: AppTextStyles.labelLarge,
          ),
        ),
      );
}