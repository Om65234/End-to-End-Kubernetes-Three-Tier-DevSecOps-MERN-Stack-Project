FROM node:18-alpine
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 5000
CMD ["node", "index.js"]