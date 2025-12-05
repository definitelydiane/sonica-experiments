type RequestHandler = (req: Request) => Promise<Response>;

export interface RouteController {
	get?: (req: Request) => Promise<Response>,
	put?: (req: Request) => Promise<Response>,
	post?: (req: Request) => Promise<Response>,
	delete?: (req: Request) => Promise<Response>,
}

export class Router {
	// Pathname to controller mapping
	private _controllers: Map<string, RouteController> = new Map();

	// TODO: Allow support for parameters mapped to strings using wildcards
	// such as "public/*". These should be able to be overridden by fully
	// qualified URLs, e.x. we should be able to have a map to "public/*" and
	// "public/my_specific_file.txt". The order of precedence should be:
	// 1. "public/my_specific_file.txt"
	// 2. "public/*"
	//
	// 12/05 -- We can do this using URLPattern.
	// 		See: https://docs.deno.com/examples/http_server_routing/
	public async handle(req: Request): Promise<Response> {
		const url = new URL(req.url);
		const controller = this._controllers.get(url.pathname);

		if(controller == undefined) {
			return Router.NOT_FOUND();
		}

		const method = req.method.toLowerCase();

		if(method in controller) {
			// @ts-ignore: This is valid javascript, skipping type checking is fine here.
			return controller[method](req);
		} else {
			return Router.SERVER_ERROR();
		}
	}

	public register(pathname: string, controller: RouteController) {
		if(!this._controllers.has(pathname)) {
			this._controllers.set(pathname, controller);
		} else {
			throw new Error("Attempted to register existing path to controller.");
		}
	}

	// Hack method
	// Convenience method to map a GET controller to the route handlers
	public registerPublicFile(pathname: string, contentType: string) {
		const c: RouteController = {
			get: async(req: Request): Promise<Response> => {
				const bytes = await Deno.readFile(`public/${pathname}`);
				return new Response(bytes, { headers: {"content-type": contentType }});
			}
		}
		this._controllers.set(pathname, c);
	}

	public static NOT_FOUND(body?: string): Response {
		return new Response(body ? body : "404 NOT FOUND", {
			status: 404,
			headers: {
				"content-type": "application/json; charset=utf-8",
			}
		});
	}

	public static SERVER_ERROR(body?: string): Response {
		return new Response("500 SERVER ERROR", {
			status: 500,
			headers: {
				"content-type": "application/json; charset=utf-8",
			}
		});
	}
}
