import { ButtonStyleTypes, MessageComponentTypes } from "discord-interactions";
import { deferReply, deferUpdate } from "../interaction";
import { getLeagueEmblem, getLolSpell } from "../emojis";
import { CONSTANTS } from "../constants.js";
const { COLOR } = CONSTANTS;

export const lolProfile = (getValue, env, context, token) => {
  const followUpRequest = async () => {
    const summoner = getValue("invocador");
    const region = getValue("servidor");
    const embeds = [];
    let components = [];
    let button = [];
    let mensaje = "";
    let remake, footer, titleName;
    const profile_fetch = await fetch(`${env.EXT_WORKER_AHMED}/lol/profile-for-discord?summoner=${summoner}&region=${region}`);
    const profile_data = await profile_fetch.json();
    if (profile_data.status_code !== 404) {
      if (profile_data.titleName !== "") {
        titleName = `*${profile_data.titleName}*`;
      } else {
        titleName = "";
      }
      let queue = "";
      const nivel = {
        name: "Nivel",
        value: `${profile_data.summonerLevel}`,
        inline: true
      };
      const history = [];
      const fields = [];
      profile_data.rankProfile.forEach((rank) => {
        if (rank.queueType == "RANKED_SOLO_5x5") {
          queue = "Solo/Duo";
        } else if (rank.queueType == "RANKED_FLEX_SR") {
          queue = "Flexible";
        } else if (rank.queueType == "RANKED_TFT_DOUBLE_UP") {
          queue = "TFT Dúo Dinámico";
        }
        const winrate = Math.round((rank.wins/(rank.wins + rank.losses))*100);
        const tierEmoji = getLeagueEmblem(rank.tier);
        let rankNumber;
        if (rank.tier == "MAESTRO" || rank.tier == "GRAN MAESTRO" || rank.tier == "RETADOR") {
          rankNumber = "";
        } else {
          rankNumber = rank.rank;
        }
        fields.push({
          name: `${queue}: ${tierEmoji} ${rank.tier} ${rankNumber}`,
          value: `${rank.leaguePoints} LP・${rank.wins}V - ${rank.losses}D **(${winrate}% WR)**`,
          inline: true
        });
      });

      profile_data.matchesHistory.forEach((match) => {
        let resultado;
        if (match.remake == "true") {
          resultado = "⬜";
          remake = true;
        } else {
          resultado = match.win === "true" ? "🟦" : "🟥";
        }
        const championName = match.championName.replaceAll(" ", "");
        const k = match.kills;
        const d = match.deaths;
        const a = match.assists;
        const queueName = match.queueName;
        const strTime = match.strTime;
        const spell1 = getLolSpell(match.summoner1Id);
        const spell2 = getLolSpell(match.summoner2Id);
        history.push(`${resultado} ${spell1}${spell2} ${championName}・**${k}/${d}/${a}**・${queueName}・*${strTime}*`);
      });
      fields.push({
        name: "Partidas recientes:",
        value: history.join("\n"),
        inline: false
      });
      if (remake == true) {
        footer = "🟦 = victoriaㅤ🟥 = derrotaㅤ⬜ = remake";
      } else {
        footer = "🟦 = victoriaㅤ🟥 = derrota";
      }
      embeds.push({
        type: "rich",
        title: profile_data.region,
        description: `${titleName}`,
        color: COLOR,
        fields: [nivel, ...fields],
        author: {
          name: profile_data.summonerName,
          icon_url: profile_data.profileIconUrl
        },
        footer: {
          text: footer,
          icon_url: "https://cdn.ahmedrangel.com/LOL_Icon.png"
        }
      });
      button.push(
        {
          type: MessageComponentTypes.BUTTON,
          style: ButtonStyleTypes.LINK,
          label: "Ver en OP.GG",
          url: `https://op.gg/summoners/${profile_data.region}/${encodeURIComponent(profile_data.summonerName)}`
        },
        {
          type: MessageComponentTypes.BUTTON,
          style: ButtonStyleTypes.LINK,
          label: "Ver en U.GG",
          url: `https://u.gg/lol/profile/${profile_data.route}/${encodeURIComponent(profile_data.summonerName)}/overview`
        });
      components.push({
        type: MessageComponentTypes.ACTION_ROW,
        components: button
      });
    } else {
      let errorName;
      switch(profile_data.errorName) {
      case "summoner":
        errorName = "No se ha encontrado el **nombre de invocador**.";
        break;
      case "region":
        errorName= "La **región** ingresada es incorrecta.";
        break;
      }
      embeds.push({
        color: COLOR,
        description: `:x: Error. ${errorName}`,
      });
    }
    console.log(embeds);
    // Return del refer
    return deferUpdate(mensaje, {
      token,
      application_id: env.DISCORD_APPLICATION_ID,
      embeds,
      components
    });
  };

  context.waitUntil(followUpRequest()); // waitUntil permite que se ejecute una función Promise después de haber retornado una respuesta
  return deferReply(); // Esto se ejecuta antes que el waitUntil
};