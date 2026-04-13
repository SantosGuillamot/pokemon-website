import {
	boolean,
	integer,
	jsonb,
	pgTable,
	serial,
	text,
	varchar,
} from "drizzle-orm/pg-core";
import { pokemons } from "./pokemons";

export const items = pgTable("items", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 100 }).notNull().unique(),
	imageUrl: varchar("image_url", { length: 500 }),
	category: varchar("category").notNull(),
	effect: text("effect"),
	meta: jsonb("meta"),
	isMegaStone: boolean("is_mega_stone").notNull().default(false),
	megaPokemonId: integer("mega_pokemon_id").references(() => pokemons.id),
});
