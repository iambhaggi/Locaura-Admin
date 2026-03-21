import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../features/auth/presentation/controllers/auth_controller.dart';
import '../utils/app_constants.dart';
import '../../features/auth/presentation/screens/phone_screen.dart';
import '../../features/auth/presentation/screens/otp_screen.dart';
import '../../features/home/presentation/screens/main_dashboard_screen.dart';
import '../../features/home/presentation/screens/tabs/home_tab.dart';
import '../../features/home/presentation/screens/tabs/orders_tab.dart';
import '../../features/home/presentation/screens/tabs/analytics_tab.dart';
import '../../features/home/presentation/screens/tabs/profile_tab.dart';
import '../../features/store/presentation/screens/store_form_screen.dart';
import '../../features/product/presentation/screens/product_list_screen.dart';
import '../../features/product/presentation/screens/product_form_screen.dart';

class RouterNotifier extends ChangeNotifier {
  final Ref _ref;

  RouterNotifier(this._ref) {
    _ref.listen<AuthState>(
      authControllerProvider,
      (previous, next) {
        if (previous != next) {
          notifyListeners();
        }
      },
    );
  }
}

final routerNotifierProvider = Provider<RouterNotifier>((ref) {
  return RouterNotifier(ref);
});

final appRouterProvider = Provider<GoRouter>((ref) {
  final notifier = ref.watch(routerNotifierProvider);

  return GoRouter(
    initialLocation: AppRoutes.home,
    refreshListenable: notifier,
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
        path: AppRoutes.registerStore,
        name: 'registerStore',
        builder: (_, __) => const StoreFormScreen(),
      ),
      GoRoute(
        path: AppRoutes.editStore,
        name: 'editStore',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return StoreFormScreen(storeId: id);
        },
      ),
      GoRoute(
        path: AppRoutes.productList,
        name: 'productList',
        builder: (context, state) {
          final storeId = state.pathParameters['storeId']!;
          return ProductListScreen(storeId: storeId);
        },
      ),
      GoRoute(
        path: AppRoutes.productForm,
        name: 'productForm',
        builder: (context, state) {
          final storeId = state.pathParameters['storeId']!;
          final productId = state.extra as String?;
          return ProductFormScreen(storeId: storeId, productId: productId);
        },
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return MainDashboardScreen(navigationShell: navigationShell);
        },
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.home,
                name: 'home',
                builder: (_, __) => const HomeTab(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.orders,
                name: 'orders',
                builder: (_, __) => const OrdersTab(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.analytics,
                name: 'analytics',
                builder: (_, __) => const AnalyticsTab(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.profile,
                name: 'profile',
                builder: (_, __) => const ProfileTab(),
              ),
            ],
          ),
        ],
      ),
    ],
  );
});


abstract class AppRoutes {
  static const phone = '/auth/phone';
  static const otp = '/auth/otp';
  static const home = '/home';
  static const orders = '/orders';
  static const analytics = '/analytics';
  static const profile = '/profile';
  static const registerStore = '/store/register';
  static const editStore = '/store/edit/:id';
  static const productList = '/store/:storeId/products';
  static const productForm = '/store/:storeId/product-form';
}