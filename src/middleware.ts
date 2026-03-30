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
		"/fonts/*",
		serveStatic({ root: "./public" }),
		async (c, next) => {
			await next();
			c.header("Cache-Control", "public, max-age=31536000, immutable");
		},
	);

	// Cache images for 1 year — they rarely change and are locally hosted.
	app.use(
		"/images/*",
		serveStatic({ root: "./public" }),
		async (c, next) => {
			await next();
			c.header("Cache-Control", "public, max-age=31536000, immutable");
		},
	);
	app.use("/css/*", serveStatic({ root: "./public" }));
	app.use("/js/*", serveStatic({ root: "./public" }));
	app.use("/icons/*", serveStatic({ root: "./public" }));

	app.onError((err, c) => {
		console.error(err);
		const message =
			process.env.NODE_ENV === "production"
				? "Internal Server Error"
				: err.message;
		return c.text(message, 500);
	});
}
