import 'package:dio/dio.dart';
import 'package:get_it/get_it.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../network/api_client.dart';
import '../../features/auth/data/datasources/auth_remote_datasource.dart';
import '../../features/auth/data/repositories/auth_repository_impl.dart';
import '../../features/auth/domain/repositories/auth_repository.dart';

final getIt = GetIt.instance;

Future<void> configureDependencies() async {
  // External
  final prefs = await SharedPreferences.getInstance();
  getIt.registerSingleton<SharedPreferences>(prefs);
  getIt.registerSingleton<FlutterSecureStorage>(const FlutterSecureStorage());

  // Network
  getIt.registerSingleton<ApiClient>(ApiClient());
  getIt.registerSingleton<Dio>(getIt<ApiClient>().dio);

  // Auth
  getIt.registerSingleton<AuthRemoteDataSource>(
    AuthRemoteDataSource(getIt<Dio>()),
  );
  getIt.registerSingleton<AuthRepository>(
    AuthRepositoryImpl(
      getIt<AuthRemoteDataSource>(),
      getIt<FlutterSecureStorage>(),
      getIt<SharedPreferences>(),
    ),
  );
}