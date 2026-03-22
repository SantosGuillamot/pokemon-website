import type { InferSelectModel } from "drizzle-orm";
import type { pokemon } from "../db/schema";

export type Pokemon = InferSelectModel<typeof pokemon>;
