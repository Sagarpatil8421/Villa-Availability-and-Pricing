const dayjs = require('dayjs');

// Enforce strict format parsing for safety
const STRICT_FORMAT = 'YYYY-MM-DD';

function parseDate(value) {
  const d = dayjs(value, STRICT_FORMAT, true);
  return d.isValid() ? d : null;
}

function formatDate(date) {
  return dayjs(date).format(STRICT_FORMAT);
}

function calculateNights(checkIn, checkOut) {
  const inDate = parseDate(checkIn);
  const outDate = parseDate(checkOut);

  if (!inDate || !outDate) return null;

  // Business rule: stay window is [check_in, check_out)
  // checkout date is NOT counted as a night
  const nights = outDate.diff(inDate, 'day');
  return nights > 0 ? nights : null;
}

function getDateRangeInclusive(checkIn, checkOut) {
  const inDate = parseDate(checkIn);
  const outDate = parseDate(checkOut);

  if (!inDate || !outDate) return null;

  // We want [check_in, check_out) for business logic,
  // but SQL BETWEEN is inclusive on both sides.
  // So we use [check_in, check_out - 1 day] for queries.
  const start = inDate.startOf('day');
  const end = outDate.subtract(1, 'day').startOf('day');

  if (end.isBefore(start)) return null;

  return {
    start: start.format(STRICT_FORMAT),
    end: end.format(STRICT_FORMAT),
  };
}

module.exports = {
  STRICT_FORMAT,
  parseDate,
  formatDate,
  calculateNights,
  getDateRangeInclusive,
};


