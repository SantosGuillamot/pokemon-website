import type { InferSelectModel } from "drizzle-orm";
import type { types } from "../db/schema";

export type Type = InferSelectModel<typeof types>;
