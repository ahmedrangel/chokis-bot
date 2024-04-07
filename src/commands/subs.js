import { deferUpdate, deferReply } from "../interaction";
import { CONSTANTS } from "../constants";
import { getSocial } from "../emojis";
const { COLOR } = CONSTANTS;

export const subs = (env, context, token) => {
  const followUpRequest = async () => {
    const response = await fetch(`${env.EXT_WORKER_AHMED}/twitch/subscribers/chinololeroo/total`);
    const { total } = await response.json();
    const twitch = getSocial("twitch");
    const embeds = [{
      color: COLOR,
      description: `${twitch} **ChinoLoleroo** tiene **${total}** suscriptores.`
    }];

    return deferUpdate("", {
      token,
      application_id: env.DISCORD_APPLICATION_ID,
      embeds,
    });
  };

  context.waitUntil(followUpRequest());
  return deferReply();
}