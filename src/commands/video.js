import { errorEmbed, esUrl, getGuild, imbedUrlsFromString, obtenerIDDesdeURL } from "../functions";
import { deferReply, deferUpdate } from "../interaction";
import { getSocial } from "../emojis";
import { CONSTANTS, supportedSocials } from "../constants";
import { ButtonStyleTypes, MessageComponentTypes } from "discord-interactions";
import { $fetch } from "ofetch";
import { withQuery } from "ufo";

export const video = (getValue, env, context, request_data) => {
  const followUpRequest = async () => {
    const { guild_id, token } = request_data;
    const embeds = [];
    const files = [], button = [], components = [];
    let emoji;
    let supported = false;
    let red_social = "Instagram / Facebook / TikTok / Twitter / YouTube / Twitch / Kick";
    const url = getValue("link");

    for (const key in supportedSocials) {
      const sns = supportedSocials[key];
      if (sns.domains.some(domains => url.includes(domains))) {
        red_social = sns.name;
        emoji = getSocial(red_social);
        supported = true;
        break;
      }
    }

    if (!esUrl(url) && !supported) {
      const error = `⚠️ Error. El texto ingresado no es un link válido de **${red_social}**`;
      return deferUpdate("", {
        token,
        application_id: env.DISCORD_APPLICATION_ID,
        embeds: errorEmbed(error)
      });
    }

    const encodedUrl = encodeURIComponent(url);
    const scraperUrl = `${env.EXT_WORKER_AHMED}/dc/${red_social.toLowerCase()}-video-scrapper`;
    const scraperQueries = { url: encodedUrl, filter: "video" };
    const scrapping = await $fetch(withQuery(scraperUrl, scraperQueries), { retry: 3, retryDelay: 1000 }).catch(() => null);
    const video_url = scrapping?.video_url;
    const short_url = scrapping?.short_url;
    const status = scrapping?.status;
    const caption = imbedUrlsFromString(`${scrapping?.caption ? scrapping?.caption?.replace(/#[^\s#]+(\s#[^\s#]+)*$/g, "").replaceAll(".\n", "").replace(/\n+/g, "\n").trim() : ""}`);
    console.log(status);

    if (status !== 200 && !esUrl(video_url)) {
      const error = ":x: Error. Ha ocurrido un error obteniendo el video.";
      return deferUpdate("", {
        token,
        application_id: env.DISCORD_APPLICATION_ID,
        embeds: errorEmbed(error)
      });
    }

    const videoChecker = await $fetch.raw(video_url).catch(() => null);
    const blob = videoChecker?._data;
    const fileSize = blob?.size;
    console.log("Tamaño: " + fileSize);
    const contentType = videoChecker?.headers.get("content-type");
    console.log("Content-Type: " + contentType);

    const guild = await getGuild(guild_id, env.DISCORD_TOKEN);
    console.log("premium tier: " + guild.premium_tier);
    const maxSize = guild.premium_tier >= 3 ? 100000000 : (guild.premium_tier === 2 ? 50000000 : 25000000);

    if (blob && fileSize > maxSize) {
      const error = "⚠️ Error. El video es muy pesado o demasiado largo.";
      return deferUpdate("", {
        token,
        application_id: env.DISCORD_APPLICATION_ID,
        embeds: errorEmbed(error)
      });
    }

    if (!blob || fileSize < 100 || !["video/mp4", "binary/octet-stream", "application/octet-stream"].includes(contentType)) {
      const error = ":x: Error. Ha ocurrido un error obteniendo el video.";
      return deferUpdate("", {
        token,
        application_id: env.DISCORD_APPLICATION_ID,
        embeds: errorEmbed(error)
      });
    }

    const uploadedUrl = await $fetch(withQuery(`${env.EXT_WORKER_AHMED}/put/video`, { url: video_url, bot_name: CONSTANTS.BOT }));
    const uploadedId = obtenerIDDesdeURL(uploadedUrl);

    files.push({
      name: `${uploadedId}.mp4`,
      file: blob
    });

    button.push({
      type: MessageComponentTypes.BUTTON,
      style: ButtonStyleTypes.LINK,
      label: "Descargar MP4",
      url: uploadedUrl
    });

    components.push ({
      type: MessageComponentTypes.ACTION_ROW,
      components: button
    });

    const mensaje = `${emoji} **${red_social}**: [${short_url.replace("https://", "")}](<${short_url}>)\n${caption}`;
    const fixedMsg = mensaje.length > 1000 ? mensaje.substring(0, 1000) + "..." : mensaje;

    // Return del refer
    return deferUpdate(fixedMsg, {
      token,
      application_id: env.DISCORD_APPLICATION_ID,
      embeds,
      components,
      files
    });
  };
  context.waitUntil(followUpRequest());
  return deferReply();
};