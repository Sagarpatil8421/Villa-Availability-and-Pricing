const {
  calculateNights,
  getDateRangeInclusive,
  formatDate,
} = require('../utils/date.utils');
const { getPaginationParams } = require('../utils/pagination.utils');
const { GST_RATE } = require('../constants/gst');
const {
  findAvailableVillas,
  findVillaById,
  getVillaCalendarForRange,
} = require('../repositories/villas.repository');
const { AppError } = require('../middlewares/error.middleware');

/**
 * Service: list fully-available villas for a given date range.
 */
async function listAvailableVillas(query) {
  const { check_in: checkIn, check_out: checkOut, sort, order, page, limit } =
    query;

  const nights = calculateNights(checkIn, checkOut);
  if (!nights) {
    throw new AppError(400, 'Invalid date range');
  }

  const dateRange = getDateRangeInclusive(checkIn, checkOut);
  if (!dateRange) {
    throw new AppError(400, 'Invalid date range');
  }

  const { page: safePage, limit: safeLimit, offset } = getPaginationParams({
    page,
    limit,
  });

  const { total, rows } = await findAvailableVillas({
    checkIn: dateRange.start,
    checkOut: dateRange.end,
    nights,
    sort,
    order,
    offset,
    limit: safeLimit,
  });

  const data = rows.map((row) => {
    const subtotal = Number(row.subtotal) || 0;

    return {
      id: row.id,
      name: row.name,
      location: row.location,
      nights,
      subtotal,
      avg_price_per_night: subtotal / nights,
    };
  });

  return {
    meta: {
      page: safePage,
      limit: safeLimit,
      total,
    },
    data,
  };
}

/**
 * Service: quote for a specific villa and date range.
 */
async function getVillaQuote(villaId, params) {
  const { check_in: checkIn, check_out: checkOut } = params;

  const villa = await findVillaById(villaId);
  if (!villa) {
    throw new AppError(404, 'Villa not found');
  }

  const nights = calculateNights(checkIn, checkOut);
  if (!nights) {
    throw new AppError(400, 'Invalid date range');
  }

  // Fetch full nightly calendar rows for the stay window [check_in, check_out)
  const nightlyRows = await getVillaCalendarForRange(villaId, checkIn, checkOut);

  // If any date is missing, villa is unavailable
  if (nightlyRows.length !== nights) {
    return buildQuoteResponse({
      villa,
      checkIn,
      checkOut,
      nights,
      nightlyRows,
      isAvailable: false,
    });
  }

  // Check availability across all nights
  const isAvailable = nightlyRows.every((row) => row.is_available);

  return buildQuoteResponse({
    villa,
    checkIn,
    checkOut,
    nights,
    nightlyRows,
    isAvailable,
  });
}

function buildQuoteResponse({
  villa,
  checkIn,
  checkOut,
  nights,
  nightlyRows,
  isAvailable,
}) {
  const nightly_breakdown = nightlyRows.map((row) => ({
    // Ensure dates are returned in YYYY-MM-DD format per spec
    date: formatDate(row.date),
    rate: Number(row.rate) || 0,
    is_available: row.is_available,
  }));

  const subtotal = nightly_breakdown.reduce(
    (sum, night) => sum + night.rate,
    0,
  );

  const gst_rate = GST_RATE;
  const gst = Math.round(subtotal * gst_rate);
  const total = subtotal + gst;

  return {
    villa: {
      id: villa.id,
      name: villa.name,
      location: villa.location,
    },
    check_in: checkIn,
    check_out: checkOut,
    nights,
    is_available: isAvailable,
    nightly_breakdown,
    subtotal,
    gst_rate,
    gst,
    total,
  };
}

module.exports = {
  listAvailableVillas,
  getVillaQuote,
};


