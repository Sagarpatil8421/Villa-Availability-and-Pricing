/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function seed(knex) {
  await knex('villa_calendar').del();
  await knex('villas').del();

  await knex('villas').insert([
    { id: 1, name: 'Villa Goa Sunset', location: 'Goa' },
    { id: 2, name: 'Villa Kerala Backwaters', location: 'Kochi' },
    { id: 3, name: 'Villa Alibaug Breeze', location: 'Alibaug' },
    { id: 4, name: 'Villa Lonavala Heights', location: 'Lonavala' },
  ]);
};



