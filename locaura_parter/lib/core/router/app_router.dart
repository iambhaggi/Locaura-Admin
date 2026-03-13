import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../utils/app_constants.dart';
import '../../features/auth/presentation/screens/phone_screen.dart';
import '../../features/auth/presentation/screens/otp_screen.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: AppRoutes.phone,
    redirect: (context, state) async {
      const storage = FlutterSecureStorage();
      final token = await storage.read(key: AppConstants.accessTokenKey);
      final isAuthenticated = token != null;
      final isOnAuth = state.matchedLocation == AppRoutes.phone ||
          state.matchedLocation == AppRoutes.otp;

      if (!isAuthenticated && !isOnAuth) return AppRoutes.phone;
      if (isAuthenticated && isOnAuth) return AppRoutes.home;
      return null;
    },
    routes: [
      GoRoute(
        path: AppRoutes.phone,
        name: 'phone',
        builder: (_, __) => const PhoneScreen(),
      ),
      GoRoute(
        path: AppRoutes.otp,
        name: 'otp',
        builder: (context, state) {
          final phone = state.extra as String;
          return OtpScreen(phone: phone);
        },
      ),
      GoRoute(
        path: AppRoutes.home,
        name: 'home',
        builder: (_, __) => const Scaffold(
          body: Center(child: Text('Home — wire your screen here')),
        ),
      ),
    ],
  );
});

abstract class AppRoutes {
  static const phone = '/auth/phone';
  static const otp = '/auth/otp';
  static const home = '/home';
}