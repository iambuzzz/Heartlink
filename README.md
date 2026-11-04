# HeartLink

Personalised, interactive gift pages, sent as a private link. Firefly Garden theme.

Templates: Birthday, Open When, Know-me Quiz, Chat Replay, Pinky Promise, Valentine's Week.

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in Supabase, UPI and admin password
npm run dev
```

Run `supabase/schema.sql` once in the Supabase SQL editor before the first start.

Open http://localhost:3000. Payments are verified by hand at `/admin`.

Product plan and roadmap: [PLAN.md](PLAN.md).
