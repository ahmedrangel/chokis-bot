import { deferReply, deferUpdate } from "../interaction";
import { getLeagueEmblem } from "../emojis";
import { CONSTANTS } from "../constants.js";
const { COLOR } = CONSTANTS;

export const lolMMR = (getValue, env, context, token) => {
  const followUpRequest = async () => {
    const summoner = getValue("invocador");
    const region = getValue("servidor");
    const type = getValue("cola");
    const embeds = [];
    let mensaje = "";
    let footer;
    const profile_fetch = await fetch(`https://dev.ahmedrangel.com/lol/elo-for-discord?summoner=${summoner}&region=${region}&type=${type.toLowerCase()}`);
    const profile_data = await profile_fetch.json();
    if (profile_data.status_code !== 404) {
      const queueName = profile_data.ranked.queueName === "Flex" ? "Flexible" : "Solo/Duo";
      const tierEmoji = getLeagueEmblem(profile_data.ranked.tier);
      const avgTierEmoji = getLeagueEmblem(profile_data.avg.tier);
      const wins = profile_data.ranked.wins;
      const losses = profile_data.ranked.losses;
      const winrate = Math.round((wins/(wins + losses))*100);
      embeds.push({
        type: "rich",
        title: profile_data.region,
        color: COLOR,
        fields: [
          {
            name: `${queueName}: ${tierEmoji} ${profile_data.ranked.tier} ${profile_data.ranked.rank}`,
            value: `${profile_data.ranked.leaguePoints} LP・${wins}V - ${losses}D **(${winrate}% WR)**`,
            inline: false
          },
          {
            name: `ELO MMR aproximado: ${avgTierEmoji} ${profile_data.avg.tier} ${profile_data.avg.rank}`,
            value: "",
            inline: false,
          }
        ],
        author: {
          name: profile_data.summonerName,
          icon_url: profile_data.profileIconUrl
        },
        footer: {
          text: footer,
          icon_url: "https://cdn.ahmedrangel.com/LOL_Icon.png"
        }
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
      case "ranked":
        errorName= `La cuenta es **unranked** en **${type}**`;
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
      embeds
    });
  };

  context.waitUntil(followUpRequest());
  return deferReply();
};