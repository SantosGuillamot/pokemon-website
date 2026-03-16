import { integer, pgTable, primaryKey, serial, smallint, varchar } from 'drizzle-orm/pg-core';
import { abilities } from './abilities';
import { types } from './types';

export const pokemon = pgTable('pokemon', {
  id: serial('id').primaryKey(),
  pokeApiId: integer('poke_api_id').notNull().unique(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  imageUrl: varchar('image_url', { length: 500 }),
  hp: smallint('hp').notNull(),
  attack: smallint('attack').notNull(),
  defense: smallint('defense').notNull(),
  spAttack: smallint('sp_attack').notNull(),
  spDefense: smallint('sp_defense').notNull(),
  speed: smallint('speed').notNull(),
});

export const pokemonTypes = pgTable(
  'pokemon_types',
  {
    pokemonId: integer('pokemon_id')
      .notNull()
      .references(() => pokemon.id, { onDelete: 'cascade' }),
    typeId: integer('type_id')
      .notNull()
      .references(() => types.id),
    slot: smallint('slot').notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.pokemonId, table.typeId] }),
  ]
);

export const pokemonAbilities = pgTable(
  'pokemon_abilities',
  {
    pokemonId: integer('pokemon_id')
      .notNull()
      .references(() => pokemon.id, { onDelete: 'cascade' }),
    abilityId: integer('ability_id')
      .notNull()
      .references(() => abilities.id),
    isHidden: integer('is_hidden').notNull().default(0),
    slot: smallint('slot').notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.pokemonId, table.abilityId] }),
  ]
);
