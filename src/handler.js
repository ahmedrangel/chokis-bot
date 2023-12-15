import * as C from "./commands.js";
import { create, error } from "./interaction.js";
import * as cmd from "./commands/imports.js";
import * as ic from "./interaction-components/imports.js";
import * as COMP from "./components.js";
import { InteractionType } from "discord-interactions";

export const commandsHandler = async (req, env, context) => {
  const request_data = await req.json();
  const { type, data, member, token } = request_data;
  const { name, options, custom_id } = data;
  if (request_data.type === InteractionType.PING) {
    /**
     * The `PING` message is used during the initial webhook handshake, and is
       required to configure the webhook in the developer portal.
     */
    console.log("Handling Ping request");
    return create(request_data.type);
  } else if (request_data.type === InteractionType.MESSAGE_COMPONENT) {
    switch (custom_id) {
    case COMP.PARTICIPAR.custom_id: return ic.participar(env, context, request_data);
    default: return error("Unknown Type", 400);
    }
  } else {
    console.log("/" + name);
    return create(type, options, async ({ getValue = (name) => name }) => {
      switch (name) {
      // comando /memide
      case C.ME_MIDE.name: return cmd.meMide(member);
      // Comando /mecabe
      case C.ME_CABE.name: return cmd.meCabe(member);
      // comando /comandos
      case C.COMANDOS.name: return cmd.comandos(C);
      // comando /lolprofile
      case C.LOLPROFILE.name: return cmd.lolProfile(getValue, env, context, token);
      // comando /lolmmr
      case C.LOLMMR.name: return cmd.lolMMR(getValue, env, context, token);
      // comando /lolgame
      case C.LOLGAME.name: return cmd.lolGame(getValue, env, context, token);
      // comando /lolmaestrias
      case C.LOLMASTERY.name: return cmd.lolMaestrias(getValue, env, context, token);
      // comando /video
      case C.VIDEO.name: return cmd.video(getValue, env, context, token);
      // comando /audio
      case C.AUDIO.name: return cmd.audio(getValue, env, context, token);
      // comando /sorteo
      case C.SORTEO.name: return cmd.sorteo(env, context, request_data);
      // comando /participar (en sorteo)
      case C.PARTICIPAR.name: return cmd.participar(env, context, request_data);
      default: return error("Unknown Type", 400);
      }
    });
  }
};