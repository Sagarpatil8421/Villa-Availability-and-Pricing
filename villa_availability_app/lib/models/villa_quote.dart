class NightlyBreakdown {
  final String date;
  final num rate;
  final bool isAvailable;

  const NightlyBreakdown({
    required this.date,
    required this.rate,
    required this.isAvailable,
  });

  factory NightlyBreakdown.fromJson(Map<String, dynamic> json) {
    return NightlyBreakdown(
      date: json['date'] as String? ?? '',
      rate: json['rate'] as num? ?? 0,
      isAvailable: json['is_available'] as bool? ?? false,
    );
  }
}

class VillaQuote {
  final int id;
  final String name;
  final String location;
  final String checkIn;
  final String checkOut;
  final int nights;
  final bool isAvailable;
  final List<NightlyBreakdown> nightlyBreakdown;
  final num subtotal;
  final num gstRate;
  final num gst;
  final num total;

  const VillaQuote({
    required this.id,
    required this.name,
    required this.location,
    required this.checkIn,
    required this.checkOut,
    required this.nights,
    required this.isAvailable,
    required this.nightlyBreakdown,
    required this.subtotal,
    required this.gstRate,
    required this.gst,
    required this.total,
  });

  factory VillaQuote.fromJson(Map<String, dynamic> json) {
    final villa = json['villa'] as Map<String, dynamic>? ?? {};
    final breakdown = (json['nightly_breakdown'] as List<dynamic>? ?? [])
        .map((e) => NightlyBreakdown.fromJson(e as Map<String, dynamic>))
        .toList();

    return VillaQuote(
      id: villa['id'] as int? ?? 0,
      name: villa['name'] as String? ?? '',
      location: villa['location'] as String? ?? '',
      checkIn: json['check_in'] as String? ?? '',
      checkOut: json['check_out'] as String? ?? '',
      nights: (json['nights'] as num?)?.toInt() ?? 0,
      isAvailable: json['is_available'] as bool? ?? false,
      nightlyBreakdown: breakdown,
      subtotal: json['subtotal'] as num? ?? 0,
      gstRate: json['gst_rate'] as num? ?? 0,
      gst: json['gst'] as num? ?? 0,
      total: json['total'] as num? ?? 0,
    );
  }
}


