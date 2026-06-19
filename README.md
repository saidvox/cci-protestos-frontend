# CCI Protestos — Frontend

SPA administrativa en React 19, Vite, TypeScript, Tailwind CSS 4 y shadcn/ui.

## Desarrollo

Requisitos: Node.js 22.16+ y npm 10+.

```bash
copy .env.example .env
npm ci
npm run dev
```

`VITE_USE_MOCKS=true` activa datos ficticios de forma explícita. Si la variable se omite o tiene cualquier otro valor, la aplicación usa la API; producción siempre se construye con `false`. Para backend local use `VITE_API_URL=http://localhost:8080/api`; en contenedor use `/api`.

## Calidad

```bash
npm test
npm run test:coverage
npm run lint
npm run build
npm run e2e
```

La autenticación web usa una cookie JWT `HttpOnly` emitida por el backend. El frontend no persiste tokens ni sesiones en Web Storage. Axios envía cookies, obtiene CSRF antes de mutaciones y usa `XSRF-TOKEN`/`X-XSRF-TOKEN`.

## Contenedor

```bash
docker build --build-arg VITE_API_URL=/api --build-arg VITE_USE_MOCKS=false -t cci-protestos-frontend .
docker run --rm -p 8080:8080 cci-protestos-frontend
```

La imagen multi-stage compila con Node 22 y sirve `/srv` con Caddy como usuario no-root. Expone `/healthz`, fallback SPA, caché de assets y proxy `/api` hacia `backend:8080`. Se puede sustituir `/etc/caddy/Caddyfile` mediante un montaje de solo lectura.

## CI

GitHub Actions ejecuta pruebas con cobertura, lint, build productivo, auditoría npm, SBOM y publica una imagen GHCR etiquetada con el SHA. Trivy bloquea vulnerabilidades HIGH/CRITICAL conocidas.
