import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:locaura_parter/Consumer/features/auth/domain/entities/consumer.entity.dart';
import 'package:shared_preferences/shared_preferences.dart';

final locationProvider = StateNotifierProvider<LocationNotifier, LocationState>((ref) {
  return LocationNotifier();
});

class LocationState {
  final AddressEntity? selectedAddress;
  final List<AddressEntity> addresses;
  final bool isLoading;

  LocationState({
    this.selectedAddress,
    this.addresses = const [],
    this.isLoading = false,
  });

  LocationState copyWith({
    AddressEntity? selectedAddress,
    List<AddressEntity>? addresses,
    bool? isLoading,
  }) {
    return LocationState(
      selectedAddress: selectedAddress ?? this.selectedAddress,
      addresses: addresses ?? this.addresses,
      isLoading: isLoading ?? this.isLoading,
    );
  }
}

class LocationNotifier extends StateNotifier<LocationState> {
  LocationNotifier() : super(LocationState()) {
    _loadFromPrefs();
  }

  static const _selectedAddressKey = 'selected_address';

  Future<void> _loadFromPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    final addressJson = prefs.getString(_selectedAddressKey);
    if (addressJson != null) {
      try {
        final address = AddressEntity.fromJson(jsonDecode(addressJson));
        state = state.copyWith(selectedAddress: address);
      } catch (_) {
        // Handle parse error
      }
    }
  }

  Future<void> selectAddress(AddressEntity address) async {
    state = state.copyWith(selectedAddress: address);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_selectedAddressKey, jsonEncode(address.toJson()));
  }

  Future<void> clearAddress() async {
    state = state.copyWith(selectedAddress: null);
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_selectedAddressKey);
  }

  void setAddresses(List<AddressEntity> addresses) {
    state = state.copyWith(addresses: addresses);
    // If we have no selected address but have a default one in the list, auto-select it
    if (state.selectedAddress == null && addresses.isNotEmpty) {
      final defaultAddr = addresses.firstWhere((a) => a.isDefault, orElse: () => addresses.first);
      selectAddress(defaultAddr);
    }
  }
}
