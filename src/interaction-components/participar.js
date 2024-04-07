import { deferReply, deferUpdate, editFollowUpMessage } from "../interaction";
import { CONSTANTS } from "../constants.js";
import { InteractionResponseFlags } from "discord-interactions";
import { PARTICIPAR } from "../components.js";
const { COLOR } = CONSTANTS;
export const participar = (env, context, request_data) => {
  const { member, guild_id, token, message } = request_data;
  const pId = member.user.id;
  const pName = member.user.username;
  const pAvatar = member.user.avatar;
  const participantsLink = "https://sorteos.ahmedrangel.com/lista/" + guild_id;
  const viewParticipants = `Puedes ver a todos los participantes haciendo [click aquí](${participantsLink}).`;
  const followUpRequest = async () => {
    const selectGuilds = await env.CHOKISDB.prepare(`SELECT activeGiveaway FROM guilds WHERE id = '${guild_id}'`).first();
    const selectGiveaways = await env.CHOKISDB.prepare(`SELECT * FROM giveaways WHERE guildId = '${guild_id}' AND participantId = '${pId}'`).first();
    let title, description;
    if (selectGuilds?.activeGiveaway && !selectGiveaways) {
      await env.CHOKISDB.prepare(`INSERT INTO giveaways (participantId, participantName, guildId, participantAvatar) VALUES ('${pId}', '${pName}', '${guild_id}', '${pAvatar}')`).first();
      title = "✅ ¡Has entrado al sorteo!";
      description = `🤞 Ya estás participando en el sorteo. Buena suerte!\n\n${viewParticipants}`;
      for (let i = 0; i < 3; i++) {
        try {
          const upload = await fetch(`${env.EXT_WORKER_AHMED}/put/discord-avatars?url=https://cdn.discordapp.com/avatars/${pId}/${pAvatar}?size=256`);
          if (upload.ok) {
            console.log("avatar uploaded");
            break;
          }
        }
        catch (e) {
          console.log(e);
        }
      }
      const participants = await env.CHOKISDB.prepare(`SELECT COUNT(participantId) as count FROM giveaways WHERE guildId = '${guild_id}'`).first();
      const embedsEdit = [{
        color: COLOR,
        title: "🎁 ¡Sorteo abierto! 📢",
        description: `📝 Para participar haz click en el botón de \`${PARTICIPAR.label}\`\n### \`Participantes: ${participants.count}\``
      }];
      await editFollowUpMessage("", {
        token,
        application_id: env.DISCORD_APPLICATION_ID,
        embeds: embedsEdit,
        message_id: message.id
      });
    }
    else if (selectGuilds?.activeGiveaway && selectGiveaways) {
      title = "⚠️ Ya estás participando en el sorteo";
      description = "Espera que el moderador anuncie el ganador.";
    }
    else {
      description = "❌ No hay ningún sorteo activo para participar.";
    }
    const embeds = [{ color: COLOR, title: title, description: description }];
    return deferUpdate("", {
      token,
      application_id: env.DISCORD_APPLICATION_ID,
      embeds,
    });
  };
  context.waitUntil(followUpRequest());
  return deferReply({flags: InteractionResponseFlags.EPHEMERAL});
};