# ---- deps ----
FROM node:20-bookworm-slim AS deps
WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm cache clean --force && \
    rm -f package-lock.json && \
    npm install --legacy-peer-deps

# ---- builder ----
FROM node:20-bookworm-slim AS builder
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- runner ----
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN useradd -m nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/standalone/node_modules ./node_modules
COPY --from=builder /app/.next/standalone/package.json ./

USER nextjs
EXPOSE 3000
CMD ["node", ".next/standalone/server.js"]
