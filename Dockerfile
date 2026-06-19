FROM node:22.16.0-alpine3.22 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL=/api
ARG VITE_USE_MOCKS=false
ENV VITE_API_URL=$VITE_API_URL VITE_USE_MOCKS=$VITE_USE_MOCKS
RUN test "$VITE_USE_MOCKS" = "false" && npm run build

FROM caddy:2.10.2-alpine AS runtime
COPY --chown=caddy:caddy Caddyfile /etc/caddy/Caddyfile
COPY --from=build --chown=caddy:caddy /app/dist /srv
USER caddy
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
