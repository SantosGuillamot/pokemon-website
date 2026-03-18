import { jsonb, pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';

export const items = pgTable('items', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  imageUrl: varchar('image_url', { length: 500 }),
  category: varchar('category').notNull(),
  effect: text('effect'),
  meta: jsonb('meta'),
});
