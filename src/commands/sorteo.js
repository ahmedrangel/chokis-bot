import { deferReply, deferUpdate } from "../interaction";
import { CONSTANTS } from "../constants.js";
import { PARTICIPAR } from "../commands.js";
import { getAvatarExtension, getRandom } from "../functions.js";
const { COLOR } = CONSTANTS;
export const sorteo = (env, context, request_data) => {
  const { guild_id, token, data } = request_data;
  const option = data.options[0];
  const followUpRequest = async () => {
    let description, title, winnerArr;
    if (option.name === "nuevo") {
      const select = await env.CHOKISDB.prepare(`SELECT activeGiveaway FROM guilds WHERE id = '${guild_id}'`).first();
      if (!select?.activeGiveaway) {
        title = "🎁 ¡Sorteo abierto! 📢";
        description = `📝 Para participar usa el comando: </${PARTICIPAR.name}:${PARTICIPAR.cid}>`;
        await env.CHOKISDB.prepare(`DELETE FROM giveaways WHERE guildId = '${guild_id}'`).first();
        await env.CHOKISDB.prepare(`INSERT OR REPLACE INTO guilds (id, activeGiveaway) VALUES ('${guild_id}', ${true})`).first();
      } else {
        description = "⚠️ Ya hay un sorteo activo, debes cerrar o finalizar el sorteo para crear otro.";
      }
      const embeds = [{ color: COLOR, title: title, description: description }];
      return deferUpdate("", {
        token: token,
        application_id: env.DISCORD_APPLICATION_ID,
        embeds: embeds
      });
    } else if (option.name === "cerrar") {
      const select = await env.CHOKISDB.prepare(`SELECT activeGiveaway FROM guilds WHERE id = '${guild_id}'`).first();
      if (select.activeGiveaway) {
        title = "🛑 ¡Sorteo cerrado! 📢";
        description = "Las entradas al torneo han sido cerradas";
        await env.CHOKISDB.prepare(`INSERT OR REPLACE INTO guilds (id, activeGiveaway) VALUES ('${guild_id}', ${false})`).first();
      } else {
        description = "⚠️ No hay ningun sorteo activo.";
      }
      const embeds = [{ color: COLOR, title: title, description: description }];
      return deferUpdate("", {
        token: token,
        application_id: env.DISCORD_APPLICATION_ID,
        embeds: embeds
      });
    } else if (option.name === "sacar") {
      const select = await env.CHOKISDB.prepare(`SELECT activeGiveaway FROM guilds WHERE id = '${guild_id}'`).first();
      const giveaways = await env.CHOKISDB.prepare(`SELECT * FROM giveaways WHERE guildId = '${guild_id}'`).all();
      const participants = giveaways.results;
      if (!select?.activeGiveaway && participants[0]) {
        const random = getRandom({ min: 0, max: participants.length - 1 });
        const winner = participants[random];
        winnerArr = winner;
        console.log(random, winner);
        title = "🏆 ¡Hay un ganador! 📢";
        description = `🪄 <@${winner.participantId}> (${winner.participantName}) ha salido como **ganador** del sorteo. ¡Felicidades!\nTotal de participantes: ${participants.length}`;
      } else if (select?.activeGiveaway && participants[0]) {
        description = "⚠️ Cierra el sorteo activo primero para sacar un ganador.";
      } else if (select?.activeGiveaway && !participants[0]) {
        description = "⚠️ Aún no hay participantes para escoger un ganador.";
      } else {
        description = "❌ No hay ningún sorteo activo para sacar un ganador.";
      }
      const extension = await getAvatarExtension(winnerArr?.participantId, winnerArr?.participantAvatar);
      console.log(extension);
      const embeds = [{
        color: COLOR,
        title: title,
        description: description,
        image: {
          url: `https://cdn.discordapp.com/avatars/${winnerArr?.participantId}/${winnerArr?.participantAvatar}.${extension}?size=2048`,
        }
      }];
      return deferUpdate("", {
        token: token,
        application_id: env.DISCORD_APPLICATION_ID,
        embeds: embeds
      });
    }
  };
  context.waitUntil(followUpRequest());
  return deferReply();
};