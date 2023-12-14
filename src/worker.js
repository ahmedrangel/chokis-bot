/**
 * Cloudflare worker.
 */
import { Router } from "itty-router";
import { API, verifyKey } from "./lib/discord.js";
import { commandsHandler } from "./handler.js";

const router = Router();

router.get("/", (req, env) => {
  return new Response(`👋 ${env.DISCORD_APPLICATION_ID}`);
});

router.get("/giveaways/participants/:guildId", async (req, env) => {
  const { guildId } = req.params;
  const data = await env.CHOKISDB.prepare(`SELECT * FROM giveaways WHERE guildId = '${guildId}'`).all();
  const guildPreview = await fetch(`${API.BASE}/guilds/${guildId}/preview`, {
    headers: {
      "Authorization" : "Bot " + env.DISCORD_TOKEN
    }
  });
  const guildData = await guildPreview.json();
  const guildResults = {
    name: guildData?.name,
    icon: guildData?.icon
  };
  const obj = {
    list: data.results,
    guild: guildResults
  };
  return new Response(JSON.stringify(obj));
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
