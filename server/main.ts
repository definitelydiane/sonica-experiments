import { debounce } from "jsr:@std/async/debounce";

import { Router, RouteController } from "./Router.ts";
import { SVGGenerator } from "./SVGGenerator.ts";

export const IndexController: RouteController = {
  get: async (req: Request): Response => {
    const bytes = await Deno.readFile("public/index.html");
    return new Response(bytes);
  },
} as const;


export const SVGController: RouteController = {
  get: async (req: Request): Response => {
    const generator = new SVGGenerator().height(128).fontSize(16 * 4);
    const result = generator.generate();
    return new Response(result, {
      "content-type": "image/svg+xml",
    });
  },
} as const;

type ServerArgs = {
	debug: boolean
}

const DefaultMainArgs: ServerArgs = {
	debug: false,
}

class HotReloader {
	private socket?: WebSocket;
	private watcher: FsWatcher;

	private openHandler = () => {
		console.log("Client connected");
	};

	private messageHandler = (event) => {
		console.log(`[Websocket] Recieved message from client ${event.data}`);
	}

	public setSocket(socket: WebSocket) {
		if(this.socket) this.socket.close();
		this.socket = socket;
		this.socket.addEventListener("open", this.openHandler);
		this.socket.addEventListener("message", this.messageHandler);
	}

	public async watch(dirs: string[]) {
		this.watcher = Deno.watchFs(dirs);
		const tailwindCmd = new Deno.Command(Deno.execPath(), {
			args: [
				"run",
				"update-tailwind",
			],
		});
		const handleFsEvent = debounce(async (event) => {
			console.log(`[FSWatcher] Event: ${event.data}`);
			const c = tailwindCmd.spawn();
			await c.status;
			this.reload();
			console.log("[Hotreload] Reloading...");
		}, 200);
		for await(const event of this.watcher) {
			handleFsEvent(event);
		}
	}

	public reload() {
		if(!this.socket) return;
		if(this.socket.readyState == WebSocket.OPEN) {
			console.log("Sending reload....");
			this.socket.send("reload");
		} else {
			console.log("Warn: Hot reload socket readyState != open!");
		}
	}
}

const HotReloaderSingleton = new HotReloader() as const;

export default async function serve(args: Partial<ServerArgs> = DefaultMainArgs) {
	// TODO: Combine the args by using a Set.difference(Object.keys)
	// or related method

	const router = new Router();

  router.register("/", IndexController);
  router.register("/svg", SVGController);
  router.registerPublicFile("/fonts/Bravura.otf", "font/otf");
	router.registerPublicFile("/main.css", "text/css");

  Deno.serve(async (req: Request) => {
    console.log(`${req.method} "${new URL(req.url).pathname}"`);
		if(args.debug && req.headers.get("upgrade") == "websocket") {
			// Handle websocket
			const { socket, response } = Deno.upgradeWebSocket(req);
			HotReloaderSingleton.setSocket(socket);
			return response;
		} else {
			return router.handle(req);
		}
  });
}

function parseCLIArgs(): ServerArgs {
	const serverArgs = structuredClone(DefaultMainArgs);
	const parseFlag = (flag: string) => {
	}
	for(const arg of Deno.args) {
		switch(arg) {
			case "-d":
			case "--dev":
				serverArgs.debug = true;
				break;
			default:
				throw new Error(`Unexpected argument: ${arg}`);
		}
	}

	return serverArgs
}

if (import.meta.main) {
	try {
		const args = parseCLIArgs();
		console.log("Running with config:");
		console.log(JSON.stringify(args, null, 2));
		HotReloaderSingleton.watch(["public", "server"]);

		await serve(args);
	} catch(e) {
		console.log(`Error: ${e.message}`);
	}
}
