import { NextRequest } from "next/server";
import { env } from "./config";

// Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`. We also accept
// `?secret=` for easy manual testing. If no secret is configured, allow
// (useful in local dev) but that's your call to set in production.
export function authorizeCron(req: NextRequest): boolean {
  if (!env.cronSecret) return true;
  const header = req.headers.get("authorization");
  if (header === `Bearer ${env.cronSecret}`) return true;
  const url = new URL(req.url);
  return url.searchParams.get("secret") === env.cronSecret;
}
