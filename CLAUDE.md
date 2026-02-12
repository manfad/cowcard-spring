# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CowCard is a cattle management system (cows, breeding/AI records, pregnancy diagnosis, calves, feedlots, transponders). Monorepo with a Spring Boot API server and a React client.

## Commands

### Server (from `server/`)
```bash
mvn spring-boot:run              # Run dev server on :8080
mvn clean package                # Build JAR
mvn test                         # Run tests
```

### Client (from `client/`)
```bash
npm run dev                      # Run dev server on :3000
npm run build                    # Production build
npm run lint                     # ESLint
```

## Architecture

### Server (Spring Boot 4.0.2 / Java 21)
- **Auth**: JWT in HTTP-only cookies. `JwtFilter` validates tokens on each request; `JwtService` generates/parses tokens. `UserDetail` implements `UserDetails` — `isEnabled()` checks both `active` and `approved` fields.
- **Response wrapper**: All endpoints return `ServerRes<T>` with `{data, message, success}`. When returning an error from a method with a typed return (e.g. `ServerRes<WhoAmI>`), use explicit type witness: `ServerRes.<WhoAmI>error("msg")`.
- **Entities**: Most extend `BaseEntity` (createdAt, updatedAt, createdBy, updatedBy). `User` does not extend BaseEntity.
- **Packages**: Each domain entity has its own package with Controller/Service/Repository. Lookup tables (AiStatus, CalfStatus, Color, CowGender, CowRole, CowStatus, PdStatus) follow the same pattern.
- **Database**: PostgreSQL (Neon) with `ddl-auto: update`. Schema in `schema.sql`.
- **Config**: Environment variables via spring-dotenv (`server/.env`): `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`.

### Client (React 19 + TypeScript + Vite)
- **Routing**: TanStack Router with file-based route generation. `_auth.tsx` is the protected layout that redirects unauthenticated users to `/login`. Route files live in `src/routes/_auth/[entity]/index.tsx`.
- **Auth**: `AuthProvider` context in `lib/auth.tsx` wraps the app. Exposes `useAuth()` hook with `login`, `logout`, `register`, `user`, `isAuthenticated`. After login, calls `/auth/whoami` to populate user state.
- **API**: Axios client in `lib/api.ts` with `baseURL: http://localhost:8080` and `withCredentials: true` for cookie-based auth. Each entity has a typed API object (e.g. `cowApi.getAll()`).
- **State**: TanStack Query for server state. QueryClient in `lib/query.ts` (1min stale time, no refetch on window focus).
- **UI**: shadcn/ui components (Radix primitives + Tailwind CSS 4). Forms use react-hook-form + zod v4.
- **Path alias**: `@/` maps to `./src/`.

## Key Patterns

- JWT subject is always the user's **email** (not phone), matching `UserDetail.getUsername()` for consistent token validation in `JwtFilter`.
- New users register with `approved=false` and require admin approval before they can log in (`isEnabled()` blocks them at the Spring Security layer).
- API endpoints follow `/{entity}/all` convention for listing.
