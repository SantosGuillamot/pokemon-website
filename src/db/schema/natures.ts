import { pgEnum, pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const statEnum = pgEnum("stat", [
	"hp",
	"attack",
	"defense",
	"sp_attack",
	"sp_defense",
	"speed",
	"none",
]);

export const natures = pgTable("natures", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 50 }).notNull().unique(),
	increasedStat: statEnum("increased_stat").notNull(),
	decreasedStat: statEnum("decreased_stat").notNull(),
});
