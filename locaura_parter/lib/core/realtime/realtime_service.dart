import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:logger/logger.dart';

final realtimeServiceProvider = Provider<RealtimeService>((ref) {
  return RealtimeService();
});

class RealtimeService {
  final _logger = Logger();
  IO.Socket? _socket;
  final _fcm = FirebaseMessaging.instance;
  final _localNotifications = FlutterLocalNotificationsPlugin();

  // Streams for UI to listen to
  final _orderStreamController = StreamController<Map<String, dynamic>>.broadcast();
  Stream<Map<String, dynamic>> get orderStream => _orderStreamController.stream;

  Future<void> initialize({required String baseUrl, required String token}) async {
    _setupFCM();
    _setupSocket(baseUrl, token);
    await _setupLocalNotifications();
  }

  void _setupSocket(String baseUrl, String token) {
    _socket = IO.io(baseUrl, IO.OptionBuilder()
      .setTransports(['websocket'])
      .setQuery({'token': token})
      .enableAutoConnect()
      .build());

    _socket!.onConnect((_) {
      _logger.i('Realtime: Connected to WebSocket');
    });

    _socket!.onDisconnect((_) {
      _logger.w('Realtime: Disconnected from WebSocket');
    });

    _socket!.on('new_order', (data) {
      _logger.d('Realtime: Received NEW_ORDER via WebSocket');
      _orderStreamController.add(data);
       _showLocalNotification(
          title: '🛍️ New Order Received!', 
          body: 'Order #${data['order_number']} is waiting for you.'
      );
    });
    
    _socket!.on('notification', (data) {
       _showLocalNotification(title: data['title'], body: data['body']);
    });
  }

  Future<void> _setupFCM() async {
    NotificationSettings settings = await _fcm.requestPermission();
    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      final token = await _fcm.getToken();
      _logger.i('FCM Token: $token');
      // TODO: Send this token to backend via AuthRepository
    }

    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
       _logger.d('FCM: Received background/foreground push');
       _orderStreamController.add(message.data);
    });
  }

  Future<void> _setupLocalNotifications() async {
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings();
    await _localNotifications.initialize(
      InitializationSettings(android: androidSettings, iOS: iosSettings)
    );
  }

  Future<void> _showLocalNotification({required String title, required String body}) async {
    const androidDetails = AndroidNotificationDetails(
      'high_importance_channel', 
      'High Importance Notifications',
      importance: Importance.max,
      priority: Priority.high,
      playSound: true,
    );
    await _localNotifications.show(0, title,body,NotificationDetails(android: androidDetails));
  }

  void joinStore(String storeId) {
    _socket?.emit('join_store', storeId);
  }

  void dispose() {
    _socket?.disconnect();
    _orderStreamController.close();
  }
}
