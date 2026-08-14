FROM node:22.18.0-bookworm-slim@sha256:752ea8a2f758c34002a0461bd9f1cee4f9a3c36d48494586f60ffce1fc708e0e

WORKDIR /app

COPY package.json package-lock.json ./
COPY vendor/unleash-openfeature-node-provider ./vendor/unleash-openfeature-node-provider
RUN npm ci --omit=dev

COPY src ./src

ENV NODE_ENV=development \
    PORT=3000

EXPOSE 3000

USER node

CMD ["npm", "start"]
