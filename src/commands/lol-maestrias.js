import { deferReply, deferUpdate } from "../interaction";
import { CONSTANTS } from "../constants.js";
import { getLeagueChest, getLeagueMastery } from "../emojis";
const { COLOR } = CONSTANTS;

export const lolMaestrias = (getValue, env, context, token) => {
  const followUpRequest = async () => {
    const summoner = getValue("invocador");
    const region = getValue("servidor");
    const embeds = [], fields = [], masteries = [];
    let mensaje = "";
    const masteries_fetch = await fetch(`${env.EXT_WORKER_AHMED}/lol/masteries-for-discord?summoner=${summoner}&region=${region}`);
    const masteries_data = await masteries_fetch.json();
    if (masteries_data.status_code !== 404) {
      masteries_data.masteries.forEach(m => {
        const masteryEmoji = getLeagueMastery(m.level);
        const chest = getLeagueChest(m.chestGranted);
        masteries.push(`${masteryEmoji} ${m.championName}・${m.points.toLocaleString()} pts. ${chest} ${m.chestGranted ? "✅" : ""} *hace ${m.usadoHace}*`);
      });
      fields.push({
        name: "Maestrías de campeones más altas:",
        value: masteries.join("\n"),
        inline: false
      });
      embeds.push({
        type: "rich",
        title: masteries_data.region.toUpperCase(),
        description: `**Puntuación Total:** ${masteries_data.score}`,
        color: COLOR,
        fields: [...fields],
        author: {
          name: masteries_data.summonerName,
          icon_url: masteries_data.profileIconUrl
        },
        footer: {
          text: "maestría - campeón - puntos - cofre - usado por última vez",
        }
      });
    } else {
      let errorStr = "";
      switch (masteries_data?.errorName) {
      case "summoner":
        errorStr = "No se ha encontrado el **nombre de invocador**.";
        break;
      case "mastery":
        errorStr = "No se ha podido obtener las **maestrías** de este invocador.";
      }
      embeds.push({
        color: COLOR,
        description: ":x:" + errorStr,
      });
    }
    return deferUpdate(mensaje, {
      token,
      application_id: env.DISCORD_APPLICATION_ID,
      embeds
    });
  };
  context.waitUntil(followUpRequest());
  return deferReply();
};