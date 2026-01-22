# ---- deps ----
FROM node:20-alpine AS deps
WORKDIR /app

# สำหรับบางแพ็กเกจที่ต้องใช้ glibc compatibility บน alpine
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* ./
RUN npm ci

# ---- builder ----
FROM node:20-alpine AS builder
WORKDIR /app

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js
RUN npm run build

# ---- runner ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# สร้าง user non-root
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

# คัดลอกเฉพาะสิ่งที่จำเป็น (standalone)
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/standalone ./

USER nextjs

EXPOSE 3000
CMD ["node", "server.js"]
