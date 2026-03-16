import { pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';

export const abilities = pgTable('abilities', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  effect: text('effect'),
});
