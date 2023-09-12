import { getEmoji } from "../emojis";
import { getRandom } from "../functions";
import { reply } from "../interaction";

export const meCabe = (member) => {
  const cm = getRandom({max: 43});
  const emoji = cm >= 12 ? getEmoji("AYAYAgasm") : getEmoji("uuh");
  return reply(`A <@${member.user.id}> le caben **${cm}** centímetros. ${emoji}`);
};