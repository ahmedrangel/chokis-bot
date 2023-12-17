import { deferReply, deferUpdate, editMessage, getOriginalMessage } from "../interaction";
import { CONSTANTS } from "../constants.js";
import { PARTICIPAR } from "../components.js";
import { getUpdatedAvatarUrl, getRandom } from "../functions.js";
import { ButtonStyleTypes, MessageComponentTypes } from "discord-interactions";
const { COLOR } = CONSTANTS;

export const sorteo = (env, context, request_data) => {
  const { guild_id, token, data } = request_data;
  const option = data.options[0];
  const followUpRequest = async () => {
    let description, title, winnerArr;
    const buttonComp = { type: MessageComponentTypes.BUTTON };
    const participantes_btn = {
      ...buttonComp,
      style: ButtonStyleTypes.LINK,
      label: "Ver Participantes",
      url: "https://sorteos.ahmedrangel.com/lista/" + guild_id,
    };
    const participar_btn = {
      ...buttonComp,
      style: ButtonStyleTypes.PRIMARY,
      custom_id: PARTICIPAR.custom_id,
      label: PARTICIPAR.label
    };
    const button = [participantes_btn];
    if (option.name === "nuevo") {
      // nuevo
      const select = await env.CHOKISDB.prepare(`SELECT activeGiveaway FROM guilds WHERE id = '${guild_id}'`).first();
      if (!select?.activeGiveaway) {
        title = "🎁 ¡Sorteo abierto! 📢";
        description = `📝 Para participar haz click en el botón de \`${PARTICIPAR.label}\``;
        await env.CHOKISDB.prepare(`DELETE FROM giveaways WHERE guildId = '${guild_id}'`).first();
        const message = await getOriginalMessage({ token: token, application_id: env.DISCORD_APPLICATION_ID });
        await env.CHOKISDB.prepare(`INSERT OR REPLACE INTO guilds (id, activeGiveaway, msgIdGiveaway, channelIdGiveaway) VALUES ('${guild_id}', ${true}, '${message.id}', ${message.channel_id})`).first();
        button.push(participar_btn);
      } else {
        description = "⚠️ Ya hay un sorteo activo, debes cerrar o finalizar el sorteo para crear otro.";
      }
      const embeds = [{ color: COLOR, title: title, description: description }];
      const components = [{ type: MessageComponentTypes.ACTION_ROW, components: button.reverse() }];
      return deferUpdate("", {
        token,
        application_id: env.DISCORD_APPLICATION_ID,
        embeds,
        components
      });
    } else if (option.name === "cerrar") {
      // cerrar
      const select = await env.CHOKISDB.prepare(`SELECT activeGiveaway, msgIdGiveaway, channelIdGiveaway FROM guilds WHERE id = '${guild_id}'`).first();
      if (select.activeGiveaway) {
        title = "🛑 ¡Sorteo cerrado! 📢";
        description = "Las entradas al torneo han sido cerradas";
        button.push(participar_btn);
        button.forEach(button => { button.disabled = true; });
        const components = [{ type: MessageComponentTypes.ACTION_ROW, components: button.reverse() }];
        editMessage("", {
          message_id: select.msgIdGiveaway,
          channel_id: select.channelIdGiveaway,
          components,
          token: env.DISCORD_TOKEN
        });
        await env.CHOKISDB.prepare(`INSERT OR REPLACE INTO guilds (id, activeGiveaway, msgIdGiveaway, channelIdGiveaway) VALUES ('${guild_id}', ${false}, ${null}, ${null})`).first();
      } else {
        description = "⚠️ No hay ningun sorteo activo.";
      }
      const embeds = [{ color: COLOR, title: title, description: description }];
      return deferUpdate("", {
        token,
        application_id: env.DISCORD_APPLICATION_ID,
        embeds
      });
    } else if (option.name === "sacar") {
      // sacar
      const select = await env.CHOKISDB.prepare(`SELECT activeGiveaway FROM guilds WHERE id = '${guild_id}'`).first();
      const giveaways = await env.CHOKISDB.prepare(`SELECT * FROM giveaways WHERE guildId = '${guild_id}' AND rolled = ${false}`).all();
      const participants = giveaways.results;
      console.log(participants[0]);
      if (!select?.activeGiveaway && participants[0]) {
        const random = getRandom({ min: 0, max: participants.length - 1 });
        const winner = participants[random];
        winnerArr = winner;
        console.log(random, winner);
        title = "🥳 ¡Hay un ganador! 📢";
        description = `🪄 <@${winner.participantId}> (${winner.participantName}) ha salido como **ganador** del sorteo. **¡FELICIDADES!** 🎉`;
        await env.CHOKISDB.prepare(`UPDATE giveaways SET rolled = ${true} WHERE participantId = '${winner.participantId}' AND guildId = '${guild_id}'`).first();
      } else if (select?.activeGiveaway && participants[0]) {
        description = "⚠️ Cierra el sorteo activo primero antes de sacar un ganador.";
      } else if (select?.activeGiveaway && !participants[0]) {
        description = "⚠️ Aún no hay participantes para escoger un ganador.";
      } else if (!select?.activeGiveaway && !participants[0]) {
        description = "⚠️ No hay más participantes para sacar.";
      } else {
        description = "❌ No hay ningún sorteo activo para sacar un ganador.";
      }
      const avatarUrl = await getUpdatedAvatarUrl(winnerArr?.participantId, winnerArr?.participantAvatar, env.DISCORD_TOKEN);
      const embeds = [{
        color: COLOR,
        title: title,
        description: description,
        image: {
          url: avatarUrl,
        }
      }];
      return deferUpdate("", {
        token,
        application_id: env.DISCORD_APPLICATION_ID,
        embeds
      });
    }
  };
  context.waitUntil(followUpRequest());
  return deferReply();
};