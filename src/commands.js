import { CommandType, Contexts, IntegrationTypes, PermissionFlags } from "./lib/discord.js";
import { LOL_QUEUES, LOL_SERVERS } from "./constants.js";
export const ME_MIDE = {
  cid: "1151073208997531673",
  name: "memide",
  description: "Conocer cuántos centímetros te mide.",
  integration_types: IntegrationTypes.ALL,
  contexts: Contexts.ALL,
  options: []
};

export const ME_CABE = {
  cid: "1151073208997531672",
  name: "mecabe",
  description: "Conocer cuántos centímetros te caben.",
  integration_types: IntegrationTypes.ALL,
  contexts: Contexts.ALL,
  options: []
};

export const COMANDOS = {
  cid: "1151073208997531669",
  name: "comandos",
  description: "Conocer la lista de comandos disponibles.",
  options: []
};

export const LOLPROFILE = {
  cid: "1151083208264388628",
  name: "lolperfil",
  description: "Consulta información de un usuario de League of Legends",
  integration_types: IntegrationTypes.ALL,
  contexts: Contexts.ALL,
  options: [
    {
      name: "riot_id",
      description: "Riot ID. Ej: (Name#TAG).",
      type: CommandType.STRING,
      required: true
    },
    {
      name: "servidor",
      description: "El servidor donde juega.",
      type: CommandType.STRING,
      required: true,
      choices: LOL_SERVERS
    },
    {
      name: "filtro",
      description: "Filtrar por una cola específica.",
      type: CommandType.STRING,
      required: false,
      choices: LOL_QUEUES
    }
  ]
};

export const VIDEO = {
  cid: "1151073208997531674",
  name: "video",
  description: "Obtener un video de Instagram, Facebook, TikTok, X, YouTube, Twitch o Kick en formato MP4.",
  integration_types: IntegrationTypes.ALL,
  contexts: Contexts.ALL,
  options: [
    {
      name: "link",
      description: "Link de Instagram, Facebook, TikTok, X, YouTube, Twitch o Kick.",
      type: CommandType.STRING,
      required: true
    }
  ]
};

export const AUDIO = {
  cid: "1151073208997531668",
  name: "audio",
  description: "Obtener un audio de YouTube en formato MP3.",
  integration_types: IntegrationTypes.ALL,
  contexts: Contexts.ALL,
  options: [
    {
      name: "link",
      description: "Link de YouTube.",
      type: CommandType.STRING,
      required: true
    }
  ]
};

export const LOLMMR = {
  cid: "1152746647172948038",
  name: "lolmmr",
  description: "Calcula el ELO MMR aproximado de una cuenta basado en el emparejamiento de las partidas.",
  integration_types: IntegrationTypes.ALL,
  contexts: Contexts.ALL,
  options: [
    {
      name: "riot_id",
      description: "Riot ID. Ej: (Name#TAG).",
      type: CommandType.STRING,
      required: true
    },
    {
      name: "servidor",
      description: "El servidor del invocador",
      type: CommandType.STRING,
      required: true,
      choices: LOL_SERVERS
    },
    {
      name: "cola",
      description: "Tipo de cola clasificatoria",
      type: CommandType.STRING,
      required: true,
      choices: [
        {
          name: "Solo/Duo",
          value: "SoloQ"
        },
        {
          name: "Flexible",
          value: "Flex"
        }
      ]
    }
  ]
};

export const LOLGAME = {
  cid: "1155113801109225542",
  name: "lolgame",
  description: "Obtener información de una partida activa de League of Legends.",
  integration_types: IntegrationTypes.ALL,
  contexts: Contexts.ALL,
  options: [
    {
      name: "riot_id",
      description: "Riot ID. Ej: (Name#TAG).",
      type: CommandType.STRING,
      required: true
    },
    {
      name: "servidor",
      description: "El servidor del invocador",
      type: CommandType.STRING,
      required: true,
      choices: LOL_SERVERS
    }
  ]
};

export const LOLMASTERY = {
  cid: "1158149667759079444",
  name: "lolmaestrias",
  description: "Obtener las maestrías de campeones de un invocador.",
  options: [
    {
      name: "riot_id",
      description: "Riot ID. Ej: (Name#TAG).",
      type: CommandType.STRING,
      required: true
    },
    {
      name: "servidor",
      description: "El servidor del invocador",
      type: CommandType.STRING,
      required: true,
      choices: LOL_SERVERS
    }
  ]
};

export const SORTEO = {
  cid: "1182846437424365700",
  name: "sorteo",
  description: "Administrar sorteos.",
  options: [
    {
      name: "nuevo",
      description: "Abre un nuevo sorteo.",
      type: CommandType.SUB_COMMAND
    },
    {
      name: "cerrar",
      description: "Cierra las entradas al sorteo.",
      type: CommandType.SUB_COMMAND
    },
    {
      name: "sacar",
      description: "Saca un ganador aleatorio del sorteo.",
      type: CommandType.SUB_COMMAND
    }
  ],
  default_member_permissions: PermissionFlags.ADMINISTRATOR
};

export const CHEER = {
  cid: "1212916341942648882",
  name: "cheer",
  description: "Has una prueba de tus mensajes antes de enviar bits en el canal de Chino.",
  integration_types: IntegrationTypes.ALL,
  contexts: Contexts.ALL,
  options: [
    {
      name: "mensaje",
      description: "El mensaje que quieres que lea el bot.",
      type: CommandType.STRING,
      required: true
    }
  ]
};

export const SUBS = {
  cid: "1234963826945032233",
  name: "subs",
  description: "Obtener la cantidad de suscriptores de ChinoLoleroo",
  integration_types: IntegrationTypes.ALL,
  contexts: Contexts.ALL,
  options: []
};

/*
export const TEST = {
  name: "test",
  description: "test",
  options: [
    {
      "name": "test",
      "description": "test",
      "type": CommandType.STRING,
      "required": true
    }
  ],
};
*/
