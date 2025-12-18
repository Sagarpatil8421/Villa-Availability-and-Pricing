import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/app_config.dart';
import '../models/villa.dart';
import '../models/villa_quote.dart';

class ApiService {
  const ApiService();

  Uri _buildUri(String path, Map<String, String> queryParams) {
    return Uri.parse('${AppConfig.apiBaseUrl}$path')
        .replace(queryParameters: queryParams);
  }

  /// Fetches available villas for the given date range.
  /// Uses the backend `/v1/villas/availability` endpoint.
  Future<List<Villa>> fetchAvailableVillas({
    required String checkIn,
    required String checkOut,
    int page = 1,
    int limit = 10,
    String? sort,
    String? order,
  }) async {
    final query = <String, String>{
      'check_in': checkIn,
      'check_out': checkOut,
      'page': page.toString(),
      'limit': limit.toString(),
    };

    if (sort != null && sort.isNotEmpty) {
      query['sort'] = sort;
    }
    if (order != null && order.isNotEmpty) {
      query['order'] = order;
    }

    final uri = _buildUri('/v1/villas/availability', query);

    final response = await http.get(uri);

    if (response.statusCode != 200) {
      throw Exception(
        'Failed to load villas (status ${response.statusCode})',
      );
    }

    final Map<String, dynamic> jsonBody =
        json.decode(response.body) as Map<String, dynamic>;

    final List<dynamic> data = jsonBody['data'] as List<dynamic>? ?? [];

    return data
        .map((e) => Villa.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  /// Fetches a detailed quote for a specific villa and date range.
  /// Uses the backend `/v1/villas/{villa_id}/quote` endpoint.
  Future<VillaQuote> fetchVillaQuote({
    required int villaId,
    required String checkIn,
    required String checkOut,
  }) async {
    final uri = Uri.parse(
      '${AppConfig.apiBaseUrl}/v1/villas/$villaId/quote',
    ).replace(
      queryParameters: <String, String>{
        'check_in': checkIn,
        'check_out': checkOut,
      },
    );

    final response = await http.get(uri);

    if (response.statusCode == 404) {
      throw Exception('Villa not found');
    }
    if (response.statusCode != 200) {
      throw Exception(
        'Failed to load villa quote (status ${response.statusCode})',
      );
    }

    final Map<String, dynamic> jsonBody =
        json.decode(response.body) as Map<String, dynamic>;

    return VillaQuote.fromJson(jsonBody);
  }
}


