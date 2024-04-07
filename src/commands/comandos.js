import { avatar } from "../images.js";
import { CONSTANTS } from "../constants.js";
import { reply } from "../interaction.js";
import { InteractionResponseFlags } from "discord-interactions";
const { COLOR, BOT } = CONSTANTS;

export const comandos = (C) => {
  const list = Object.values(C).flatMap((command) => {
    if (command.options[0]?.type == 1) {
      return command.options
        .map(el => {
          const cd = `- </${command.name} ${el.name}:${command.cid}>`;
          const desc = `${el.description}`;
          return `${cd} *${desc}*\n`;
        });
    }
    else {
      return [`-  </${command.name}:${command.cid}> *${command.description}*\n`];
    }
  });

  return reply(null, {
    embeds: [{
      title: "Lista de comandos disponibles",
      description: `${list.join("")}`,
      color: COLOR,
      author: {
        name: BOT,
        icon_url: avatar
      },
      footer: {
        text: "Creado por Ahmed",
      }
    }],
    flags: InteractionResponseFlags.EPHEMERAL
  });
};