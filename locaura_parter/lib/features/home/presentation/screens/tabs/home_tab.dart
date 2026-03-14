import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:locaura_parter/core/extensions/context_extensions.dart';
import 'package:locaura_parter/core/router/app_router.dart';
import 'package:locaura_parter/core/utils/app_sizes.dart';
import 'package:locaura_parter/features/store/presentation/controllers/store_controller.dart';

class HomeTab extends ConsumerWidget {
  const HomeTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // We still watch authState to ensure we are authenticated, 
    // but we use storeController for the list.
    final storeState = ref.watch(storeControllerProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Stores'),
      ),
      body: RefreshIndicator(
        onRefresh: () =>
            ref.read(storeControllerProvider.notifier).fetchMyStores(),
        child: storeState.maybeWhen(
          success: (stores) => stores.isEmpty
              ? _buildEmptyState(context)
              : _buildStoreList(context, ref, stores),
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (msg) => Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(msg, style: const TextStyle(color: Colors.red)),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () => ref
                      .read(storeControllerProvider.notifier)
                      .fetchMyStores(),
                  child: const Text('Retry'),
                ),
              ],
            ),
          ),
          orElse: () {
            // Initial state - trigger fetch
            WidgetsBinding.instance.addPostFrameCallback((_) {
              ref.read(storeControllerProvider.notifier).fetchMyStores();
            });
            return const Center(child: CircularProgressIndicator());
          },
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push(AppRoutes.registerStore),
        label: const Text('Add Store'),
        icon: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.storefront, size: 64, color: Colors.grey),
          const SizedBox(height: AppSizes.s16),
          Text('No stores found', style: context.textTheme.titleMedium),
          const SizedBox(height: AppSizes.s16),
          ElevatedButton(
            onPressed: () => context.push(AppRoutes.registerStore),
            child: const Text('Register Your First Store'),
          ),
        ],
      ),
    );
  }

  Widget _buildStoreList(
    BuildContext context,
    WidgetRef ref,
    List<dynamic> stores,
  ) {
    return ListView.builder(
      padding: const EdgeInsets.all(AppSizes.pagePaddingH),
      itemCount: stores.length,
      itemBuilder: (context, index) {
        final store = stores[index];
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
              store.storeName,
              style: context.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            subtitle: Text('Status: ${store.status.toUpperCase()}'),
            trailing: PopupMenuButton<String>(
              itemBuilder: (context) => [
                const PopupMenuItem(value: 'edit', child: Text('Edit')),
                const PopupMenuItem(value: 'delete', child: Text('Delete')),
              ],
              onSelected: (value) {
                if (value == 'edit') {
                  context.push(AppRoutes.editStore.replaceAll(':id', store.id));
                } else if (value == 'delete') {
                  _showDeleteDialog(context, ref, store.id, store.storeName);
                }
              },
            ),
            onTap: () {
              context.push(
                AppRoutes.productList.replaceAll(':storeId', store.id),
              );
            },
          ),
        );
      },
    );
  }

  void _showDeleteDialog(
    BuildContext context,
    WidgetRef ref,
    String id,
    String name,
  ) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Store'),
        content: Text(
          'Are you sure you want to delete "$name"? This action cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('CANCEL'),
          ),
          TextButton(
            onPressed: () {
              ref
                  .read(storeControllerProvider.notifier)
                  .deleteExistingStore(id);
              Navigator.pop(context);
            },
            child: const Text('DELETE', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }
}
