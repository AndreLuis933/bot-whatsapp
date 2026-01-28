FROM oven/bun:1 AS builder
WORKDIR /app

COPY package.json bun.lockb* tsconfig.json ./
RUN bun install --frozen-lockfile

COPY src ./src
RUN bun build src/index.ts --outdir=dist --target=bun

FROM oven/bun:1-slim AS production
WORKDIR /app

RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libgbm1 \
    libgtk-3-0 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

RUN mkdir -p /app/.wwebjs_auth

CMD ["bun", "run", "dist/index.js"]