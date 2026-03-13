import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/utils/app_validators.dart';

class OtpInputWidget extends StatelessWidget {
  final TextEditingController controller;
  const OtpInputWidget({super.key, required this.controller});

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      keyboardType: TextInputType.number,
      maxLength: 6,
      inputFormatters: [FilteringTextInputFormatter.digitsOnly],
      validator: AppValidators.otp,
      obscureText: false,
      decoration: const InputDecoration(
        counterText: '',
        hintText: '• • • • • •',
      ),
    );
  }
}
