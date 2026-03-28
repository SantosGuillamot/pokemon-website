import { serveStatic } from "@hono/node-server/serve-static";
import type { Hono } from "hono";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { trimTrailingSlash } from "hono/trailing-slash";

export function registerMiddleware(app: Hono): void {
	app.use(trimTrailingSlash());
	app.use(logger());
	app.use(secureHeaders());

	// Cache fonts for 1 year — they rarely change and are locally hosted.
	app.use(
		"/public/fonts/*",
		serveStatic({ root: "./" }),
		async (c, next) => {
			await next();
			c.header("Cache-Control", "public, max-age=31536000, immutable");
		},
	);
	app.use("/public/*", serveStatic({ root: "./" }));

	app.onError((err, c) => {
		console.error(err);
		const message =
			process.env.NODE_ENV === "production"
				? "Internal Server Error"
				: err.message;
		return c.text(message, 500);
	});
}
