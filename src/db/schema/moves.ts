import { integer, pgEnum, pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';
import { types } from './types';

export const moveCategoryEnum = pgEnum('move_category', ['physical', 'special', 'status']);

export const moves = pgTable('moves', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  category: moveCategoryEnum('category').notNull(),
  power: integer('power'),
  accuracy: integer('accuracy'),
  typeId: integer('type_id').references(() => types.id),
  effect: text('effect'),
});
