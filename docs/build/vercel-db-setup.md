# Vercel + Database Setup

## 1) Import project to Vercel
1. In Vercel, import the GitHub repo `stiofancranpairc-source/jobjar`.
2. Set **Root Directory** to `web`.
3. Framework preset should detect **Next.js**.

## 2) Create Postgres
1. In the Vercel project, open **Storage**.
2. Create a **Postgres** database and connect it to this project.
3. Vercel will add env vars automatically (`POSTGRES_URL`, `POSTGRES_URL_NON_POOLING`, etc).

## 3) Map env vars for Prisma
Add these project environment variables:
- `DATABASE_URL` = `POSTGRES_URL`
- `DIRECT_URL` = `POSTGRES_URL_NON_POOLING`

## 4) Initialize schema
Run once from local:

```bash
cd web
npm run db:push
npm run db:seed
```

## 5) Verify DB in deployment
After deploy, open:

`/api/health/db`

Expected JSON:
- `status: "ok"`
- `db: "connected"`

## 6) Ongoing workflow
- Schema changes: update `web/prisma/schema.prisma`
- Apply locally: `npm run db:migrate`
- Push code to trigger Vercel deploy
