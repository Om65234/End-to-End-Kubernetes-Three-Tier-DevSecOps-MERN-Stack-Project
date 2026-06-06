# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
ENV NODE_OPTIONS=--openssl-legacy-provider
# Accept backend URL at build time: docker build --build-arg REACT_APP_BACKEND_URL=http://your-backend/api/tasks
ARG REACT_APP_BACKEND_URL=/api/tasks
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
RUN npm run build


# ── Stage 2: Serve ──────────────────────────────────────────────────────────
FROM nginx:alpine

# Copy the production build output into nginx's serve directory
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

