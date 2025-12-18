import 'package:flutter/foundation.dart';

import '../models/villa.dart';
import '../models/villa_quote.dart';
import '../services/api_service.dart';

enum VillaLoadStatus { idle, loading, success, error }
enum VillaQuoteStatus { idle, loading, success, error }

class VillaProvider extends ChangeNotifier {
  VillaProvider({required ApiService apiService}) : _apiService = apiService;

  final ApiService _apiService;

  // List state
  VillaLoadStatus _status = VillaLoadStatus.idle;
  String? _errorMessage;
  List<Villa> _villas = [];

  // Quote state
  VillaQuoteStatus _quoteStatus = VillaQuoteStatus.idle;
  String? _quoteError;
  VillaQuote? _quote;

  // Exposed getters
  VillaLoadStatus get status => _status;
  String? get errorMessage => _errorMessage;
  List<Villa> get villas => List.unmodifiable(_villas);

  VillaQuoteStatus get quoteStatus => _quoteStatus;
  String? get quoteError => _quoteError;
  VillaQuote? get quote => _quote;

  Future<void> loadAvailableVillas({
    required String checkIn,
    required String checkOut,
  }) async {
    _status = VillaLoadStatus.loading;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await _apiService.fetchAvailableVillas(
        checkIn: checkIn,
        checkOut: checkOut,
        page: 1,
        limit: 20,
        sort: 'avg_price_per_night',
        order: 'asc',
      );

      _villas = result;
      _status = VillaLoadStatus.success;
      notifyListeners();
    } catch (e) {
      _status = VillaLoadStatus.error;
      _errorMessage = e.toString();
      _villas = [];
      notifyListeners();
    }
  }

  Future<void> loadVillaQuote({
    required int villaId,
    required String checkIn,
    required String checkOut,
  }) async {
    _quoteStatus = VillaQuoteStatus.loading;
    _quoteError = null;
    notifyListeners();

    try {
      final result = await _apiService.fetchVillaQuote(
        villaId: villaId,
        checkIn: checkIn,
        checkOut: checkOut,
      );

      _quote = result;
      _quoteStatus = VillaQuoteStatus.success;
      notifyListeners();
    } catch (e) {
      _quoteStatus = VillaQuoteStatus.error;
      _quoteError = e.toString();
      _quote = null;
      notifyListeners();
    }
  }
}

