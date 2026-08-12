# Phase 1: Foundation & Auth

**Status:** ✅ Done (backend) / ⚠️ 90% (frontend — falta UI de perfil)
**Plans:** 4/4 effectively completed
**Requirements:** AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, UIX-02
**User Stories:** HU-01, HU-02, HU-03, HU-04, HU-05

## Goal
Developer puede ejecutar frontend y backend localmente, autenticación funciona end-to-end, layout responsive base se renderiza.

## Reality (verified 2026-08-11)
- [x] React scaffold (Vite + Tailwind + TypeScript), layout shell, design tokens
- [x] Django scaffold (DRF + SimpleJWT), modelos, migraciones
- [x] Auth endpoints: register, login (rate-limited), refresh, password reset. Frontend auth pages.
- [x] JWT blacklist + rotación activos
- [ ] Perfil de usuario (editar nombre, avatar, bio) — movido a Phase 8 (08-03)

## Notes
- AUTH-01 email verification NO implementado (descopeado a v2)
- Avatar es solo URLField, sin upload (descopeado a v2)
