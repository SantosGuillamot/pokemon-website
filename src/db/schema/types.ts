import { integer, numeric, pgTable, primaryKey, serial, varchar } from 'drizzle-orm/pg-core';

export const types = pgTable('types', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
});

export const typeMatchups = pgTable(
  'type_matchups',
  {
    attackerTypeId: integer('attacker_type_id')
      .notNull()
      .references(() => types.id),
    defenderTypeId: integer('defender_type_id')
      .notNull()
      .references(() => types.id),
    multiplier: numeric('multiplier', { precision: 3, scale: 2 }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.attackerTypeId, table.defenderTypeId] }),
  ]
);
