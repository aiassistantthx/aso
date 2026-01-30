# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
ENV NODE_ENV=development
COPY package.json package-lock.json ./
COPY server/package.json ./server/
RUN npm ci
COPY tsconfig.json tsconfig.node.json vite.config.ts index.html ./
COPY src/ ./src/
COPY public/ ./public/
RUN NODE_ENV=production npm run build

# Stage 2: Build server
FROM node:20-alpine AS server-builder
WORKDIR /app
ENV NODE_ENV=development
COPY package.json package-lock.json ./
COPY server/package.json ./server/
RUN npm ci
COPY server/ ./server/
RUN cd server && npx prisma generate
RUN cd server && npx tsup src/index.ts --format esm --dts

# Stage 3: Production
FROM node:20-alpine AS production
WORKDIR /app

COPY package.json package-lock.json ./
COPY server/package.json ./server/
RUN npm ci --omit=dev

COPY server/prisma/ ./server/prisma/
RUN cd server && npx prisma generate

# Copy built assets
COPY --from=frontend-builder /app/dist ./dist
COPY --from=server-builder /app/server/dist ./server/dist

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

CMD ["node", "server/dist/index.js"]
