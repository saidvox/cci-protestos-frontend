# Static Frontend Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar el frontend React en GitHub y Vercel funcionando únicamente con los datos mock existentes.

**Architecture:** El selector de servicios usará mocks salvo que la API se habilite explícitamente. Vercel servirá el build de Vite y enviará cualquier ruta de la SPA a `index.html`.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Vercel CLI, GitHub.

---

### Task 1: Modo mock seguro por defecto

**Files:**
- Modify: `src/services/service-factory.ts`
- Test: `src/services/service-factory.test.ts`

- [ ] Restaurar el test que exige `mock` para una variable ausente y `api` solo para `false`.
- [ ] Ejecutar `npm test -- src/services/service-factory.test.ts` y comprobar que falla para `undefined`.
- [ ] Implementar `getServiceMode(value)` y derivar `appService` de ese resultado.
- [ ] Repetir el test y comprobar que pasa.

### Task 2: Configuración de Vercel y archivos locales

**Files:**
- Create: `vercel.json`
- Modify: `.gitignore`

- [ ] Añadir una rewrite de `/(.*)` hacia `/index.html`.
- [ ] Excluir `.env` y `.env.e2e`, conservando `.env.example`.
- [ ] Confirmar con `git status --short` que los archivos de entorno no se incluirán.

### Task 3: Verificación y publicación

**Files:**
- Stage: todos los cambios del frontend excepto archivos ignorados.

- [ ] Ejecutar `npm test`, `npm run lint` y `npm run build` con `VITE_USE_MOCKS=true`.
- [ ] Crear un commit con los cambios actuales del frontend.
- [ ] Publicar la rama en `origin` y asegurar que el código esté disponible en GitHub.
- [ ] Vincular el proyecto mediante Vercel CLI y ejecutar `vercel --prod --yes`.
- [ ] Verificar que la URL de producción y una ruta interna respondan correctamente.
