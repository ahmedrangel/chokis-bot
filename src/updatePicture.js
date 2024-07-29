import "dotenv/config";
import { API } from "./lib/discord.js";

const args = process.argv.slice(2);
const argsObj = {};

for (let i = 0; i < args.length; i+= 2) {
  const key = args[i].replace("--", "");
  const value = args[i + 1];
  argsObj[key] = value;
}

const execute = async () => {
  if (!argsObj.source && !argsObj.type) return console.error("Missing --source and --type arguments");
  if (!argsObj.source) return console.error("Missing --source argument");
  if (!argsObj.type) return console.error("Missing --type argument");
  if (argsObj.type !== "avatar" && argsObj.type !== "banner")
    return console.error(`Invalid --type argument: ${argsObj.type}`), console.warn("Valid --type argument: avatar, banner");

  const source = argsObj.source;

  const sourceResponse = await fetch(source);
  const contentType = sourceResponse.headers.get("content-type");
  const imageBuffer = await sourceResponse.arrayBuffer();
  const imageData = Buffer.from(imageBuffer).toString("base64");

  const payload = argsObj.type === "avatar" ? { avatar: `data:${contentType};base64,${imageData}` } : { banner: `data:${contentType};base64,${imageData}` };

  const patch = await fetch(`${API.BASE}/users/@me`, {
    method: "PATCH",
    headers: {
      "Authorization": "Bot " + process.env.DISCORD_TOKEN,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const response = await patch.json();

  if (response.errors) {
    console.log(response.message, response.errors);
  }

  console.log("Picture Updated");
  return;
};

await execute();