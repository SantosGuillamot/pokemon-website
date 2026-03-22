import {
	boolean,
	integer,
	jsonb,
	numeric,
	pgTable,
	primaryKey,
	serial,
	smallint,
	varchar,
} from "drizzle-orm/pg-core";
import { abilities } from "./abilities";
import { moves } from "./moves";
import { types } from "./types";

export const pokemons = pgTable("pokemons", {
	id: serial("id").primaryKey(),
	dexNumber: integer("dex_number").notNull().unique(),
	name: varchar("name", { length: 100 }).notNull().unique(),
	images: jsonb("images").$type<Record<string, string>>(),
	hp: smallint("hp").notNull(),
	attack: smallint("attack").notNull(),
	defense: smallint("defense").notNull(),
	spAttack: smallint("sp_attack").notNull(),
	spDefense: smallint("sp_defense").notNull(),
	speed: smallint("speed").notNull(),
	weight: numeric("weight").notNull(),
	height: numeric("height").notNull(),
});

export const pokemonTypes = pgTable(
	"pokemon_types",
	{
		pokemonId: integer("pokemon_id")
			.notNull()
			.references(() => pokemons.id, { onDelete: "cascade" }),
		typeId: integer("type_id")
			.notNull()
			.references(() => types.id),
		slot: smallint("slot").notNull(),
	},
	(table) => [primaryKey({ columns: [table.pokemonId, table.typeId] })],
);

export const pokemonAbilities = pgTable(
	"pokemon_abilities",
	{
		pokemonId: integer("pokemon_id")
			.notNull()
			.references(() => pokemons.id, { onDelete: "cascade" }),
		abilityId: integer("ability_id")
			.notNull()
			.references(() => abilities.id),
		isHidden: boolean("is_hidden").notNull().default(false),
		slot: smallint("slot").notNull(),
	},
	(table) => [primaryKey({ columns: [table.pokemonId, table.abilityId] })],
);

export const pokemonMoves = pgTable(
	"pokemon_moves",
	{
		pokemonId: integer("pokemon_id")
			.notNull()
			.references(() => pokemons.id, { onDelete: "cascade" }),
		moveId: integer("move_id")
			.notNull()
			.references(() => moves.id),
	},
	(table) => [primaryKey({ columns: [table.pokemonId, table.moveId] })],
);
