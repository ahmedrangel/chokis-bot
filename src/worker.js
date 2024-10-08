/**
 * Cloudflare worker.
 */
import { error, AutoRouter, text, cors } from "itty-router";
import { API } from "./lib/discord.js";
import { commandsHandler } from "./handler.js";
import { verifyKey } from "discord-interactions";

const { preflight, corsify } = cors();
const router = AutoRouter({
  before: [preflight],
  catch: error,
  finally: [corsify]
});

router.get("/", (req, env) => {
  return text(`👋 ${env.DISCORD_APPLICATION_ID}`);
});

router.get("/giveaways/participants/:guildId", async (req, env) => {
  const { guildId } = req.params;
  const data = await env.CHOKISDB.prepare(`SELECT * FROM giveaways WHERE guildId = '${guildId}'`).all();
  const guildPreview = await fetch(`${API.BASE}/guilds/${guildId}/preview`, {
    headers: {
      Authorization: "Bot " + env.DISCORD_TOKEN
    }
  });
  const guildData = await guildPreview.json();
  const guildResults = {
    name: guildData?.name,
    icon: guildData?.icon
  };
  return { list: data.results, guild: guildResults };
});

// Commands Handler
router.post("/", async (req, env, context) => {
  try {
    return await commandsHandler(req, env, context);
  }
  catch (error) {
    console.log(error);
  }
});

router.all("*", () => error(404));

export default {
  async fetch (request, env, context) {
    const { method, headers } = request;
    if (method === "POST") {
      const signature = headers.get("x-signature-ed25519");
      const timestamp = headers.get("x-signature-timestamp");
      const body = await request.clone().arrayBuffer();
      const isValidRequest = await verifyKey(
        body,
        signature,
        timestamp,
        env.DISCORD_PUBLIC_KEY
      );
      if (!isValidRequest) {
        return new Response("Bad request signature.", { status: 401 });
      }
    }
    return router.fetch(request, env, context);
  }
};
