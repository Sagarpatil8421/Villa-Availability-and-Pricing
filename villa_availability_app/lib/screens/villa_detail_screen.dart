import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/villa_quote.dart';
import '../providers/villa_provider.dart';
import '../utils/date_utils.dart';

class VillaDetailScreen extends StatefulWidget {
  const VillaDetailScreen({
    super.key,
    required this.villaId,
    required this.checkIn,
    required this.checkOut,
  });

  final int villaId;
  final String checkIn;
  final String checkOut;

  @override
  State<VillaDetailScreen> createState() => _VillaDetailScreenState();
}

class _VillaDetailScreenState extends State<VillaDetailScreen> {
  @override
  void initState() {
    super.initState();
    // Load the quote once the widget tree is ready.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = context.read<VillaProvider>();
      provider.loadVillaQuote(
        villaId: widget.villaId,
        checkIn: widget.checkIn,
        checkOut: widget.checkOut,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final dateRange =
        AppDateUtils.formatDateRange(widget.checkIn, widget.checkOut);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Villa Quote'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Consumer<VillaProvider>(
          builder: (context, provider, _) {
            switch (provider.quoteStatus) {
              case VillaQuoteStatus.loading:
                return const Center(
                  child: CircularProgressIndicator(),
                );
              case VillaQuoteStatus.error:
                return Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.error_outline, size: 40, color: Colors.red),
                      const SizedBox(height: 8),
                      Text(
                        'Unable to load villa quote.\nPlease try again later.',
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                    ],
                  ),
                );
              case VillaQuoteStatus.success:
                final quote = provider.quote;
                if (quote == null) {
                  return const Center(
                    child: Text('No quote data available'),
                  );
                }

                return _buildQuoteContent(context, quote, dateRange);
              case VillaQuoteStatus.idle:
                // Initial idle state before load kicks in.
                return const SizedBox.shrink();
            }
          },
        ),
      ),
    );
  }

  Widget _buildQuoteContent(
    BuildContext context,
    VillaQuote quote,
    String dateRange,
  ) {
    final theme = Theme.of(context).textTheme;

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            quote.name,
            style: theme.titleLarge,
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              const Icon(Icons.location_on_outlined, size: 16),
              const SizedBox(width: 4),
              Text(
                quote.location,
                style: theme.bodyMedium,
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            'Stay Details',
            style: theme.titleMedium,
          ),
          const SizedBox(height: 8),
          Text(
            dateRange,
            style: theme.bodyMedium,
          ),
          const SizedBox(height: 4),
          Text(
            '${quote.nights} nights',
            style: theme.bodyMedium,
          ),
          const SizedBox(height: 4),
          Text(
            quote.isAvailable ? 'Available' : 'Unavailable',
            style: theme.bodyMedium?.copyWith(
              color: quote.isAvailable ? Colors.green : Colors.red,
              fontWeight: FontWeight.w600,
            ),
          ),
          if (!quote.isAvailable) ...[
            const SizedBox(height: 8),
            Text(
              'This villa is not fully available for the selected dates.',
              style: theme.bodySmall?.copyWith(color: Colors.red),
            ),
          ],
          const SizedBox(height: 16),
          Text(
            'Nightly Breakdown',
            style: theme.titleMedium,
          ),
          const SizedBox(height: 8),
          ...quote.nightlyBreakdown.map(
            (night) => ListTile(
              contentPadding: EdgeInsets.zero,
              dense: true,
              title: Text(
                night.date,
                style: theme.bodyMedium,
              ),
              trailing: Text(
                _formatCurrency(night.rate),
                style: theme.bodyMedium,
              ),
              subtitle: night.isAvailable
                  ? null
                  : Text(
                      'Unavailable',
                      style: theme.bodySmall?.copyWith(color: Colors.red),
                    ),
            ),
          ),
          const Divider(height: 24),
          _buildTotalsSection(context, quote),
        ],
      ),
    );
  }

  Widget _buildTotalsSection(BuildContext context, VillaQuote quote) {
    final theme = Theme.of(context).textTheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Price Summary',
          style: theme.titleMedium,
        ),
        const SizedBox(height: 8),
        _buildAmountRow('Subtotal', quote.subtotal, theme),
        _buildAmountRow(
          'GST (${(quote.gstRate * 100).toStringAsFixed(0)}%)',
          quote.gst,
          theme,
        ),
        const SizedBox(height: 8),
        _buildAmountRow(
          'Total',
          quote.total,
          theme,
          isEmphasis: true,
        ),
      ],
    );
  }

  Widget _buildAmountRow(
    String label,
    num amount,
    TextTheme theme, {
    bool isEmphasis = false,
  }) {
    final style = isEmphasis
        ? theme.titleMedium?.copyWith(fontWeight: FontWeight.w600)
        : theme.bodyMedium;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: style),
          Text(_formatCurrency(amount), style: style),
        ],
      ),
    );
  }

  String _formatCurrency(num value) {
    // Simple currency formatting; detailed locale formatting is not required
    // for this assignment.
    return '₹${value.toStringAsFixed(0)}';
  }
}


