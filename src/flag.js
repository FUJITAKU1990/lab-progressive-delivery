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

  // TODO: Construct the supplied Unleash provider with config and register it
  // with OpenFeature, waiting until its initial flag data is ready.
  void config;
}

async function getNewFlow() {
  // TODO: Evaluate lab06-new-flow through the OpenFeature client with the safe
  // boolean default required by the lab.
  return false;
}

async function shutdownFlags() {
  await OpenFeature.close();
}

module.exports = { getNewFlow, initializeFlags, shutdownFlags };
