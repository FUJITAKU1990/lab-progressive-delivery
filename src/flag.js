"use strict";

const { OpenFeature } = require("@openfeature/server-sdk");
const {
  UnleashProvider,
} = require("@unleash/openfeature-node-provider");

const client = OpenFeature.getClient();

function getUnleashConfig() {
  const { UNLEASH_URL: url, UNLEASH_SDK_TOKEN: token } = process.env;

  if (!url || !token) {
    throw new Error("UNLEASH_URL and UNLEASH_SDK_TOKEN must be set");
  }

  return {
    url,
    appName: "lab06-canary",
    customHeaders: { Authorization: token },
    refreshInterval: 1,
  };
}

async function initializeFlags() {
  const config = getUnleashConfig();

  const provider = new UnleashProvider(config);
  await OpenFeature.setProviderAndWait(provider);
}

async function getNewFlow() {
  return client.getBooleanValue("lab06-new-flow", false);
}

async function shutdownFlags() {
  await OpenFeature.close();
}

module.exports = { getNewFlow, initializeFlags, shutdownFlags };
