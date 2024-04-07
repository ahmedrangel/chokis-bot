import { getSocial } from "../emojis";
import { errorEmbed } from "../functions";
import { deferReply, deferUpdate } from "../interaction";

export const audio = (getValue, env, context, token) => {
  const followUpRequest = async () => {
    let mensaje = "";
    let embeds = [];
    const files = [];
    const url = getValue("link");
    if (url.includes("youtube.com/") || url.includes("youtu.be/")) {
      const encodedUrl = encodeURIComponent(url);
      const infoF = await fetch(`${env.EXT_WORKER_AHMED}/dc/youtube/mp3?url=${encodedUrl}&filter=audio`);
      const info = await infoF.json();
      const title = info?.caption;
      const duration = info?.duration;
      if (infoF.ok) {
        if (duration <= 600) {
          const youtubeF = await fetch(info?.video_url);
          const audioBlob = await youtubeF.blob();
          const fileSize = audioBlob.size;
          console.log("Tamaño: " + fileSize);
          if (fileSize < 50000000) {
            mensaje = `${getSocial("youtube")} YouTube: [${info?.short_url.replace("https://", "")}](<${info?.short_url}>)\n${title}`;
            files.push({
              name: `${title}.mp3`,
              file: audioBlob
            });
          }
          else {
            const error = ":x: Error. El video de youtube es muy pesado o demasiado largo.";
            embeds = errorEmbed(error);
          }
        }
        else {
          embeds = errorEmbed(":x: Error. La duración del video debe ser menor de **10 minutos**");
        }
      }
      else {
        console.error("Error:", info.error);
        embeds = errorEmbed(":x: " + info.error);
      }
    }
    else {
      const error = ":x: Error. El texto ingresado no es un link válido de YouTube.";
      embeds = errorEmbed(error);
    }
    // Return del refer
    return deferUpdate(mensaje, {
      token,
      application_id: env.DISCORD_APPLICATION_ID,
      embeds,
      files
    });
  };
  context.waitUntil(followUpRequest());
  return deferReply();
};