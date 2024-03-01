import { deferUpdate, deferReply } from "../interaction";
import { CONSTANTS } from "../constants.js";
import { hash } from "ohash";

const { COLOR } = CONSTANTS;

export const cheer = async (getValue, env, context, request_data) => {
  const followUpRequest = async () => {
    const VOZ = "Miguel";
    const { member, token } = request_data;

    const mensaje = getValue("mensaje").replace(/(<([^>]+)>)/gi, "").trim();
    const bits = [

    ];
    if (mensaje.length > 500) return reply(`<@${member.user.id}> El mensaje no puede tener más de 500 caracteres.`);
    const text = encodeURIComponent(mensaje);
    const response = await fetch(`https://api.streamelements.com/kappa/v2/speech?voice=${VOZ}&text=${text}`);
    const blob = await response.blob();
    const files = [{ name: `${hash(text)}.mp3`, file: blob }];

    return deferUpdate("", {
      embeds : [{
        description: `\`${mensaje}\``,
        color: COLOR,
        author: {
          name: member.user.username,
          icon_url: `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png`
        },
        thumbnail: {
          //url: getEmojiURL("angarG2")
        },
        footer: {
          text: `Voz: ${VOZ}. Caracteres: ${mensaje.length} de 500.`,
          // icon_url: bits[getRandom({min: 0, max: bits.length - 1})]
        }
      }],
      token,
      application_id: env.DISCORD_APPLICATION_ID,
      files
    });
  };

  context.waitUntil(followUpRequest());
  return deferReply();
};
