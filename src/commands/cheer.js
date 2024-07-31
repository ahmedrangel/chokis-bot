import { deferUpdate, deferReply, reply } from "../interaction";
import { CONSTANTS } from "../constants.js";
import { hash } from "ohash";

const { COLOR } = CONSTANTS;

export const cheer = async (getValue, env, context, request_data) => {
  const { member, user, token } = request_data;
  const mensaje = getValue("mensaje").replace(/(<([^>]+)>)/gi, "").trim();
  const user_id = member ? member.user.id : user.id;
  const username = member ? member.user.username : user.username;
  const user_avatar = member ? member.user.avatar : user.avatar;

  if (mensaje.length > 500) return reply(`<@${user_id}> El mensaje no puede tener más de 500 caracteres.`);

  const followUpRequest = async () => {
    const VOZ = "Miguel";
    const text = encodeURIComponent(mensaje);
    const response = await fetch(`https://api.streamelements.com/kappa/v2/speech?voice=${VOZ}&text=${text}`);
    const blob = await response.blob();
    const files = [{ name: `${hash(text)}.mp3`, file: blob }];

    return deferUpdate("", {
      embeds: [{
        description: `\`${mensaje}\``,
        color: COLOR,
        author: {
          name: username,
          icon_url: `https://cdn.discordapp.com/avatars/${user_id}/${user_avatar}.png`
        },
        thumbnail: {
          //url: getEmojiURL("angarG2")
        },
        footer: {
          text: `Voz: ${VOZ}. Caracteres: ${mensaje.length} de 500.`
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
