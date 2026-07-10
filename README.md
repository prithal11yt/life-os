# 🧠 Life OS — your AI chief of staff

Drop a voice note in Telegram → it gets transcribed, understood by Claude, and
organized on a dashboard as prioritized tasks, ideas, and reminders. It watches
your YouTube channel, knows your day, and messages you a morning brief + nudges.

Built **cost-first**: cheap APIs do the watching, Claude (Haiku) does the
thinking in small, batched doses. Realistic cost for personal use: **~$0–5/mo**.

## The loop

```
Voice note (Telegram) → Groq Whisper (transcribe) → Claude Haiku (understand)
   → Supabase (store) → Dashboard + Telegram reminders/brief
```

## Run it now (preview mode, no keys)

```bash
npm install
npm run dev
```

Open http://localhost:3000 — the dashboard renders with **sample data**. Every
integration falls back gracefully, so you can wire keys in stages and watch real
data replace the samples. The status dots in the header show what's live.

## Go live

Copy `.env.example` → `.env.local` and fill in as you go.

### 1. Storage — Supabase
1. Create a project at [supabase.com](https://supabase.com).
2. Run the SQL in [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) (SQL Editor → paste → run).
3. Settings → API → copy the URL, the `anon` key, and the `service_role` key into `.env.local`.

### 2. The brain — Claude
- Get a key at [console.anthropic.com](https://console.anthropic.com) → `ANTHROPIC_API_KEY`.

### 3. Voice → text — Groq (free)
- Get a key at [console.groq.com](https://console.groq.com) → `GROQ_API_KEY`.

### 4. Telegram bot
1. Message [@BotFather](https://t.me/BotFather) → `/newbot` → copy the token → `TELEGRAM_BOT_TOKEN`.
2. Pick any random string for `TELEGRAM_WEBHOOK_SECRET` and `CRON_SECRET`.
3. After deploying, visit `https://YOUR_APP/api/telegram/set-webhook?secret=YOUR_CRON_SECRET` once to connect the bot.
4. Send the bot `/start` — it replies with your chat id. Put it in `TELEGRAM_CHAT_ID` so reminders reach you and the bot stays private.

### 5. YouTube (read-only, free)
1. [Google Cloud Console](https://console.cloud.google.com) → enable **YouTube Data API v3** → create an API key → `YOUTUBE_API_KEY`.
2. Your channel id (starts with `UC…`) → `YOUTUBE_CHANNEL_ID`.

## Deploy (Vercel)

```bash
npx vercel        # or push to GitHub and import at vercel.com
```

Add all the `.env.local` values in the Vercel project settings, then run the
`set-webhook` URL once.

**Scheduling note:** [`vercel.json`](vercel.json) defines two crons — reminders
every 15 min and a morning brief at 03:30 UTC (09:00 IST). Frequent crons need a
Vercel **Pro** plan; on **Hobby**, either keep the daily brief only, or point a
free scheduler like [cron-job.org](https://cron-job.org) at
`/api/cron/reminders?secret=YOUR_CRON_SECRET` every 15 min.

## What's sample vs. live right now

| Feature | Status |
|---|---|
| Capture · organize · dashboard · Telegram · YouTube · reminders · brief | **Real** once keys are set |
| Calendar (Today) + Gmail (Inbox triage) panels | **Sample** — interface ready; needs Google OAuth (next phase) |

## Roadmap
- Google OAuth for live Calendar + Gmail
- Progress/analytics over time (streaks, "what I shipped this week")
- Weekly review + revenue (Stripe) and health panels
