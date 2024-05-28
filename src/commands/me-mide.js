import { getEmoji } from "../emojis";
import { getRandom } from "../functions";
import { reply } from "../interaction";

export const meMide = (member) => {
  const cm = getRandom({max: 32});
  const emoji = cm >= 12 ? getEmoji("monkU") : getEmoji("chinoSidadge");
  return reply(`A <@${member.id}> le mide **${cm}** centímetros. ${emoji}`);
};