FROM node:22-alpine

WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
RUN npm ci

COPY apps/api apps/api
COPY drizzle drizzle

WORKDIR /app/apps/api
ENV NODE_ENV=production
EXPOSE 5001
CMD ["sh", "-c", "npm run migrate && npm start"]