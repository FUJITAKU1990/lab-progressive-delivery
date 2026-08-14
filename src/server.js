"use strict";

const http = require("node:http");
const {
  getNewFlow,
  initializeFlags,
  shutdownFlags,
} = require("./flag");

const port = Number.parseInt(process.env.PORT || "3000", 10);
const version = process.env.APP_VERSION || "stable";

if (!["stable", "canary"].includes(version)) {
  throw new Error("APP_VERSION must be stable or canary");
}

async function start() {
  if (version === "canary") {
    await initializeFlags();
  }

  const server = http.createServer(async (request, response) => {
    if (request.method === "GET" && request.url === "/health") {
      response.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
      response.end(`${version} healthy\n`);
      return;
    }

    if (request.method === "GET" && request.url === "/checkout") {
      try {
        const newFlow = version === "canary" ? await getNewFlow() : false;
        response.writeHead(200, { "content-type": "application/json" });
        response.end(JSON.stringify({ version, new_flow: newFlow }));
      } catch (error) {
        process.stderr.write(`Flag evaluation failed: ${error.message}\n`);
        response.writeHead(500, { "content-type": "application/json" });
        response.end(JSON.stringify({ error: "flag evaluation failed" }));
      }
      return;
    }

    response.writeHead(404, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "not found" }));
  });

  server.listen(port, "0.0.0.0", () => {
    process.stdout.write(`Lab 6 ${version} app listening on port ${port}\n`);
  });

  async function shutdown(signal) {
    process.stdout.write(`Received ${signal}; shutting down\n`);
    server.close(async () => {
      await shutdownFlags();
      process.exit(0);
    });
  }

  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
}

start().catch(error => {
  process.stderr.write(`Could not start ${version}: ${error.message}\n`);
  process.exit(1);
});
