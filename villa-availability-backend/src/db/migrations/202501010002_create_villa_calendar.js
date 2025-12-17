/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('villa_calendar', (table) => {
    table.increments('id').primary();
    table
      .integer('villa_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('villas')
      .onDelete('CASCADE');
    table.date('date').notNullable();
    table.boolean('is_available').notNullable().defaultTo(true);
    table.decimal('rate', 12, 2).notNullable();
    table.timestamps(true, true);

    table.unique(['villa_id', 'date']);
    table.index(['villa_id', 'date']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('villa_calendar');
};


