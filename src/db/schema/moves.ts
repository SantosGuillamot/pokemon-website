import {
	integer,
	jsonb,
	pgEnum,
	pgTable,
	serial,
	smallint,
	text,
	varchar,
} from "drizzle-orm/pg-core";
import { types } from "./types";

export const damageClassEnum = pgEnum("damage_class", [
	"physical",
	"special",
	"status",
]);

export const moves = pgTable("moves", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 100 }).notNull().unique(),
	power: smallint("power"),
	accuracy: smallint("accuracy"),
	pp: smallint("pp").notNull(),
	priority: smallint("priority").notNull().default(0),
	effect: text("effect"),
	effectChance: smallint("effect_chance"),
	typeId: integer("type_id").references(() => types.id),
	damageClass: damageClassEnum("damage_class").notNull(),
	target: varchar("target").notNull(),
	minHits: smallint("min_hits"),
	maxHits: smallint("max_hits"),
	flags: jsonb("flags").$type<string[]>().notNull().default([]),
});
