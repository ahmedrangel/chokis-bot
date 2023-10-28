import { ButtonStyleTypes, MessageComponentTypes } from "discord-interactions";
import { errorEmbed, esUrl, obtenerIDDesdeURL } from "../functions";
import { deferReply, deferUpdate } from "../interaction";
import { getSocial } from "../emojis";
import { supportedSocials } from "../constants";

export const video = (getValue, env, context, token) => {
  const followUpRequest = async () => {
    let mensaje, emoji;
    let embeds = [], files = [], button = [], components = [];
    let supported = false;
    let red_social = "Instagram / Facebook / TikTok / Twitter / YouTube / Twitch";
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
    if (esUrl(url) && supported == true) {
      const encodedUrl = encodeURIComponent(url);
      const scrappingUrl = red_social !== "YouTube"
        ? `${env.EXT_WORKER_AHMED}/dc/${red_social.toLowerCase()}-video-scrapper?url=${encodedUrl}`
        : `${env.EXT_WORKER_YTDL}/yt-info?url=${encodedUrl}`;
      const scrapping = await fetch(scrappingUrl);
      const json_scrapped = await scrapping.json();
      const url_scrapped = red_social !== "YouTube"
        ? json_scrapped?.video_url
        : `${env.EXT_WORKER_YTDL}/ytdl?url=${encodedUrl}&filter=videoandaudio`;
      const short_url = json_scrapped?.short_url;
      const status = json_scrapped?.status;
      console.log(status);
      if (status === 200 && esUrl(url_scrapped)) {
        const sizeCheckerF = await fetch(url_scrapped);
        const caption = `${json_scrapped?.caption ? json_scrapped?.caption?.replace(/#[^\s#]+(\s#[^\s#]+)*$/g, "").replace(/.\n/g,"").trim() : ""}`;
        const blob = await sizeCheckerF.blob();
        const fileSize = blob.size;
        console.log("Tamaño: " + fileSize);
        if (fileSize < 50000000) {
          const encodedScrappedUrl = encodeURIComponent(url_scrapped);
          const upload = await fetch(`${env.EXT_WORKER_AHMED}/put-r2-chokis?video_url=${encodedScrappedUrl}`);
          const url_uploaded = await upload.text();
          const urlId = obtenerIDDesdeURL(url_uploaded);
          files.push({
            name: `${urlId}.mp4`,
            file: blob
          });
          button.push({
            type: MessageComponentTypes.BUTTON,
            style: ButtonStyleTypes.LINK,
            label: "Descargar MP4",
            url: url_uploaded
          });
          components.push ({
            type: MessageComponentTypes.ACTION_ROW,
            components: button
          });
          mensaje = `${emoji} **${red_social}**: [${short_url.replace("https://", "")}](<${short_url}>)\n${caption}`;
        } else {
          const error = ":x: Error. El video es muy pesado o demasiado largo.";
          embeds = errorEmbed(error);
        }
      } else {
        const error = ":x: Error. Ha ocurrido un error obteniendo el video.";
        embeds = errorEmbed(error);
      }
    } else {
      const error = `:x: Error. El texto ingresado no es un link válido de **${red_social}**`;
      embeds = errorEmbed(error);
    }
    // Return del refer
    return deferUpdate(mensaje, {
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