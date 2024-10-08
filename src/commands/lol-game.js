import { ButtonStyleTypes, MessageComponentTypes } from "discord-interactions";
import { deferReply, deferUpdate } from "../interaction";
import { getLeagueEmblem, getLolSpell } from "../emojis";
import { CONSTANTS } from "../constants.js";
import { getDurationFromTimestampMMSS } from "../functions";
const { COLOR } = CONSTANTS;

const teamField = (p) => {
  const tierEmoji = getLeagueEmblem(p.tierFull);
  const winrate = Math.round((p.wins/(p.wins + p.losses))*100);
  const rank = p.rank ? `**${p.rank}**` : "";
  const tierInfo = p.tier ? `${rank} (${p.lp}LP)・${p.wins}V-${p.losses}D (**${winrate}%**)` : "";
  return `${p.riotId.replace(/#/g, " #")}\n${getLolSpell(p.spell1Id)}${getLolSpell(p.spell2Id)} ${p.championName}・${tierEmoji} ${tierInfo}`;
};

export const lolGame = (getValue, env, context, token) => {
  const followUpRequest = async () => {
    const riotId = (getValue("riot_id")).replace(/ /g, "").split("#");
    const region = getValue("servidor");
    const riotName = riotId[0];
    const riotTag = riotId[1];
    if (!riotTag || !riotName) {
      return deferUpdate("", { token,
        application_id: env.DISCORD_APPLICATION_ID,
        embeds: [{
          color: COLOR,
          description: ":x: Ingrese correctamente el **Riot ID**. Ej: **Name#TAG**"
        }]
      });
    }
    const embeds = [], components = [], button = [], fields = [], team1 = [], team2 = [];
    const mensaje = "";
    const gameFetch = await fetch(`${env.EXT_WORKER_AHMED}/lol/spectator/${region}/${riotName}/${riotTag}`);
    const gameData = await gameFetch.json();
    if (gameData.status_code === 200) {
      const gameDuration = getDurationFromTimestampMMSS(gameData.startTime);
      gameData.team1.participants.forEach((p) => {
        team1.push(teamField(p));
      });
      gameData.team2.participants.forEach((p) => {
        team2.push(teamField(p));
      });
      const avg1Emoji = getLeagueEmblem(gameData.team1.eloAvg.tierFull);
      const avg2Emoji = getLeagueEmblem(gameData.team2.eloAvg.tierFull);
      fields.push({
        name: `🟦 EQUIPO AZUL・Avg: ${avg1Emoji} ${gameData.team1.eloAvg.rank}`,
        value: team1.join("\n"),
        inline: false
      });
      fields.push({
        name: `🟥 EQUIPO ROJO・Avg: ${avg2Emoji} ${gameData.team2.eloAvg.rank}`,
        value: team2.join("\n"),
        inline: false
      });
      embeds.push({
        type: "rich",
        description: `**${gameData.gameType}**・**${gameData.region}**・🕓 *${gameDuration}*`,
        color: COLOR,
        fields: [...fields]
      });
      button.push(
        {
          type: MessageComponentTypes.BUTTON,
          style: ButtonStyleTypes.LINK,
          label: "Ver en OP.GG",
          url: `https://op.gg/summoners/${gameData.region.toLowerCase()}/${encodeURIComponent(riotName)}-${encodeURIComponent(riotTag)}/ingame`
        },
        {
          type: MessageComponentTypes.BUTTON,
          style: ButtonStyleTypes.LINK,
          label: "Ver en Porofessor.gg",
          url: `https://porofessor.gg/live/${gameData.region.toLowerCase()}/${encodeURIComponent(riotName)}-${encodeURIComponent(riotTag)}`
        }
      );
      components.push({
        type: MessageComponentTypes.ACTION_ROW,
        components: button
      });
    }
    else {
      embeds.push({
        color: COLOR,
        description: ":x: Error. No se ha encontrado una partida activa"
      });
    }
    return deferUpdate(mensaje, {
      token,
      application_id: env.DISCORD_APPLICATION_ID,
      embeds,
      components
    });
  };
  context.waitUntil(followUpRequest());
  return deferReply();
};