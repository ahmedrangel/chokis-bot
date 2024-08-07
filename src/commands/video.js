import { errorEmbed, esUrl, getGuild, imbedUrlsFromString, obtenerIDDesdeURL } from "../functions";
import { deferReply, deferUpdate } from "../interaction";
import { getSocial } from "../emojis";
import { CONSTANTS, supportedSocials } from "../constants";
import { $fetch } from "ofetch";
import { withQuery } from "ufo";
import { ButtonStyleTypes, MessageComponentTypes } from "discord-interactions";

export const video = (getValue, env, context, request_data) => {
  const followUpRequest = async () => {
    const { token } = request_data;
    const embeds = [], button = [], components = [];
    let emoji;
    let supported = false;
    let red_social = "Instagram / Facebook / TikTok / X / YouTube / Twitch / Kick";
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
    const { id, video_url, short_url, status } = scrapping || {};
    const caption = imbedUrlsFromString(`${scrapping?.caption ? scrapping?.caption?.replace(/#[^\s#]+(\s#[^\s#]+)*$/g, "").replaceAll(".\n", "").replace(/\n+/g, "\n").trim() : ""}`);

    if (!scrapping || status !== 200 && !esUrl(video_url)) {
      const error = ":x: Error. Ha ocurrido un error obteniendo el video.";
      return deferUpdate("", {
        token,
        application_id: env.DISCORD_APPLICATION_ID,
        embeds: errorEmbed(error)
      });
    }

    const finalReply = (downloadUrl) => {
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

      const mensaje = `${emoji} **${red_social}**: [${short_url.replace("https://", "")}](${withQuery(`${env.EXT_WORKER_AHMED}/dc/fx`, { video_url: downloadUrl, redirect_url: short_url })})\n${caption}`;
      const fixedMsg = mensaje.length > 1000 ? mensaje.substring(0, 1000) + "..." : mensaje;

      return deferUpdate(fixedMsg, {
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

    const uploadedUrl = await $fetch(withQuery(`${env.EXT_WORKER_AHMED}/put/video`, { url: video_url, prefix: "videos", dir: red_social.toLowerCase(), file_id: id }));
    return finalReply(uploadedUrl);
  };
  context.waitUntil(followUpRequest());
  return deferReply();
};