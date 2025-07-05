import { errorEmbed, esUrl, getGuild, imbedUrlsFromString, obtenerIDDesdeURL } from "../functions";
import { deferReply, deferUpdate } from "../interaction";
import { getSocial } from "../emojis";
import { supportedSocials } from "../constants";
import { $fetch } from "ofetch";
import { withQuery } from "ufo";
import { ButtonStyleTypes, MessageComponentTypes } from "discord-interactions";

export const video = (getValue, env, context, request_data) => {
  const followUpRequest = async () => {
    const { token } = request_data;
    const embeds = [], button = [], components = [];
    let emoji;
    let supported = false;
    let red_social = "Instagram / Facebook / TikTok / X / YouTube / Twitch / Kick / Reddit";
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

    const encodedUrl = encodeURIComponent(url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`);
    const scraperUrl = `${env.EXT_WORKER_AHMED}/dc/video-scraper/${red_social?.toLowerCase()}`;
    const scraperQueries = { url: encodedUrl, filter: "video" };
    const scrapping = await $fetch(withQuery(scraperUrl, scraperQueries), { retry: 3, retryDelay: 1000 }).catch(() => null);
    const { id, video_url, short_url, status } = scrapping || {};
    const caption = imbedUrlsFromString(`${scrapping?.caption ? scrapping?.caption?.replace(/(#\S+|\S+#)/g, "").replace(/([.•_ ]+)\n/g, "").replace(/\n+/g, "\n").trim() : ""}`);

    if (!scrapping || status !== 200 && !esUrl(video_url)) {
      const error = ":x: Error. Ha ocurrido un error obteniendo el video.";
      return deferUpdate("", {
        token,
        application_id: env.DISCORD_APPLICATION_ID,
        embeds: errorEmbed(error)
      });
    }

    const finalReply = async (downloadUrl) => {
      button.push({
        type: MessageComponentTypes.BUTTON,
        style: ButtonStyleTypes.LINK,
        label: "Descargar MP4",
        url: downloadUrl
      });

      components.push ({
        type: MessageComponentTypes.ACTION_ROW,
        components: button
      });

      const mensaje = `[${emoji}](${withQuery(`${env.EXT_WORKER_AHMED}/dc/fx`, { video_url: downloadUrl, redirect_url: short_url })}) **${red_social}**: [${short_url.replace("https://", "")}](<${short_url}>)\n${caption}`;
      const fixedMsg = mensaje.length > 500 ? mensaje.substring(0, 500) + "..." : mensaje;

      return await deferUpdate(fixedMsg, {
        token,
        application_id: env.DISCORD_APPLICATION_ID,
        embeds,
        components
      });
    };

    const cdnUrl = `https://cdn.ahmedrangel.com/videos/${red_social.toLowerCase()}/${id}.mp4`;
    const checkCdn = await $fetch.raw(withQuery(cdnUrl, { t: Date.now() })).catch(() => null);
    if (checkCdn?.ok) {
      console.log("Existe en CDN");
      return finalReply(cdnUrl);
    }

    const videoChecker = await $fetch.raw(video_url).catch(() => null);
    const blob = videoChecker?._data;
    const fileSize = blob?.size;
    const contentType = videoChecker?.headers.get("content-type");
    console.log("Tamaño: " + fileSize, "Content-Type: " + contentType);

    const maxSize = 100000000;

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

    const uploadedUrl = await $fetch(`${env.EXT_WORKER_AHMED}/cdn`, {
      method: "PUT",
      headers: { "x-cdn-auth": `${env.CDN_TOKEN}` },
      body: {
        source: video_url,
        prefix: `videos/${red_social.toLowerCase()}`,
        file_name: `${id}.mp4`,
        httpMetadata: {
          "Content-Type": "video/mp4",
          "Content-Disposition": "inline",
          "Cache-Control": "public, max-age=432000"
        }
      }
    });

    return finalReply(uploadedUrl.url);
  };
  context.waitUntil(followUpRequest());
  return deferReply();
};