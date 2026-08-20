# AI Advisory Platform

Next.js interface for a multi-department AI advisory experience.

## Implemented portfolio reference

The Marketing Advisor is the fully integrated reference implementation. It sends user questions and optional dashboard context to an n8n AI workflow and stores user/session data in Supabase.

The UI was designed to support additional advisory domains as extensible modules.

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Add your own Supabase project values.
3. Add your own n8n webhook URL.
4. Run:

```bash
npm install
npm run dev
```

No production credentials or datasets are included in this portfolio copy.
