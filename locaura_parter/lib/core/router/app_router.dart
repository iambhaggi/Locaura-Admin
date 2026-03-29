import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:locaura_parter/Retailer/features/auth/domain/entities/retailer.entity.dart';
import '../../Retailer/features/auth/presentation/controllers/auth_controller.dart';
import '../utils/app_constants.dart';
import '../../Retailer/features/auth/presentation/screens/phone_screen.dart';
import '../../Retailer/features/auth/presentation/screens/otp_screen.dart';
import '../../Retailer/features/home/presentation/screens/main_dashboard_screen.dart';
import '../../Retailer/features/home/presentation/screens/tabs/inventory_tab.dart';
import '../../Retailer/features/home/presentation/screens/tabs/orders_tab.dart';
import '../../Retailer/features/home/presentation/screens/tabs/home_tab.dart';
import '../../Retailer/features/home/presentation/screens/tabs/profile_tab.dart';
import '../../Retailer/features/store/presentation/screens/store_form_screen.dart';
import '../../Retailer/features/product/presentation/screens/product_list_screen.dart';
import '../../Retailer/features/product/presentation/screens/product_form_screen.dart';
import '../../Retailer/features/auth/presentation/screens/edit_profile_screen.dart';
import '../../Consumer/features/shell/consumer_shell_screen.dart';
import '../../Consumer/features/home/presentation/screens/consumer_home_screen.dart';
import '../../Consumer/features/browse/presentation/screens/browse_screen.dart';
import '../../Consumer/features/product/presentation/screens/consumer_product_detail_screen.dart';
import '../../Consumer/features/cart/presentation/screens/cart_screen.dart';
import '../../Consumer/features/checkout/presentation/screens/checkout_screen.dart';
import '../../Consumer/features/checkout/presentation/screens/order_confirmation_screen.dart';
import '../../Consumer/features/browse/presentation/screens/consumer_store_products_screen.dart';
import '../../Consumer/features/location/presentation/screens/location_screen.dart';
import '../../Consumer/features/profile/presentation/screens/consumer_profile_screen.dart';
import '../../Consumer/features/profile/presentation/screens/edit_consumer_profile_screen.dart';



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
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString(AppConstants.accessTokenKey);
      final actorType = prefs.getString(AppConstants.actorTypeKey);
      final isAuthenticated = token != null;
      final isOnAuth = state.matchedLocation == AppRoutes.phone ||
          state.matchedLocation == AppRoutes.otp;

      if (!isAuthenticated && !isOnAuth) return AppRoutes.phone;
      
      if (isAuthenticated) {
        if (isOnAuth) {
          if (actorType == AppConstants.actorConsumer) return AppRoutes.consumerHome;
          return AppRoutes.home;
        }
        
        // If authenticated but on the wrong entry point, fix it
        if (actorType == AppConstants.actorConsumer && state.matchedLocation == AppRoutes.home) {
          return AppRoutes.consumerHome;
        }
        if (actorType == AppConstants.actorRetailer && state.matchedLocation == AppRoutes.consumerHome) {
          return AppRoutes.home;
        }

        // Consumer location enforcement
        // if (actorType == AppConstants.actorConsumer) {
        //   final authState = ref.read(authControllerProvider);
        //   final isLocationSet = authState.maybeWhen(
        //     consumerAuthenticated: (consumer) => consumer.selectedAddress != null,
        //     orElse: () => false,
        //   );
        //   final isOnLocation = state.matchedLocation == AppRoutes.location;
        //   if (!isLocationSet && !isOnLocation && !isOnAuth) {
        //     return AppRoutes.location;
        //   }
        // }
      }
      
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
          final extra = state.extra as Map<String, dynamic>;
          return OtpScreen(
            phone: extra['phone'] as String,
            actorType: extra['actorType'] as String? ?? AppConstants.actorConsumer,
          );
        },
      ),
      GoRoute(
        path: AppRoutes.registerStore,
        name: 'registerStore',
        builder: (context, state) {
          final id = state.extra as String?;
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
                path: AppRoutes.inventory,
                name: 'inventory',
                builder: (_, __) => const InventoryTab(),
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
              GoRoute(
                path: AppRoutes.editProfile,
                name: 'editProfile',
                builder: (context, state) {
                  final extra = state.extra;
                  RetailerEntity? retailer;
                  if (extra is RetailerEntity) {
                    retailer = extra;
                  } else if (extra is Map<String, dynamic>) {
                    retailer = RetailerEntity.fromJson(extra);
                  }

                  if (retailer == null) {
                    return const Scaffold(
                      body: Center(child: Text('Error: No retailer data found')),
                    );
                  }
                  return EditProfileScreen(retailer: retailer);
                },
              ),
            ],
          ),
        ],
      ),
      // ── Consumer Shell ──
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return ConsumerShellScreen(navigationShell: navigationShell);
        },
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.consumerHome,
                name: 'consumerHome',
                builder: (_, __) => const ConsumerHomeScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.browse,
                name: 'browse',
                builder: (_, __) => const BrowseScreen(),
              ),
              GoRoute(
                path: AppRoutes.consumerStoreProducts,
                name: 'consumerStoreProducts',
                builder: (context, state) {
                  final storeId = state.pathParameters['storeId']!;
                  return ConsumerStoreProductsScreen(storeId: storeId);
                },
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.consumerCart,
                name: 'consumerCart',
                builder: (_, __) => const CartScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.consumerProfile,
                name: 'consumerProfile',
                builder: (_, __) => const ConsumerProfileScreen(),
              ),
              GoRoute(
                path: AppRoutes.consumerEditProfile,
                name: 'consumerEditProfile',
                builder: (_, __) => const EditConsumerProfileScreen(),
              ),
            ],
          ),
        ],
      ),
      GoRoute(
        path: AppRoutes.consumerProductDetail,
        name: 'consumerProductDetail',
        builder: (context, state) {
          final productId = state.pathParameters['id']!;
          return ConsumerProductDetailScreen(productId: productId);
        },
      ),
      GoRoute(
        path: AppRoutes.checkout,
        name: 'checkout',
        builder: (_, __) => const CheckoutScreen(),
      ),
      GoRoute(
        path: AppRoutes.orderConfirmation,
        name: 'orderConfirmation',
        builder: (context, state) {
          final orderId = state.extra as String? ?? '';
          return OrderConfirmationScreen(orderId: orderId);
        },
      ),
      GoRoute(
        path: AppRoutes.location,
        name: 'location',
        builder: (_, __) => const LocationScreen(),
      ),
    ],
  );
});

abstract class AppRoutes {
  // Shared auth
  static const phone = '/auth/phone';
  static const otp = '/auth/otp';

  // Retailer
  static const home = '/home';
  static const orders = '/orders';
  static const inventory = '/inventory';
  static const profile = '/profile';
  static const registerStore = '/store/register';
  static const editStore = '/store/edit/:id';
  static const productList = '/store/:storeId/products';
  static const productForm = '/store/:storeId/product-form';
  static const editProfile = '/profile/edit';

  // Consumer
  static const consumerHome = '/consumer/home';
  static const browse = '/consumer/browse';
  static const consumerStoreProducts = '/consumer/store/:storeId/products';
  static const consumerCart = '/consumer/cart';
  static const consumerProfile = '/consumer/profile';
  static const consumerProductDetail = '/consumer/product/:id';
  static const checkout = '/consumer/checkout';
  static const orderConfirmation = '/consumer/order-confirmation';
  static const location = '/consumer/location';
  static const consumerEditProfile = '/consumer/profile/edit';
}