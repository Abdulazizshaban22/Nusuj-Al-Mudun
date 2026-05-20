
# NASIJ v3 — Full UI Suite

- Next.js App Router + Tailwind + Leaflet + Recharts + Framer Motion.
- Keycloak/NextAuth integration.
- ETL base via `NEXT_PUBLIC_ETL_BASE` (default http://localhost:9101).

## Run
```bash
npm i
npm run dev
# open http://localhost:3000
```

## Screens
- `/dashboard` — Map + 100-metric picker + Gi* + H3 + AI Insight panel
- `/insights` — AI-generated narrative reports (AR/EN)
- `/iot/live` — H3 live aggregation (polls every 8s)
- `/studio/sim` — What-if simulations
- `/admin` — RBAC user management (Keycloak login required)
