import * as C from "./commands.js";
import { create, error } from "./interaction.js";
import * as cmd from "./commands/imports.js";
import { InteractionType } from "discord-interactions";

export const commandsHandler = async (req, env, context) => {
  const request_data = await req.json();
  if (request_data.type === InteractionType.PING) {
    /**
     * The `PING` message is used during the initial webhook handshake, and is
       required to configure the webhook in the developer portal.
     */
    console.log("Handling Ping request");
    return create(request_data.type);
  } else {
    const { type, data, member, token } = request_data;
    const { name, options, resolved } = data;
    return create(type, options, async ({ getValue = (name) => name }) => {
      switch (name) {
      // comando /memide
      case C.ME_MIDE.name: {
        return cmd.meMide(member);
      }
      // Comando /mecabe
      case C.ME_CABE.name: {
        return cmd.meCabe(member);
      }
      // comando /comandos
      case C.COMANDOS.name: {
        return cmd.comandos(C);
      }
      // comando /lolprofile
      case C.LOLPROFILE.name: {
        return cmd.lolProfile(getValue, env, context, token);
      }
      // comando /lolmmr
      case C.LOLMMR.name: {
        return cmd.lolMMR(getValue, env, context, token);
      }
      // comando /lolgame
      case C.LOLGAME.name: {
        return cmd.lolGame(getValue, env, context, token);
      }
      // comando /lolmaestrias
      case C.LOLMASTERY.name: {
        return cmd.lolMaestrias(getValue, env, context, token);
      }
      // comando /video
      case C.VIDEO.name: {
        return cmd.video(getValue, env, context, token);
      }
      // comando /audio
      case C.AUDIO.name: {
        return cmd.audio(getValue, env, context, token);
      }
      // comando /test
      case C.TEST.name: {
        return cmd.test(env, context, token);
      }
      default:
        return error("Unknown Type", 400);
      }
    });
  }
};