const dayjs = require('dayjs');

/**
 * Build a range [start, end) of dates as strings YYYY-MM-DD
 */
function buildDateRange(start, end) {
  const startDate = dayjs(start);
  const endDate = dayjs(end);
  const days = [];
  for (let d = startDate; d.isBefore(endDate); d = d.add(1, 'day')) {
    days.push(d.format('YYYY-MM-DD'));
  }
  return days;
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function seed(knex) {
  await knex('villa_calendar').del();

  // Seed window around 2025-01-10 to 2025-01-15 for testing
  const range = buildDateRange('2025-12-15', '2026-12-19'); // [10, 16)

  const entries = [];

  // Villa 1: fully available for the range with varying rates
  range.forEach((date, idx) => {
    entries.push({
      villa_id: 1,
      date,
      is_available: true,
      rate: 30000 + idx * 1000, // 30k, 31k, ...
    });
  });

  // Villa 2: one unavailable date to test negative path
  range.forEach((date, idx) => {
    entries.push({
      villa_id: 2,
      date,
      is_available: idx === 2 ? false : true, // make 3rd night unavailable
      rate: 25000 + idx * 500,
    });
  });

  // Villa 3: fully available, cheaper
  range.forEach((date, idx) => {
    entries.push({
      villa_id: 3,
      date,
      is_available: true,
      rate: 20000 + idx * 800,
    });
  });
  
  // Villa 4: missing one date entirely (edge case)
  range.forEach((date, idx) => {
    if (idx === 3) return; // skip one date → missing calendar row
  
    entries.push({
      villa_id: 4,
      date,
      is_available: true,
      rate: 35000 + idx * 1200,
    });
  });

  await knex('villa_calendar').insert(entries);
};  

