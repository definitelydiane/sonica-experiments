import { assertEquals, assertThrows } from "@std/assert";
import { assertSpyCalls, spy } from "jsr:@std/testing/mock";

import { RouteController, Router } from "./Router.ts";

Deno.test(
	"Router.NOT_FOUND() correctly passes the body parameter or uses default value",
	async () => {
		const DEFAULT_MESSAGE = "404 NOT FOUND";

		const defaultRes = Router.NOT_FOUND();
		const parameterizedRes = Router.NOT_FOUND("foobar");

		assertEquals(await defaultRes.text(), "404 NOT FOUND");
		assertEquals(await parameterizedRes.text(), "foobar");
	}
);

Deno.test(
	"Router.register throws when attempting to map an extant key",
	async () => {
		const controller: RouteController = {}; // Empty controller
		const router = new Router();
		router.register("/", controller);
		assertThrows(() => router.register("/", controller), Error);
	}
)

Deno.test(
	"Router.handle correctly calls the relevant functions in the RouteController",
	async () => {

		const verbs: string[] = ["GET", "PUT", "POST", "DELETE"];

		const controller: RouteController = {
			get: (req: Request) => Promise.resolve(new Response("GET")),
			put: (req: Request) => Promise.resolve(new Response("PUT")),
			post: (req: Request) => Promise.resolve(new Response("POST")),
			delete: (req: Request) => Promise.resolve(new Response("DELETE")),
		}

		const router = new Router();
		router.register("/", controller);

		verbs.forEach(async (method) => {
			const req = new Request("http://localhost:8000/", { method });
			const res = await router.handle(req);
			assertEquals(method, await res.text());
		});
	}
);

Deno.test(
	"Router.handle returns 500 if a method handler does not exist",
	async () => {
		const controller: RouteController = {}; // Empty controller
		const router = new Router();

		router.register("/", controller);

		const req = new Request("http://localhost:8000/", {method: "GET"});
		const res = await router.handle(req);
		assertEquals(500, res.status);
	}
);
