import { Hono } from "hono";
import pokemonsRouter from "./pokemons";

const app = new Hono();

const route = app.route("/api/pokemons", pokemonsRouter);

export type AppType = typeof route;
export default app;
