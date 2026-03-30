import "dotenv/config";
import { serve } from "@hono/node-server";
import { asc } from "drizzle-orm";
import { Hono } from "hono";
import { setServerConfig } from "iapi-ssr-processor";
import api from "./api/index.js";
import { db } from "./db/client.js";
import { types } from "./db/schema/index.js";
import { registerMiddleware } from "./middleware.js";
import routes from "./routes/index.js";

const app = new Hono();

registerMiddleware(app);

app.route("/", routes);
app.route("/", api);

const port = Number(process.env.PORT ?? 3000);

// Load types once at startup — config persists across requests.
const typesList = await db.select().from(types).orderBy(asc(types.id));
const typesMap: Record<string, (typeof typesList)[number]> = {};
for (const type of typesList) {
	typesMap[String(type.id)] = type;
}
setServerConfig("pokemon", { types: typesMap });

serve({ fetch: app.fetch, port }, () => {
	console.log(`Server running at http://localhost:${port}`);
});

export default app;
