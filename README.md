# Discord Requests MVP (Next.js + Prisma + Postgres + Tailwind)

MVP pentru managementul cererilor unui server Discord:
- Tipuri: STAFF / UNBAN / UNTIMEOUT
- Status: PENDING / APPROVED / DENIED / NEED_MORE_INFO
- Login Discord OAuth2 (NextAuth) — fără bot
- RBAC în aplicație: USER / REVIEWER / ADMIN
- Dashboard user, Inbox reviewer, Admin panel
- Notificări in-site (bell)
- Webhook Discord (Incoming Webhook URL) opțional

## 1) Rulare local

### Cerințe
- Node 18+ (recomandat 20+)
- PostgreSQL

### Setup
1. Copiază env:
```bash
cp .env.example .env
```

2. Completează `.env`:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET`

3. Instalează:
```bash
npm i
```

4. Prisma:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### IMPORTANT (constraint “max 1 active request / tip”)
Adaugă un migration SQL care creează indexul partial:

```sql
CREATE UNIQUE INDEX IF NOT EXISTS uniq_active_request_per_type
ON "Request" ("userId", "type")
WHERE "status" IN ('PENDING', 'NEED_MORE_INFO');
```

Apoi rulează migrarea.

5. Pornire:
```bash
npm run dev
```

## 2) Discord OAuth2 setup
În Discord Developer Portal:
- OAuth2 Redirect URL:
  - `http://localhost:3000/api/auth/callback/discord` (local)
  - la deploy: `https://<domain>/api/auth/callback/discord`

## 3) Role management
Rolurile sunt în DB (Admin -> Users).
Primul user care intră va fi USER. Ca să setezi ADMIN:
- fie modifici direct în DB (role=ADMIN),
- fie adaugi un script manual.

## 4) Deploy (ex: Vercel)
- Setezi env vars în Vercel
- Conectezi o bază Postgres (Neon/Supabase/Render/etc.)
- Rulezi Prisma migrate în pipeline (sau manual)

## 5) Notes securitate (MVP)
- Protecție rute via middleware
- Validare server-side cu Zod
- Sanitizare input cu sanitize-html
- Logs server-side la review
