/**
 * General functions
 */
import { CONSTANTS } from "./constants.js";
import { API } from "./lib/discord.js";
const { COLOR } = CONSTANTS;

export const getFrom = (name, options) => {
  const option = options.find((option) => option.name === name);
  return option?.value ?? null;
};

export const getRandom = (options) => {
  const min = options.min ?? 1;
  return Math.round((Math.random() * (options.max - min)) + min);
};

export const esUrl = (cadena) => {
  const regex = /^(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,})(?:\/\S*)?$/;
  return regex.test(cadena);
};

// Solo toma encuenta si el ID se encuentra en el slash final y no en un query
export const obtenerIDDesdeURL = (url) => {
  const expresionRegular = /\/([a-zA-Z0-9_-]+)(?:\.[a-zA-Z0-9]+)?(?:\?|$|\/\?|\/$)/;
  const resultado = expresionRegular.exec(url);
  if (resultado && resultado.length > 1) {
    return resultado[1];
  }
  else {
    return null;
  }
};

export const validarFecha = (dia, mes) => {
  const año = 2020;
  const fecha = new Date(año, mes - 1, dia);
  return fecha.getDate() === dia && fecha.getMonth() === mes - 1 && fecha.getFullYear() === año; // true o false
};

export const diasFaltantes = (año, mes, dia) => {
  const fechaActual = new Date(new Date() -300 * 60000); // GMT -5
  const fechaObjetivo = new Date(año, mes - 1, dia);
  const diferenciaMilisegundos = fechaObjetivo - fechaActual;
  return Math.ceil(diferenciaMilisegundos / (1000 * 60 * 60 * 24));
};

export const fetchUsers = async (id, token) => {
  const response = await fetch(`${API.BASE}/users/${id}`, {
    headers: {
      "Authorization": `Bot ${token}`
    }
  });
  const data = await response.json();
  return data;
};

export const errorEmbed = (error_msg) => {
  const embeds = [];
  embeds.push({
    color: COLOR,
    description: error_msg,
  });
  return embeds;
};

export const getDurationFromTimestampMMSS = (timestamp) => {
  if (timestamp > 0) {
    const now = Date.now();
    const difference = Math.floor((now - timestamp) / 1000); // in seconds
    const minutes = Math.floor(difference / 60);
    const seconds = difference % 60;
    const format = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    return format;
  }
  return "00:00";
};

export const imbedUrlsFromString = (str) => {
  const regex = /(https?:\/\/[^\s]+)/g;
  return str.replace(regex, "<$1>");
};

export const getExtensionFromResponse = (response) => {
  const extensionMap = {
    "image/gif": "gif",
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp"
  };
  const contentType = response.headers.get("content-type");
  const extension = extensionMap[contentType];
  return extension;
};

export const getUpdatedAvatarUrl = async (userId, avatar, token) => {
  const response = await fetch(`https://cdn.discordapp.com/avatars/${userId}/${avatar}?size=16`);
  if (!response.ok) {
    const user = await fetchUsers(userId, token);
    const response = await fetch(`https://cdn.discordapp.com/avatars/${userId}/${user.avatar}?size=16`);
    const extension = getExtensionFromResponse(response);
    const avatarUrl = `https://cdn.discordapp.com/avatars/${userId}/${user.avatar}.${extension}?size=2048`;
    return avatarUrl;
  }
  const extension = getExtensionFromResponse(response);
  const avatarUrl = `https://cdn.discordapp.com/avatars/${userId}/${avatar}.${extension}?size=2048`;
  return avatarUrl;
};

export const getGuild = async (id, token) => {
  const response = await fetch(`${API.BASE}/guilds/${id}`, {
    headers: {
      "Authorization": `Bot ${token}`
    }
  });
  const data = await response.json();
  return data;
};