import { Hono } from "hono";
import pokemonRouter from "./pokemon";

const app = new Hono();

const route = app.route("/api/pokemon", pokemonRouter);

export type AppType = typeof route;
export default app;
