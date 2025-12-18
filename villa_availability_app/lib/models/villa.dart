class Villa {
  final int id;
  final String name;
  final String location;
  final int nights;
  final num subtotal;
  final num avgPricePerNight;

  const Villa({
    required this.id,
    required this.name,
    required this.location,
    required this.nights,
    required this.subtotal,
    required this.avgPricePerNight,
  });

  factory Villa.fromJson(Map<String, dynamic> json) {
    return Villa(
      id: json['id'] as int? ?? 0,
      name: json['name'] as String? ?? '',
      location: json['location'] as String? ?? '',
      nights: (json['nights'] as num?)?.toInt() ?? 0,
      subtotal: json['subtotal'] as num? ?? 0,
      avgPricePerNight: json['avg_price_per_night'] as num? ?? 0,
    );
  }
}


