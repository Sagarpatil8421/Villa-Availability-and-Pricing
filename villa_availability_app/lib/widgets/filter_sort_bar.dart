import 'package:flutter/material.dart';

class FilterSortBar extends StatelessWidget {
  const FilterSortBar({super.key});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: OutlinedButton.icon(
            onPressed: () {
              // Placeholder only – no filter logic in this phase.
            },
            icon: const Icon(Icons.tune),
            label: const Text('Filters'),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: OutlinedButton.icon(
            onPressed: () {
              // Placeholder only – no sort logic in this phase.
            },
            icon: const Icon(Icons.sort),
            label: const Text('Sort'),
          ),
        ),
      ],
    );
  }
}


