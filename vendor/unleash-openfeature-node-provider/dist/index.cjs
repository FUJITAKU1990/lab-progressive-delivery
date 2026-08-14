"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  UnleashProvider: () => UnleashProvider,
  resolveVariantValue: () => resolveVariantValue,
  translateContext: () => translateContext
});
module.exports = __toCommonJS(index_exports);

// src/context-translator.ts
var STRING_FIELDS = ["userId", "sessionId", "remoteAddress", "environment", "appName"];
function translateContext(evaluationContext, logger) {
  const { targetingKey, ...rest } = evaluationContext;
  const context = {};
  const properties = {};
  for (const [key, value] of Object.entries(rest)) {
    if (value === void 0 || value === null) {
      continue;
    }
    if (STRING_FIELDS.includes(key)) {
      const stringValue = toStringValue(value);
      if (stringValue === void 0) {
        logger?.debug(`UnleashProvider: dropping context field '${key}': cannot convert to string`);
      } else {
        context[key] = stringValue;
      }
      continue;
    }
    if (key === "currentTime") {
      const date = toDate(value);
      if (date === void 0) {
        logger?.debug(`UnleashProvider: dropping context field 'currentTime': not a valid date`);
      } else {
        context.currentTime = date;
      }
      continue;
    }
    const property = toProperty(value);
    if (property === void 0) {
      logger?.debug(
        `UnleashProvider: dropping context property '${key}': nested structures cannot be used in Unleash constraints`
      );
    } else {
      properties[key] = property;
    }
  }
  if (targetingKey !== void 0) {
    context.userId = targetingKey;
  }
  if (Object.keys(properties).length > 0) {
    context.properties = properties;
  }
  return context;
}
function toStringValue(value) {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value instanceof Date) return value.toISOString();
  return void 0;
}
function toDate(value) {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? void 0 : date;
  }
  return void 0;
}
function toProperty(value) {
  if (typeof value === "string" || typeof value === "number") return value;
  if (typeof value === "boolean") return String(value);
  if (value instanceof Date) return value.toISOString();
  return void 0;
}

// src/unleash-provider.ts
var import_server_sdk2 = require("@openfeature/server-sdk");
var import_unleash_client2 = require("unleash-client");

// package.json
var version = "1.0.0";

// src/variant-resolver.ts
var import_server_sdk = require("@openfeature/server-sdk");
var import_unleash_client = require("unleash-client");
function resolveVariantValue(variant, expectedType, defaultValue) {
  const flagMetadata = {};
  if (variant.feature_enabled !== void 0) {
    flagMetadata.featureEnabled = variant.feature_enabled;
  }
  if (variant.feature_enabled === false) {
    return { value: defaultValue, reason: import_server_sdk.StandardResolutionReasons.DISABLED, flagMetadata };
  }
  if (!variant.enabled || variant.payload === void 0) {
    return { value: defaultValue, reason: import_server_sdk.StandardResolutionReasons.DEFAULT, flagMetadata };
  }
  const { payload } = variant;
  flagMetadata.payloadType = payload.type;
  return {
    value: parsePayload(variant.name, payload.type, payload.value, expectedType),
    variant: variant.name,
    reason: import_server_sdk.StandardResolutionReasons.SPLIT,
    flagMetadata
  };
}
function parsePayload(variantName, payloadType, payloadValue, expectedType) {
  switch (expectedType) {
    case "string":
      if (payloadType !== import_unleash_client.PayloadType.STRING && payloadType !== import_unleash_client.PayloadType.CSV) {
        throw mismatch(variantName, payloadType, expectedType);
      }
      return payloadValue;
    case "number": {
      if (payloadType !== import_unleash_client.PayloadType.NUMBER) {
        throw mismatch(variantName, payloadType, expectedType);
      }
      const parsed = Number(payloadValue);
      if (Number.isNaN(parsed)) {
        throw new import_server_sdk.TypeMismatchError(
          `Payload of variant '${variantName}' has type 'number' but value '${payloadValue}' is not a number`
        );
      }
      return parsed;
    }
    case "object":
      if (payloadType !== import_unleash_client.PayloadType.JSON) {
        throw mismatch(variantName, payloadType, expectedType);
      }
      try {
        return JSON.parse(payloadValue);
      } catch (error) {
        throw new import_server_sdk.ParseError(
          `Payload of variant '${variantName}' is not valid JSON: ${error instanceof Error ? error.message : String(error)}`
        );
      }
  }
}
function mismatch(variantName, payloadType, expectedType) {
  return new import_server_sdk.TypeMismatchError(
    `Payload of variant '${variantName}' has type '${payloadType}', which cannot be resolved as '${expectedType}'`
  );
}

