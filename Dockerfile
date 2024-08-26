# 기본 이미지
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./

# 개발 환경
FROM base AS development
RUN npm install
COPY . .

# 빌드 단계
FROM base AS builder
RUN npm ci
COPY . .
RUN npm run build

# 프로덕션 환경
FROM base AS production
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/main"]

# 최종 단계
FROM ${NODE_ENV:-production} AS final