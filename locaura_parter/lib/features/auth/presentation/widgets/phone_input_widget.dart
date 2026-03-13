import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/utils/app_validators.dart';

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
      decoration: const InputDecoration(
        counterText: '',
        prefixText: '+91  ',
        hintText: '98765 43210',
      ),
    );
  }
}