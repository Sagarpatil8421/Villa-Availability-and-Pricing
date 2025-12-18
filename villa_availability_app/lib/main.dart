import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'providers/villa_provider.dart';
import 'screens/villa_list_screen.dart';
import 'services/api_service.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) => VillaProvider(apiService: ApiService()),
        ),
      ],
      child: MaterialApp(
        title: 'Villa Availability',
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(seedColor: Colors.teal),
          useMaterial3: true,
        ),
        home: const VillaListScreen(),
      ),
    );
  }
}
