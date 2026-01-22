FROM node:20-alpine AS builder

# --- เพิ่มบรรทัดนี้ ---
# ติดตั้ง libc6-compat เพื่อให้ Next.js/SWC ทำงานบน Alpine ได้
RUN apk add --no-cache libc6-compat
# --------------------

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

COPY . .

# สร้าง Build
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]