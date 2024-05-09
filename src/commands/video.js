import { errorEmbed, esUrl, getGuild, imbedUrlsFromString, obtenerIDDesdeURL } from "../functions";
import { deferReply, deferUpdate } from "../interaction";
import { getSocial } from "../emojis";
import { CONSTANTS, supportedSocials } from "../constants";
import { ButtonStyleTypes, MessageComponentTypes } from "discord-interactions";

export const video = async (getValue, env, context, request_data) => {
  const followUpRequest = async () => {
    const { guild_id, token } = request_data;
    let mensaje, emoji;
    let embeds = [];
    const files = [], button = [], components = [];
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
      const scrappingUrl = `${env.EXT_WORKER_AHMED}/dc/${red_social.toLowerCase()}-video-scrapper?url=${encodedUrl}&filter=video`;
      const scrapping = await fetch(scrappingUrl);
      const json_scrapped = await scrapping.json();
      const url_scrapped = json_scrapped?.video_url;
      const short_url = json_scrapped?.short_url;
      const status = json_scrapped?.status;
      console.log(status);
      if (status === 200 && esUrl(url_scrapped)) {
        let retryCount = 0;
        const fetchScraped = async() => {
          const sizeCheckerF = await fetch(url_scrapped);
          const caption = `${json_scrapped?.caption ? json_scrapped?.caption?.replace(/#[^\s#]+(\s#[^\s#]+)*$/g, "").replace(/.\n/g,"").trim() : ""}`;
          const blob = await sizeCheckerF.blob();
          const fileSize = blob.size;
          console.log("Tamaño: " + fileSize);
          return {blob: blob, fileSize: fileSize, caption: imbedUrlsFromString(caption)};
        };
        let {blob, fileSize, caption} = await fetchScraped();
        while (fileSize < 100 && retryCount < 3) {
          console.log("El tamaño del archivo es 0. Volviendo a intentar...");
          await new Promise(resolve => setTimeout(resolve, 1000));
          ({ blob, fileSize, caption } = await fetchScraped());
          retryCount++;
          console.log("Intento: " + retryCount);
        }
        const guild = await getGuild(guild_id, env.DISCORD_TOKEN);
        console.log("premium tier: " + guild.premium_tier);
        const maxSize = guild.premium_tier >= 3 ? 100000000 : (guild.premium_tier === 2 ? 50000000 : 25000000);
        if (fileSize > 100 && fileSize < maxSize) {
          const encodedScrappedUrl = encodeURIComponent(url_scrapped);
          const upload = await fetch(`${env.EXT_WORKER_AHMED}/put/video?url=${encodedScrappedUrl}&bot_name=${CONSTANTS.BOT}`);
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
        }
        else if (retryCount === 3) {
          const error = ":x: Error. Ha ocurrido un error obteniendo el video.";
          embeds = errorEmbed(error);
        }
        else {
          const error = "⚠️ Error. El video es muy pesado o demasiado largo.";
          embeds = errorEmbed(error);
        }
      }
      else {
        const error = ":x: Error. Ha ocurrido un error obteniendo el video.";
        embeds = errorEmbed(error);
      }
    }
    else {
      const error = `⚠️ Error. El texto ingresado no es un link válido de **${red_social}**`;
      embeds = errorEmbed(error);
    }
    // Return del refer
    return await deferUpdate(mensaje, {
      token,
      application_id: env.DISCORD_APPLICATION_ID,
      embeds,
      components,
      files
    });
  };
  await context.waitUntil(followUpRequest());
  return await deferReply();
};