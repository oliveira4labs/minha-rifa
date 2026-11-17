# Imagem única: backend (NestJS) servindo o front (React) já compilado.
# Banco: Postgres externo, via DATABASE_URL. Fotos: volume em /data.

# ---------------------------------------------------------------- build
FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/
COPY apps/frontend/package.json apps/frontend/
RUN npm ci

COPY apps ./apps
RUN npm run build

# ---------------------------------------------------------------- runtime
FROM node:24-alpine AS runtime
ENV NODE_ENV=production \
    PORT=3000 \
    DATA_DIR=/data
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/
COPY apps/frontend/package.json apps/frontend/
RUN npm ci --omit=dev --workspace=@minha-rifa/backend && npm cache clean --force

COPY --from=build /app/apps/backend/dist apps/backend/dist
COPY --from=build /app/apps/frontend/dist apps/frontend/dist

RUN mkdir -p /data && chown node:node /data
USER node

EXPOSE 3000
CMD ["node", "apps/backend/dist/main.js"]
