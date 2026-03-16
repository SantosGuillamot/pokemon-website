import { pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';

export const fieldConditions = pgTable('field_conditions', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  effect: text('effect'),
});
