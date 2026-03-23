import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'package:flutter_screenutil/flutter_screenutil.dart';

class MainDashboardScreen extends StatelessWidget {
  final StatefulNavigationShell navigationShell;

  const MainDashboardScreen({
    super.key,
    required this.navigationShell,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: Container(
        margin: EdgeInsets.fromLTRB(24.w, 0, 24.w, 24.h),
        height: 64.h,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(32.r),
          border: Border.all(color: Colors.grey.shade200),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            _buildNavItem(0, Icons.home, Icons.home_outlined, 'Home'),
            _buildNavItem(1, Icons.shopping_bag, Icons.shopping_bag_outlined, 'Orders'),
            _buildNavItem(2, Icons.inventory_2, Icons.inventory_2_outlined, 'Inventory'),
            _buildNavItem(3, Icons.person, Icons.person_outline, 'Profile'),
          ],
        ),
      ),
    );
  }

  Widget _buildNavItem(int index, IconData selectedIcon, IconData icon, String label) {
    final isSelected = navigationShell.currentIndex == index;
    return GestureDetector(
      onTap: () => navigationShell.goBranch(index, initialLocation: index == navigationShell.currentIndex),
      behavior: HitTestBehavior.opaque,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            isSelected ? selectedIcon : icon,
            color: isSelected ? Colors.black : Colors.grey.shade400,
            size: 24.sp,
          ),
          SizedBox(height: 4.h),
          Text(
            label,
            style: TextStyle(
              color: isSelected ? Colors.black : Colors.grey.shade400,
              fontSize: 10.sp,
              fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
            ),
          ),
        ],
      ),
    );
  }
}

