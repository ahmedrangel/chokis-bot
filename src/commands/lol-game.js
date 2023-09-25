import { ButtonStyleTypes, MessageComponentTypes } from "discord-interactions";
import { deferReply, deferUpdate } from "../interaction";
import { getLeagueEmblem, getLolSpell } from "../emojis";
import { CONSTANTS } from "../constants.js";
const { COLOR } = CONSTANTS;

export const lolGame = (getValue, env, context, token) => {
  const followUpRequest = async () => {
    const summoner = getValue("invocador");
    const region = getValue("servidor");
    const embeds = [], components = [], button = [], fields = [], team1 = [], team2 = [];
    let mensaje = "";
    const gameFetch = await fetch(`${env.EXT_WORKER_AHMED}/lol/live-game-for-discord?summoner=${summoner}&region=${region}`);
    const gameData = await gameFetch.json();
    if (gameData.status_code === 200) {
      gameData.team1.participants.forEach((p) => {
        const tierEmoji = getLeagueEmblem(p.tierFull);
        if (p.tier) {
          const winrate = Math.round((p.wins/(p.wins + p.losses))*100);
          team1.push(`**${p.summonerName}**\n${getLolSpell(p.spell1Id)}${getLolSpell(p.spell2Id)} ${p.championName}・${tierEmoji} **${p.rank}** (${p.lp}LP)・${p.wins}V - ${p.losses}D **(${winrate}%)**`);
        } else {
          team1.push(`**${p.summonerName}**\n${getLolSpell(p.spell1Id)}${getLolSpell(p.spell2Id)} ${p.championName}・${tierEmoji}`);
        }
      });
      gameData.team2.participants.forEach((p) => {
        const tierEmoji = getLeagueEmblem(p.tierFull);
        if (p.tier) {
          const winrate = Math.round((p.wins/(p.wins + p.losses))*100);
          team2.push(`**${p.summonerName}**\n${getLolSpell(p.spell1Id)}${getLolSpell(p.spell2Id)} ${p.championName}・${tierEmoji} **${p.rank}** (${p.lp}LP)・${p.wins}V - ${p.losses}D **(${winrate}%)**`);
        } else {
          team2.push(`**${p.summonerName}**\n${getLolSpell(p.spell1Id)}${getLolSpell(p.spell2Id)} ${p.championName}・${tierEmoji}`);
        }
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
        title: `${gameData.region} (${gameData.gameType})`,
        color: COLOR,
        fields: [...fields],
      });
      button.push(
        {
          type: MessageComponentTypes.BUTTON,
          style: ButtonStyleTypes.LINK,
          label: "Ver en OP.GG",
          url: `https://op.gg/summoners/${gameData.region.toLowerCase()}/${encodeURIComponent(summoner)}/ingame`
        },
        {
          type: MessageComponentTypes.BUTTON,
          style: ButtonStyleTypes.LINK,
          label: "Ver en Porofessor.gg",
          url: `https://porofessor.gg/live/${gameData.region.toLowerCase()}/${encodeURIComponent(summoner)}`
        }
      );
      components.push({
        type: MessageComponentTypes.ACTION_ROW,
        components: button
      });
    } else {
      embeds.push({
        color: COLOR,
        description: ":x: Error. No se ha encontrado una partida activa",
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