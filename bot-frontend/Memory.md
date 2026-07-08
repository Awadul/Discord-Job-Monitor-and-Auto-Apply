# Frontend Memory

## Active Architectural Decisions
- Tailwind CSS v4.0 is integrated using `@tailwindcss/vite` (native build plugin). Configuration is done in CSS via `@import "tailwindcss";`.
- Project utilizes `lucide-react` for premium SVG icons.
- Simple, stateful custom routing implemented directly in React to navigate between login screen and bot controls without extra router library dependencies.
- Traffic is routed directly to the Express backend at `http://localhost:5000` (defined in `VITE_BACKEND_URL` env variable) now that CORS is properly enabled on the backend.
- Authentication tokens are managed exclusively via HTTP-only cookies (`token`), securing the frontend from XSS token theft. Removed all `localStorage` token storage and manual `Authorization` headers.
- CORS requests include `credentials: 'include'` to allow HTTP-only cookies to be passed.
- Backend cookie security is configured conditionally (`secure: process.env.NODE_ENV === 'production'`), enabling local HTTP-only session cookie exchanges in development.

## Current Feature State
- [x] Fresh frontend setup: `Complete` (Boilerplate removed, login page and dashboard UI styled with Tailwind CSS, builds successfully)
- [x] Backend API Integration: `Complete` (Integrated login, status check, run script, pause, and resume API endpoints directly calling the backend port 5000)
- [x] Secure Cookie Auth: `Complete` (Shifted session token verification to secure cookies, eliminating XSS risks of localStorage token exposure)

## Breaking Changes / Critical Dependency Notes
- Vite configuration updated with `tailwindcss` plugin. Removed unused dev proxy configuration.
- Standard React/Vite boilerplate assets and `App.css` were deleted. Styling is centralized in `src/index.css`.
- Installed `tailwindcss` v4, `@tailwindcss/vite` v4, and `lucide-react`.

## Recent Schema Migrations / Query Changes
*None yet.*
