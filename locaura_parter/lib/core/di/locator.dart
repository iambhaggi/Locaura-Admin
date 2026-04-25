import 'package:dio/dio.dart';
import 'package:get_it/get_it.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../network/api_client.dart';
import '../../Retailer/features/auth/data/datasources/auth_remote_datasource.dart';
import '../../Retailer/features/auth/data/repositories/auth_repository_impl.dart';
import '../../Retailer/features/auth/domain/repositories/auth_repository.dart';
import '../../Retailer/features/store/data/datasources/store_remote_datasource.dart';
import '../../Retailer/features/store/data/repositories/store_repository_impl.dart';
import '../../Retailer/features/store/domain/repositories/store_repository.dart';
import '../../Retailer/features/store/domain/usecases/store_usecases.dart';
import '../../Retailer/features/product/data/datasources/product_remote_datasource.dart';
import '../../Retailer/features/product/data/repositories/product_repository_impl.dart';
import '../../Retailer/features/product/domain/repositories/product_repository.dart';
import '../../Retailer/features/product/domain/usecases/product_usecases.dart';
import '../../Consumer/features/cart/data/repositories/cart_repository.dart';

final getIt = GetIt.instance;

Future<void> configureDependencies() async {
  final prefs = await SharedPreferences.getInstance();
  getIt.registerSingleton<SharedPreferences>(prefs);

  getIt.registerSingleton<ApiClient>(ApiClient());
  getIt.registerSingleton<Dio>(getIt<ApiClient>().dio);

  getIt.registerSingleton<AuthRemoteDataSource>(
    AuthRemoteDataSource(getIt<Dio>()),
  );
  getIt.registerSingleton<AuthRepository>(
    AuthRepositoryImpl(
      getIt<AuthRemoteDataSource>(),
      getIt<SharedPreferences>(),
      CartRepository(getIt<ApiClient>()),
    ),
  );

  getIt.registerLazySingleton<StoreRemoteDataSource>(
    () => StoreRemoteDataSource(getIt<Dio>()),
  );
  getIt.registerLazySingleton<StoreRepository>(
    () => StoreRepositoryImpl(getIt<StoreRemoteDataSource>()),
  );

  getIt.registerLazySingleton<RegisterStore>(() => RegisterStore(getIt<StoreRepository>()));
  getIt.registerLazySingleton<GetMyStores>(() => GetMyStores(getIt<StoreRepository>()));
  getIt.registerLazySingleton<GetStoreDetails>(() => GetStoreDetails(getIt<StoreRepository>()));
  getIt.registerLazySingleton<UpdateStore>(() => UpdateStore(getIt<StoreRepository>()));
  getIt.registerLazySingleton<DeleteStore>(() => DeleteStore(getIt<StoreRepository>()));

  getIt.registerLazySingleton<ProductRemoteDataSource>(
    () => ProductRemoteDataSource(getIt<Dio>()),
  );
  getIt.registerLazySingleton<ProductRepository>(
    () => ProductRepositoryImpl(getIt<ProductRemoteDataSource>()),
  );

  getIt.registerLazySingleton<CreateProduct>(() => CreateProduct(getIt<ProductRepository>()));
  getIt.registerLazySingleton<GetStoreProducts>(() => GetStoreProducts(getIt<ProductRepository>()));
  getIt.registerLazySingleton<GetProductDetails>(() => GetProductDetails(getIt<ProductRepository>()));
  getIt.registerLazySingleton<UpdateProduct>(() => UpdateProduct(getIt<ProductRepository>()));
  getIt.registerLazySingleton<DeleteProduct>(() => DeleteProduct(getIt<ProductRepository>()));

  getIt.registerLazySingleton<CreateVariant>(() => CreateVariant(getIt<ProductRepository>()));
  getIt.registerLazySingleton<GetProductVariants>(() => GetProductVariants(getIt<ProductRepository>()));
  getIt.registerLazySingleton<GetVariantDetails>(() => GetVariantDetails(getIt<ProductRepository>()));
  getIt.registerLazySingleton<UpdateVariant>(() => UpdateVariant(getIt<ProductRepository>()));
  getIt.registerLazySingleton<DeleteVariant>(() => DeleteVariant(getIt<ProductRepository>()));
}
