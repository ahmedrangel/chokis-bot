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
  description: "Consultar información de un invocador de League of Legends",
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
    }
  ]
};

export const VIDEO = {
  cid: "1151073208997531674",
  name: "video",
  description: "Obtener un video de Instagram, Facebook, TikTok, Twitter o YouTube en formato MP4.",
  options: [
    {
      "name": "link",
      "description": "Link de Instagram, Facebook, TikTok, Twitter o YouTube.",
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
    {
      "name": "cola",
      "description": "Tipo de cola clasificatoria",
      "type": CommandType.STRING,
      "required": true,
      "choices": [
        {
          "name": "Solo/Duo",
          "value": "soloq"
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
  ]
};*/
