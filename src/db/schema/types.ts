import { jsonb, pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const types = pgTable("types", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 50 }).notNull().unique(),
	color: varchar("color", { length: 7 }).notNull(),
	attackNoEffect: jsonb("attack_no_effect")
		.$type<number[]>()
		.notNull()
		.default([]),
	attackNotVeryEffective: jsonb("attack_not_very_effective")
		.$type<number[]>()
		.notNull()
		.default([]),
	attackVeryEffective: jsonb("attack_very_effective")
		.$type<number[]>()
		.notNull()
		.default([]),
	defenseNoEffect: jsonb("defense_no_effect")
		.$type<number[]>()
		.notNull()
		.default([]),
	defenseNotVeryEffective: jsonb("defense_not_very_effective")
		.$type<number[]>()
		.notNull()
		.default([]),
	defenseVeryEffective: jsonb("defense_very_effective")
		.$type<number[]>()
		.notNull()
		.default([]),
});
