import { avatar, guide } from "../images.js";
import { CONSTANTS } from "../constants.js";
import { reply } from "../interaction.js";
const { COLOR, BOT } = CONSTANTS;

export const comandos = (C) => {
  let list = Object.values(C).flatMap((command) => {
    if (command.options[0]?.type == 1) {
      return command.options
        .map(el => {
          const cd = `- </${command.name} ${el.name}:${command.cid}>`;
          const desc = `${el.description}`;
          return el.name == "eliminar" ? `${cd} **🛡️ [MOD]** *${desc.replace("🔒","").trim()}*\n` : `${cd} *${desc}*\n`;

        });
    } else {
      return [`-  </${command.name}:${command.cid}> *${command.description}*\n`];
    }
  });

  return reply(null, { embeds: [{
    title: "Lista de comandos disponibles",
    description: `${list.join("")}` +
                    "Escribe el comando que desees en la caja de enviar mensajes de discord y selecciona la opción que se muestra junto al avatar del bot. Se irán añadiendo más comandos divertidos con el tiempo.",
    color: COLOR,
    author: {
      name: BOT,
      icon_url: avatar
    },
    image: {
      url: guide
    },
    footer: {
      text: "Creado por Ahmed",
    }
  }]});
};