// src/unleash-provider.ts
var SDK_FLAVOR = "unleash-openfeature-node-provider";
var UnleashProvider = class {
  metadata = { name: SDK_FLAVOR };
  runsOn = "server";
  events = new import_server_sdk2.OpenFeatureEventEmitter();
  config;
  client;
  hasData = false;
  degraded = false;
  constructor(config) {
    this.config = {
      sdkFlavor: SDK_FLAVOR,
      sdkFlavorVersion: version,
      ...config
    };
  }
  async initialize() {
    this.client = this.createUnleashClient();
    this.setupListeners(this.client);
    await this.client.start();
  }
  setupListeners(client) {
    client.on(import_unleash_client2.UnleashEvents.Error, (error) => this.onUnleashError(error));
    client.on(import_unleash_client2.UnleashEvents.Synchronized, () => this.onUnleashSuccess());
    client.on(import_unleash_client2.UnleashEvents.Unchanged, () => this.onUnleashSuccess());
    client.on(import_unleash_client2.UnleashEvents.Changed, () => {
      this.onUnleashSuccess();
      this.events.emit(import_server_sdk2.ProviderEvents.ConfigurationChanged, {
        message: "Flag configuration changed"
      });
    });
  }
  async onClose() {
    const client = this.client;
    if (!client) {
      return;
    }
    this.client = void 0;
    await client.destroyWithFlush();
  }
  async resolveBooleanEvaluation(flagKey, defaultValue, context, logger) {
    const client = this.requireClient();
    const enabled = client.isEnabled(
      flagKey,
      translateContext(context, logger),
      () => defaultValue
    );
    return {
      value: enabled,
      reason: import_server_sdk2.StandardResolutionReasons.UNKNOWN
    };
  }
  async resolveStringEvaluation(flagKey, defaultValue, context, logger) {
    return this.evaluateVariant(flagKey, "string", defaultValue, context, logger);
  }
  async resolveNumberEvaluation(flagKey, defaultValue, context, logger) {
    return this.evaluateVariant(flagKey, "number", defaultValue, context, logger);
  }
  async resolveObjectEvaluation(flagKey, defaultValue, context, logger) {
    return this.evaluateVariant(flagKey, "object", defaultValue, context, logger);
  }
  evaluateVariant(flagKey, expectedType, defaultValue, context, logger) {
    const client = this.requireClient();
    const variant = client.getVariant(flagKey, translateContext(context, logger));
    return resolveVariantValue(variant, expectedType, defaultValue);
  }
  requireClient() {
    if (!this.client) {
      throw new import_server_sdk2.GeneralError("Unleash provider is not initialized");
    }
    if (!this.client.isSynchronized()) {
      throw new import_server_sdk2.ProviderNotReadyError("Unleash provider has not yet synchronized flag data");
    }
    return this.client;
  }
  /** Overridable seam for testing — returns a fully configured Unleash client. */
  createUnleashClient() {
    return new import_unleash_client2.Unleash({ ...this.config, disableAutoStart: true });
  }
  onUnleashError(error) {
    const err = toError(error);
    this.degraded = true;
    const message = err.message;
    if (this.hasData) {
      this.events.emit(import_server_sdk2.ProviderEvents.Stale, { message });
    } else {
      this.events.emit(import_server_sdk2.ProviderEvents.Error, { message });
    }
  }
  onUnleashSuccess() {
    const hadData = this.hasData;
    this.hasData = true;
    if (this.degraded || !hadData) {
      this.degraded = false;
      this.events.emit(import_server_sdk2.ProviderEvents.Ready, {
        message: `Unleash client ${hadData ? "recovered" : "ready"}`
      });
    }
  }
};
function toError(error) {
  return error instanceof Error ? error : new import_server_sdk2.GeneralError(String(error));
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  UnleashProvider,
  resolveVariantValue,
  translateContext
});
