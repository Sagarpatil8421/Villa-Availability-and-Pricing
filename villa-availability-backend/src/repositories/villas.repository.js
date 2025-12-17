const { db } = require('../config/db');

/**
 * Repository responsible for all villa-related DB queries.
 * Uses SQL aggregation for availability and pricing logic.
 */

async function findAvailableVillas({
  checkIn,
  checkOut,
  nights,
  sort,
  order,
  offset,
  limit,
}) {
  const sortOrder = order || 'asc';

  // Base query for fully-available villas in the given date window
  const baseQuery = db('villas as v')
    .join('villa_calendar as vc', 'v.id', 'vc.villa_id')
    .whereBetween('vc.date', [checkIn, checkOut])
    .groupBy('v.id', 'v.name', 'v.location')
    // Ensure we have every date in the window (no missing rows)
    .having(db.raw('COUNT(DISTINCT vc.date)'), '=', nights)
    // Ensure all dates are available
    .having(db.raw('BOOL_AND(vc.is_available)'), '=', true)
    .select(
      'v.id',
      'v.name',
      'v.location',
      db.raw('SUM(vc.rate) AS subtotal'),
      db.raw('AVG(vc.rate) AS avg_price_per_night'),
    );

  // Get total count (after availability filtering)
  const totalResult = await baseQuery
    .clone()
    .clearSelect()
    .select(db.raw('COUNT(*)::int AS total'));

  const total = totalResult[0]?.total || 0;

  // Apply sorting and pagination
  const dataQuery = baseQuery.clone();

  if (sort === 'avg_price_per_night') {
    dataQuery.orderBy('avg_price_per_night', sortOrder);
  } else {
    // Default ordering by id for deterministic output
    dataQuery.orderBy('v.id', 'asc');
  }

  const rows = await dataQuery.limit(limit).offset(offset);

  return {
    total,
    rows,
  };
}

async function findVillaById(villaId) {
  return db('villas').where({ id: villaId }).first();
}

async function getVillaCalendarForRange(villaId, checkIn, checkOut) {
  return db('villa_calendar')
    .where({ villa_id: villaId })
    .andWhere('date', '>=', checkIn)
    .andWhere('date', '<', checkOut)
    .orderBy('date', 'asc');
}

module.exports = {
  findAvailableVillas,
  findVillaById,
  getVillaCalendarForRange,
};


