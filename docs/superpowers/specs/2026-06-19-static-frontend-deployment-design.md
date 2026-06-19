# Despliegue estático del frontend

## Objetivo

Publicar el estado actual de `cci-protestos-frontend` en GitHub y Vercel para que pueda recorrerse públicamente sin depender del backend.

## Arquitectura

- Vite compila la aplicación React como archivos estáticos en `dist`.
- La capa de servicios usa `mockService` cuando `VITE_USE_MOCKS` no está definida o cuando vale `true`.
- El servicio HTTP real solo se activa explícitamente con `VITE_USE_MOCKS=false`.
- Vercel reescribe las rutas del navegador hacia `index.html` para que React Router resuelva las vistas internas.

## Publicación

1. Validar pruebas, lint y build de producción con mocks.
2. Excluir archivos locales y secretos del commit.
3. Publicar la rama actual en el remoto GitHub existente.
4. Crear un despliegue de producción en Vercel desde el repositorio local vinculado.
5. Verificar la URL pública y una ruta interna.

## Criterios de aceptación

- El build termina correctamente sin un backend disponible.
- La aplicación publicada carga con datos estáticos.
- Las rutas internas pueden abrirse directamente sin devolver 404.
- El código queda disponible en `saidvox/cci-protestos-frontend`.
- La URL de producción de Vercel responde públicamente.

## Fuera de alcance

- Reparar o desplegar el backend.
- Persistencia real, autenticación real o conexión a una base de datos.
- Sustituir los datos mock actuales.
