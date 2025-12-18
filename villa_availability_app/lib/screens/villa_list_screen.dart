import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/villa_provider.dart';
import '../widgets/filter_sort_bar.dart';
import '../widgets/search_summary.dart';
import '../widgets/villa_card.dart';
import 'villa_detail_screen.dart';

class VillaListScreen extends StatefulWidget {
  const VillaListScreen({super.key});

  @override
  State<VillaListScreen> createState() => _VillaListScreenState();
}

class _VillaListScreenState extends State<VillaListScreen> {
  // Temporary hardcoded date range (per requirements).
  static const String _checkIn = '2025-12-15';
  static const String _checkOut = '2025-12-17';

  @override
  void initState() {
    super.initState();
    // Trigger initial load once the widget tree is ready.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = context.read<VillaProvider>();
      provider.loadAvailableVillas(checkIn: _checkIn, checkOut: _checkOut);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Villa Availability'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const FilterSortBar(),
            const SizedBox(height: 16),
            Expanded(
              child: Consumer<VillaProvider>(
                builder: (context, provider, _) {
                  switch (provider.status) {
                    case VillaLoadStatus.loading:
                      return const Center(
                        child: CircularProgressIndicator(),
                      );
                    case VillaLoadStatus.error:
                      return Center(
                        child: Text(
                          provider.errorMessage ?? 'Something went wrong',
                          textAlign: TextAlign.center,
                        ),
                      );
                    case VillaLoadStatus.success:
                      final villas = provider.villas;
                      if (villas.isEmpty) {
                        return const Center(
                          child: Text('No villas available'),
                        );
                      }

                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          SearchSummary(
                            totalVillas: villas.length,
                            checkIn: _checkIn,
                            checkOut: _checkOut,
                          ),
                          const SizedBox(height: 12),
                          Expanded(
                            child: ListView.separated(
                              itemCount: villas.length,
                              itemBuilder: (context, index) {
                                final villa = villas[index];
                                return VillaCard(
                                  villa: villa,
                                  onTap: () {
                                    Navigator.of(context).push(
                                      MaterialPageRoute(
                                        builder: (_) => VillaDetailScreen(
                                          villaId: villa.id,
                                          checkIn: _checkIn,
                                          checkOut: _checkOut,
                                        ),
                                      ),
                                    );
                                  },
                                );
                              },
                              separatorBuilder: (context, index) =>
                                  const SizedBox(height: 8),
                            ),
                          ),
                        ],
                      );
                    case VillaLoadStatus.idle:
                      // Initial idle state before the first load kicks in.
                      return const SizedBox.shrink();
                  }
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}


