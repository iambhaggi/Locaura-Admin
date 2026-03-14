import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:locaura_parter/core/extensions/context_extensions.dart';
import 'package:locaura_parter/core/utils/app_sizes.dart';
import 'package:locaura_parter/features/auth/presentation/controllers/auth_controller.dart';

class ProfileTab extends ConsumerWidget {
  const ProfileTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authControllerProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: authState.maybeWhen(
        authenticated: (retailer) => ListView(
          padding: const EdgeInsets.all(AppSizes.pagePaddingH),
          children: [
            const Center(
              child: CircleAvatar(
                radius: 50,
                child: Icon(Icons.person, size: 50),
              ),
            ),
            const SizedBox(height: AppSizes.s24),
            Text(
              retailer.retailerName ?? 'Retailer',
              textAlign: TextAlign.center,
              style: context.textTheme.headlineSmall,
            ),
            Text(
              retailer.phone,
              textAlign: TextAlign.center,
              style: context.textTheme.bodyMedium?.copyWith(color: Colors.grey),
            ),
            const SizedBox(height: AppSizes.s32),
            Card(
              child: Column(
                children: [
                  ListTile(
                    leading: const Icon(Icons.email_outlined),
                    title: const Text('Email'),
                    subtitle: Text(retailer.email ?? 'Not set'),
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: const Icon(Icons.verified_user_outlined),
                    title: const Text('Verification'),
                    subtitle: Text(
                      retailer.phoneVerified ? 'Phone Verified' : 'Phone Not Verified',
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSizes.s32),
            ElevatedButton.icon(
              onPressed: () {
                ref.read(authControllerProvider.notifier).logout();
              },
              icon: const Icon(Icons.logout),
              label: const Text('Logout'),
              style: ElevatedButton.styleFrom(
                backgroundColor: context.colorScheme.errorContainer,
                foregroundColor: context.colorScheme.onErrorContainer,
              ),
            ),
          ],
        ),
        orElse: () => const SizedBox.shrink(),
      ),
    );
  }
}
