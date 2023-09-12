import { deferReply, deferUpdate } from "../interaction";

export const test = (env, context,token) => {
  const followUpRequest = async () => {
    let mensaje = "Hoy es el cumpleaños de <@341828695612456960> (@ahmedrangel), FELIZ CUMPLEAÑOS!! :birthday: :cake: :partying_face: :tada: :balloon:";
    // Return del refer
    return deferUpdate(mensaje, {
      token,
      application_id: env.DISCORD_APPLICATION_ID,
    });
  };
  context.waitUntil(followUpRequest());
  return deferReply();
};