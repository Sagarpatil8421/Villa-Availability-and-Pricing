/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('villas', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('location').notNullable();
    table.timestamps(true, true); // created_at, updated_at with defaults
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('villas');
};


