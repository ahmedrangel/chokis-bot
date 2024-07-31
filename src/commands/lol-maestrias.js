import { deferReply, deferUpdate } from "../interaction";
import { CONSTANTS } from "../constants.js";
import { getLeagueChest, getLeagueMastery } from "../emojis";
const { COLOR } = CONSTANTS;

export const lolMaestrias = (getValue, env, context, token) => {
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
    const embeds = [], fields = [], masteries = [];
    const mensaje = "";
    const masteriesF = await fetch(`${env.EXT_WORKER_AHMED}/lol/masteries/${region}/${riotName}/${riotTag}`);
    const masteriesData = await masteriesF.json();
    if (masteriesData.status_code !== 404) {
      masteriesData.masteries.forEach(m => {
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
        title: masteriesData.region.toUpperCase(),
        description: `## **Puntuación:** ${masteriesData.score}`,
        color: COLOR,
        fields: [...fields],
        author: {
          name: `${masteriesData.riotName} #${masteriesData.riotTag}`,
          icon_url: masteriesData.profileIconUrl
        },
        footer: {
          text: "maestría - campeón - puntos - cofre - usado por última vez"
        }
      });
    }
    else {
      let errorStr = "";
      switch (masteriesData?.errorName) {
        case "riotId":
          errorStr = "No se ha encontrado el **Riot ID**.";
          break;
        case "mastery":
          errorStr = "No se ha podido obtener las **maestrías** de este invocador.";
      }
      embeds.push({
        color: COLOR,
        description: ":x:" + errorStr
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