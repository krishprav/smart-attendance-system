FROM node:18-alpine

WORKDIR /app

COPY backend/package.json backend/package-lock.json* ./
RUN npm ci

COPY backend .
RUN npm run build

EXPOSE 5000

CMD ["node", "dist/index.js"]