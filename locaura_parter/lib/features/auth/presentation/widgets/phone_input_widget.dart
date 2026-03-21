import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../../core/utils/app_validators.dart';
import '../../../../core/extensions/context_extensions.dart';

class PhoneInputWidget extends StatelessWidget {
  final TextEditingController controller;
  const PhoneInputWidget({super.key, required this.controller});

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      keyboardType: TextInputType.phone,
      maxLength: 10,
      inputFormatters: [FilteringTextInputFormatter.digitsOnly],
      validator: AppValidators.phone,
      style: context.textTheme.bodyLarge?.copyWith(
        fontWeight: FontWeight.w500,
      ),
      decoration: InputDecoration(
        contentPadding: EdgeInsets.symmetric(vertical: 16.h),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.all(Radius.circular(30.r)),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.all(Radius.circular(30.r)),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.all(Radius.circular(30.r)),
          borderSide: const BorderSide(color: Color(0xFF0056D2)),
        ),
        counterText: '',
        prefixIcon: Container(
          padding: EdgeInsets.only(left: 16.w, right: 8.w),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('🇮🇳', style: TextStyle(fontSize: 20.sp)),
              SizedBox(width: 4.w),
              Text(
                '+91',
                style: context.textTheme.bodyLarge?.copyWith(
                  fontWeight: FontWeight.w500,
                ),
              ),
              Icon(Icons.keyboard_arrow_down, size: 20.sp, color: Colors.grey),
              SizedBox(width: 8.w),
              Container(
                height: 24.h,
                width: 1,
                color: Colors.grey.shade300,
              ),
              SizedBox(width: 8.w),
            ],
          ),
        ),
        hintText: 'Enter phone number',
        hintStyle: context.textTheme.bodyLarge?.copyWith(
          color: Colors.grey.shade400,
        ),
      ),
    );
  }
}

