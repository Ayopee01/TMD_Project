# ---- deps ----
FROM node:20-bookworm-slim AS deps
WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install --legacy-peer-deps || ( \
  echo "----- npm install failed. Showing logs -----" && \
  ls -la /root/.npm/_logs || true && \
  tail -n 200 /root/.npm/_logs/*-debug-0.log || true && \
  exit 1 )

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
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN useradd -m nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/standalone ./

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
