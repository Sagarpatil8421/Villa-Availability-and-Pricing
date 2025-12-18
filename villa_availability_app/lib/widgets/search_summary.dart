import 'package:flutter/material.dart';

import '../utils/date_utils.dart';

class SearchSummary extends StatelessWidget {
  const SearchSummary({
    super.key,
    required this.totalVillas,
    required this.checkIn,
    required this.checkOut,
  });

  final int totalVillas;
  final String checkIn;
  final String checkOut;

  @override
  Widget build(BuildContext context) {
    final dateRange = AppDateUtils.formatDateRange(checkIn, checkOut);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '$totalVillas villas available',
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: 4),
        Text(
          dateRange,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Colors.grey[700],
              ),
        ),
      ],
    );
  }
}


