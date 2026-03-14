import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:locaura_parter/core/extensions/context_extensions.dart';
import 'package:locaura_parter/core/utils/app_sizes.dart';
import 'package:locaura_parter/features/auth/presentation/controllers/auth_controller.dart';

class HomeTab extends ConsumerWidget {
  const HomeTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authControllerProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Stores'),
      ),
      body: authState.maybeWhen(
        authenticated: (retailer) => retailer.stores.isEmpty
            ? Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.storefront, size: 64, color: Colors.grey),
                    const SizedBox(height: AppSizes.s16),
                    Text(
                      'No stores found',
                      style: context.textTheme.titleMedium,
                    ),
                  ],
                ),
              )
            : ListView.builder(
                padding: const EdgeInsets.all(AppSizes.pagePaddingH),
                itemCount: retailer.stores.length,
                itemBuilder: (context, index) {
                  final store = retailer.stores[index];
                  return Card(
                    margin: const EdgeInsets.only(bottom: AppSizes.s16),
                    child: ListTile(
                      leading: CircleAvatar(
                        backgroundColor: context.colorScheme.primaryContainer,
                        child: Icon(
                          Icons.store,
                          color: context.colorScheme.onPrimaryContainer,
                        ),
                      ),
                      title: Text(
                        store.name,
                        style: context.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      subtitle: Text('Status: ${store.status.toUpperCase()}'),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () {
                        // Navigate to store details
                      },
                    ),
                  );
                },
              ),
        orElse: () => const Center(child: CircularProgressIndicator()),
      ),
    );
  }
}
