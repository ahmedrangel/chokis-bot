import { deferReply, deferUpdate, editMessage, getOriginalMessage } from "../interaction";
import { CONSTANTS } from "../constants.js";
import { PARTICIPAR } from "../components.js";
import { getUpdatedAvatarUrl, getRandom, fetchUsers } from "../functions.js";
import { ButtonStyleTypes, MessageComponentTypes } from "discord-interactions";
const { COLOR } = CONSTANTS;

export const sorteo = (env, context, request_data) => {
  const { guild_id, token, data } = request_data;
  const option = data.options[0];
  const followUpRequest = async () => {
    let description, title;
    const buttonComp = { type: MessageComponentTypes.BUTTON };
    const participantes_btn = {
      ...buttonComp,
      style: ButtonStyleTypes.LINK,
      label: "Ver Participantes",
      url: "https://sorteos.ahmedrangel.com/lista/" + guild_id,
      disabled: false
    };
    const participar_btn = {
      ...buttonComp,
      style: ButtonStyleTypes.PRIMARY,
      custom_id: PARTICIPAR.custom_id,
      label: PARTICIPAR.label,
      disabled: false
    };
    const button = [participar_btn, participantes_btn];
    if (option.name === "nuevo") {
      // nuevo
      const select = await env.CHOKISDB.prepare(`SELECT activeGiveaway, msgIdGiveaway, channelIdGiveaway FROM guilds WHERE id = '${guild_id}'`).first();
      if (!select?.activeGiveaway) {
        // edit with disabled buttons if there was a previous giveaway
        if (select?.msgIdGiveaway && select?.channelIdGiveaway) {
          for (const btn of button) { btn.disabled = true; }
          const componentsEdit = [{ type: MessageComponentTypes.ACTION_ROW, components: button }];
          editMessage("", {
            message_id: select?.msgIdGiveaway,
            channel_id: select?.channelIdGiveaway,
            components: componentsEdit,
            token: env.DISCORD_TOKEN
          });
        }
        title = "🎁 ¡Sorteo abierto! 📢";
        description = `📝 Para participar haz click en el botón de \`${PARTICIPAR.label}\``;
        await env.CHOKISDB.prepare(`DELETE FROM giveaways WHERE guildId = '${guild_id}'`).first();
        const message = await getOriginalMessage({ token: token, application_id: env.DISCORD_APPLICATION_ID });
        await env.CHOKISDB.prepare(`INSERT OR REPLACE INTO guilds (id, activeGiveaway, msgIdGiveaway, channelIdGiveaway) VALUES ('${guild_id}', ${true}, '${message.id}', ${message.channel_id})`).first();
      } else {
        description = "⚠️ Ya hay un sorteo activo, debes cerrar o finalizar el sorteo para crear otro.";
        const embeds = [{ color: COLOR, title: title, description: description }];
        return deferUpdate("", {
          token,
          application_id: env.DISCORD_APPLICATION_ID,
          embeds
        });
      }
      const embeds = [{ color: COLOR, title: title, description: description }];
      for (const btn of button) { btn.disabled = false; }
      const components = [{ type: MessageComponentTypes.ACTION_ROW, components: button }];
      return deferUpdate("", {
        token,
        application_id: env.DISCORD_APPLICATION_ID,
        embeds,
        components
      });
    } else if (option.name === "cerrar") {
      // cerrar
      const select = await env.CHOKISDB.prepare(`SELECT activeGiveaway, msgIdGiveaway, channelIdGiveaway FROM guilds WHERE id = '${guild_id}'`).first();
      if (select?.activeGiveaway) {
        title = "🛑 ¡Sorteo cerrado! 📢";
        description = "Las entradas al sorteo han sido cerradas";
        for (const btn of button) {
          if (btn.custom_id === PARTICIPAR.custom_id)
            btn.disabled = true;
        }
        const components = [{ type: MessageComponentTypes.ACTION_ROW, components: button }];
        editMessage("", {
          message_id: select.msgIdGiveaway,
          channel_id: select.channelIdGiveaway,
          components,
          token: env.DISCORD_TOKEN
        });
        await env.CHOKISDB.prepare(`UPDATE guilds SET activeGiveaway = ${false} WHERE id = '${guild_id}'`).first();
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
      let winnerArr;
      const select = await env.CHOKISDB.prepare(`SELECT activeGiveaway, msgIdGiveaway FROM guilds WHERE id = '${guild_id}'`).first();
      const giveaways = await env.CHOKISDB.prepare(`SELECT * FROM giveaways WHERE guildId = '${guild_id}' AND rolled = ${false}`).all();
      const participants = giveaways.results;
      if (!select?.activeGiveaway && participants[0]) {
        const shuffledParticipants = participants.sort(() => Math.random() - 0.5);
        const random = getRandom({ min: 0, max: shuffledParticipants.length - 1 });
        const winner = shuffledParticipants[random];
        winnerArr = winner;
        console.log(random, winner);
        const winnerData = await fetchUsers(winner.participantId, env.DISCORD_TOKEN);
        title = "🥳 ¡Hay un ganador! 📢";
        description = `🪄 <@${winner.participantId}> (${winnerData.username}) ha salido como **ganador** del sorteo. **¡FELICIDADES!** 🎉`;
        await env.CHOKISDB.prepare(`UPDATE giveaways SET rolled = ${true} WHERE participantId = '${winner.participantId}' AND guildId = '${guild_id}'`).first();
      } else if (select?.activeGiveaway && participants[0] && select?.msgIdGiveaway ) {
        description = "⚠️ Cierra el sorteo activo primero antes de sacar un ganador.";
      } else if (select?.activeGiveaway && !participants[0] && select?.msgIdGiveaway ) {
        description = "⚠️ Aún no hay participantes para escoger un ganador.";
      } else if (!select?.activeGiveaway && !participants[0] && select?.msgIdGiveaway ) {
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