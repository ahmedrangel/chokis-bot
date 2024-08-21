/**
 * Discord interactions manager
 */
import { API } from "./lib/discord.js";
import { getFrom } from "./functions.js";
import { InteractionResponseType, InteractionType } from "discord-interactions";
import { $fetch } from "ofetch";

const toDiscordEndpoint = async (endpoint, body, method, authorization) => {
  const endpoint_url = `${API.BASE}${endpoint}`;
  if (!body?.files) {
    return $fetch(endpoint_url, {
      method,
      body,
      headers: authorization ? { Authorization: authorization } : {},
      retry: 3,
      retryDelay: 500
    }).catch(() => null);
  }

  const formData = new FormData();
  const { files } = body;
  for (let i = 0; i < files.length; i++) {
    formData.append(`files[${i}]`, files[i].file, files[i].name);
  }
  delete body.files;
  formData.append("payload_json", JSON.stringify(body));
  return $fetch(endpoint_url, {
    method,
    body: formData,
    headers: authorization ? { Authorization: authorization } : {},
    retry: 3,
    retryDelay: 500
  }).catch(() => null);
};

const pong = () => {
  return { type: InteractionResponseType.PONG };
};

export const create = (type, options, func) => {
  switch (type) {
    case InteractionType.PING:
      return pong();
    case InteractionType.APPLICATION_COMMAND:
      return func({
        getValue: (name) => getFrom(name, options)
      });
  }
};

export const reply = (content, options) => {
  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: content,
      embeds: options?.embeds,
      flags: options?.flags
    }
  };
};

export const deferReply = (options) => {
  return {
    type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      flags: options?.flags
    }
  };
};

export const deferUpdate = async (content, options) => {
  const { token, application_id } = options;
  const followup_endpoint = `/webhooks/${application_id}/${token}`;
  return await toDiscordEndpoint(followup_endpoint, {
    type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE,
    content: content,
    embeds: options?.embeds,
    components: options?.components,
    files: options?.files
  }, "POST");
};

export const getOriginalMessage = async (options) => {
  const { token, application_id } = options;
  const endpoint = `${API.BASE}/webhooks/${application_id}/${token}/messages/@original`;
  return await $fetch(endpoint).catch(() => null);
};

export const editMessage = async (content, options) => {
  const { token, channel_id, message_id } = options;
  const endpoint = `/channels/${channel_id}/messages/${message_id}`;
  return await toDiscordEndpoint(endpoint, {
    content: content,
    embeds: options?.embeds,
    components: options?.components,
    files: options?.files,
    flags: options?.flags
  }, "PATCH", "Bot " + token);
};

export const editFollowUpMessage = async (content, options) => {
  const { token, application_id, message_id } = options;
  const endpoint = `/webhooks/${application_id}/${token}/messages/${message_id}`;
  return await toDiscordEndpoint(endpoint, {
    content: content,
    embeds: options?.embeds,
    components: options?.components,
    files: options?.files,
    flags: options?.flags
  }, "PATCH");
};

export const error = (message, code) => {
  return { error: message }, { status: code };
};

export const sendToChannel = async (content, options) => {
  const { channelId, token } = options;
  const endpoint = (`/channels/${channelId}/messages`);
  return await toDiscordEndpoint(endpoint, {
    content: content,
    embeds: options?.embeds,
    components: options?.components,
    files: options?.files
  }, "POST", "Bot " + token);
};