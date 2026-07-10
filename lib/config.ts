// Central place to read env + know which integrations are live.
// Everything degrades gracefully to sample data when a key is missing,
// so the dashboard always renders.

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  anthropicKey: process.env.ANTHROPIC_API_KEY,
  groqKey: process.env.GROQ_API_KEY,
  telegramToken: process.env.TELEGRAM_BOT_TOKEN,
  telegramChatId: process.env.TELEGRAM_CHAT_ID,
  telegramWebhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET,
  youtubeKey: process.env.YOUTUBE_API_KEY,
  youtubeChannelId: process.env.YOUTUBE_CHANNEL_ID,
  cronSecret: process.env.CRON_SECRET,
};

export const integrations = {
  supabase: Boolean(env.supabaseUrl && env.supabaseServiceKey),
  // The "brain" works on either Groq (free) or Anthropic.
  brain: Boolean(env.groqKey || env.anthropicKey),
  transcription: Boolean(env.groqKey),
  telegram: Boolean(env.telegramToken),
  youtube: Boolean(env.youtubeKey && env.youtubeChannelId),
};
