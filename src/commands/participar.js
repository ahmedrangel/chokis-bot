import { deferReply, deferUpdate } from "../interaction";
import { CONSTANTS } from "../constants.js";
const { COLOR } = CONSTANTS;
export const participar = (env, context, request_data) => {
  const { member, guild_id, token } = request_data;
  const pId = member.user.id;
  const pName = member.user.username;
  const pAvatar = member.user.avatar;
  const followUpRequest = async () => {
    const selectGuilds = await env.CHOKISDB.prepare(`SELECT activeGiveaway FROM guilds WHERE id = '${guild_id}'`).first();
    const selectGiveaways = await env.CHOKISDB.prepare(`SELECT * FROM giveaways WHERE guildId = '${guild_id}' AND participantId = '${pId}'`).first();
    let title, description;
    if (selectGuilds?.activeGiveaway && !selectGiveaways) {
      await env.CHOKISDB.prepare(`INSERT INTO giveaways (participantId, participantName, guildId, participantAvatar) VALUES ('${pId}', '${pName}', '${guild_id}', '${pAvatar}')`).first();
      title = "✅ ¡Has entrado al sorteo!";
      description = "🤞 Ya estás participando en el torneo. Buena suerte!";
    } else if (selectGuilds?.activeGiveaway && selectGiveaways) {
      description = "⚠️ Ya estás participando en el sorteo.";
    } else {
      description = "❌ No hay ningún sorteo activo para participar.";
    }
    const embeds = [{ color: COLOR, title: title, description: description }];
    return deferUpdate("", {
      token: token,
      application_id: env.DISCORD_APPLICATION_ID,
      embeds: embeds
    });
  };
  context.waitUntil(followUpRequest());
  return deferReply();
};