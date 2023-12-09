/**
 * Cloudflare worker.
 */
import { Router } from "itty-router";
import { verifyKey } from "./lib/discord.js";
import { commandsHandler } from "./handler.js";

const router = Router();

router.get("/", (req, env) => {
  return new Response(`👋 ${env.DISCORD_APPLICATION_ID}`);
});

// Commands Handler
router.post("/", async (req, env, context) => {
  return await commandsHandler(req, env, context);
});

router.all("*", () => new Response("Not Found.", { status: 404 }));

export default {
  async fetch(request, env, context) {
    const { method, headers } = request;
    if (method === "POST") {
      const signature = headers.get("x-signature-ed25519");
      const timestamp = headers.get("x-signature-timestamp");
      const body = await request.clone().arrayBuffer();
      const isValidRequest = verifyKey(
        body,
        signature,
        timestamp,
        env.DISCORD_PUBLIC_KEY
      );
      if (!isValidRequest) {
        return new Response("Bad request signature.", { status: 401 });
      }
    }
    return router.handle(request, env, context);
  },
};
