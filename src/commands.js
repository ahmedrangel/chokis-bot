import { CommandType } from "./lib/discord.js";
import { LOL_SERVERS } from "./constants.js";
export const ME_MIDE = {
  cid: "1151073208997531673",
  name: "memide",
  description: "Conocer cuántos centímetros te mide.",
  options: []
};

export const ME_CABE = {
  cid: "1151073208997531672",
  name: "mecabe",
  description: "Conocer cuántos centímetros te caben.",
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
  options: [
    {
      "name": "riot_id",
      "description": "Riot ID. Ej: (Name#TAG).",
      "type": CommandType.STRING,
      "required": true
    },
    {
      "name": "servidor",
      "description": "El servidor donde juega.",
      "type": CommandType.STRING,
      "required": true,
      "choices": LOL_SERVERS
    }
  ]
};

export const VIDEO = {
  cid: "1151073208997531674",
  name: "video",
  description: "Obtener un video de Instagram, Facebook, TikTok, Twitter, YouTube o Clip de Twitch en formato MP4.",
  options: [
    {
      "name": "link",
      "description": "Link de Instagram, Facebook, TikTok, Twitter, YouTube o Twitch.",
      "type": CommandType.STRING,
      "required": true
    }
  ]
};

export const AUDIO = {
  cid: "1151073208997531668",
  name: "audio",
  description: "Obtener un audio de YouTube en formato MP3.",
  options: [
    {
      "name": "link",
      "description": "Link de YouTube.",
      "type": CommandType.STRING,
      "required": true
    }
  ]
};

export const LOLMMR = {
  cid: "1152746647172948038",
  name: "lolmmr",
  description: "Calcula el ELO MMR aproximado de una cuenta basado en el emparejamiento de las partidas.",
  options: [
    {
      "name": "riot_id",
      "description": "Riot ID. Ej: (Name#TAG).",
      "type": CommandType.STRING,
      "required": true
    },
    {
      "name": "servidor",
      "description": "El servidor del invocador",
      "type": CommandType.STRING,
      "required": true,
      "choices": LOL_SERVERS
    },
    {
      "name": "cola",
      "description": "Tipo de cola clasificatoria",
      "type": CommandType.STRING,
      "required": true,
      "choices": [
        {
          "name": "Solo/Duo",
          "value": "SoloQ"
        },
        {
          "name": "Flexible",
          "value": "Flex"
        }
      ]
    }
  ]
};

export const LOLGAME = {
  cid: "1155113801109225542",
  name: "lolgame",
  description: "Obtener información de una partida activa de League of Legends.",
  options: [
    {
      "name": "invocador",
      "description": "El nombre de invocador.",
      "type": CommandType.STRING,
      "required": true
    },
    {
      "name": "servidor",
      "description": "El servidor del invocador",
      "type": CommandType.STRING,
      "required": true,
      "choices": LOL_SERVERS
    },
  ]
};

export const LOLMASTERY = {
  cid: "1158149667759079444",
  name: "lolmaestrias",
  description: "Obtener las maestrías de campeones de un invocador.",
  options: [
    {
      "name": "riot_id",
      "description": "Riot ID. Ej: (Name#TAG).",
      "type": CommandType.STRING,
      "required": true
    },
    {
      "name": "servidor",
      "description": "El servidor del invocador",
      "type": CommandType.STRING,
      "required": true,
      "choices": LOL_SERVERS
    }
  ]
};

export const SORTEO = {
  cid: "",
  name: "sorteo",
  description: "Administrar sorteos.",
  options: [
    {
      "name": "nuevo",
      "description": "Abre un nuevo sorteo.",
      "type": CommandType.SUB_COMMAND,
    },
    {
      "name": "cerrar",
      "description": "Cierra las entradas al sorteo.",
      "type": CommandType.SUB_COMMAND,
    },
    {
      "name": "sacar",
      "description": "Saca un ganador aleatorio del sorteo.",
      "type": CommandType.SUB_COMMAND,
    },
  ]
};

export const PARTICIPAR = {
  cid: "1182847179249963010",
  name: "participar",
  description: "Entras a participar a un sorteo activo.",
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