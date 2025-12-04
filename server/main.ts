import { Router, RouteController } from "./Router.ts";
import { SVGGenerator } from "./SVGGenerator.ts";

const IndexController: RouteController = {
  get: async (req: Request): Response => {
    const bytes = await Deno.readFile("public/index.html");
    return new Response(bytes);
  },
};

const SVGController: RouteController = {
  get: async (req: Request): Response => {
    const generator = new SVGGenerator().height(128).fontSize(16 * 4);
    const result = generator.generate();
    return new Response(result, {
      "content-type": "image/svg+xml",
    });
  },
};

if (import.meta.main) {
  const router = new Router();

  router.register("/", IndexController);
  router.register("/svg", SVGController);
  router.registerPublicFile("/fonts/Bravura.otf", "font/otf");

  Deno.serve(async (req: Request) => {
    console.log(`${req.method} "${new URL(req.url).pathname}"`);
    return router.handle(req);
  });
}
