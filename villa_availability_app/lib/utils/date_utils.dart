import 'package:intl/intl.dart';

/// Utility functions for working with date strings in YYYY-MM-DD format.
class AppDateUtils {
  static final DateFormat _backendFormat = DateFormat('yyyy-MM-dd');
  static final DateFormat _displayFormat = DateFormat('d MMM yyyy');

  static String formatDisplayDate(String raw) {
    try {
      final date = _backendFormat.parse(raw);
      return _displayFormat.format(date);
    } catch (_) {
      return raw;
    }
  }

  static String formatDateRange(String checkIn, String checkOut) {
    final start = formatDisplayDate(checkIn);
    final end = formatDisplayDate(checkOut);
    return '$start - $end';
  }
}


