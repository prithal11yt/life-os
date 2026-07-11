import { env, integrations } from "./config";
import { getSupabase } from "./supabase";
import { sampleYouTube } from "./sample-data";
import { YouTubeStats, YouTubeVideo, YouTubeMonthly } from "./types";

// Reads channel stats + recent uploads from the YouTube Data API v3.
// All read-only and free (10k quota units/day is plenty). Falls back to
// sample data when no key is set. Cached for an hour to avoid burning quota.

const HOUR = 3600_000;
let cache: { at: number; data: YouTubeStats } | null = null;

export async function getYouTube(): Promise<{ stats: YouTubeStats; isSample: boolean }> {
  if (!integrations.youtube) return { stats: sampleYouTube, isSample: true };
  if (cache && Date.now() - cache.at < HOUR) return { stats: cache.data, isSample: false };

  try {
    const key = env.youtubeKey!;
    const channelId = env.youtubeChannelId!;

    // 1) Channel-level stats + the "uploads" playlist id.
    const chRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id=${channelId}&key=${key}`
    );
    const chJson = await chRes.json();
    const channel = chJson.items?.[0];
    if (!channel) throw new Error("channel not found");

    const uploadsPlaylist = channel.contentDetails.relatedPlaylists.uploads;

    // 2) Most recent uploads from that playlist.
    const plRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=6&playlistId=${uploadsPlaylist}&key=${key}`
    );
    const plJson = await plRes.json();
    const videoIds: string[] = (plJson.items ?? [])
      .map((i: { contentDetails?: { videoId?: string } }) => i.contentDetails?.videoId)
      .filter(Boolean);

    // 3) View counts for those videos.
    let recent: YouTubeVideo[] = [];
    if (videoIds.length) {
      const vRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds.join(",")}&key=${key}`
      );
      const vJson = await vRes.json();
      recent = (vJson.items ?? []).map(
        (v: {
          id: string;
          snippet: { title: string; publishedAt: string; thumbnails?: { medium?: { url?: string } } };
          statistics: { viewCount?: string };
        }) => ({
          id: v.id,
          title: v.snippet.title,
          views: Number(v.statistics.viewCount ?? 0),
          publishedAt: v.snippet.publishedAt,
          thumbnail: v.snippet.thumbnails?.medium?.url ?? null,
        })
      );
    }

    const stats: YouTubeStats = {
      channelTitle: channel.snippet.title,
      subscribers: Number(channel.statistics.subscriberCount ?? 0),
      totalViews: Number(channel.statistics.viewCount ?? 0),
      videoCount: Number(channel.statistics.videoCount ?? 0),
      recent,
      updatedAt: new Date().toISOString(),
    };

    cache = { at: Date.now(), data: stats };
    return { stats, isSample: false };
  } catch (err) {
    console.error("getYouTube error:", (err as Error).message);
    return { stats: sampleYouTube, isSample: true };
  }
}

// ─── Long-form monthly stats (last 30 days, Shorts excluded) ──────────────

const SAMPLE_MONTHLY: YouTubeMonthly = {
  videoCount: 9,
  totalViews: 184000,
  totalLikes: 7600,
  totalComments: 940,
  updatedAt: null,
};

// YouTube defines Shorts as <= 3 minutes, so long-form = duration > 180s.
const SHORT_MAX_SECONDS = 180;

function parseIsoDuration(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0);
}

async function computeMonthlyLongform(): Promise<YouTubeMonthly> {
  const key = env.youtubeKey!;
  const channelId = env.youtubeChannelId!;
  const cutoff = Date.now() - 30 * 86400_000;

  const chRes = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${key}`
  );
  const chJson = await chRes.json();
  const uploads = chJson.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploads) throw new Error("no uploads playlist");

  // Collect video ids for uploads within the last 30 days (playlist is newest-first).
  const ids: string[] = [];
  let pageToken: string | undefined = undefined;
  let pages = 0;
  outer: while (pages < 6) {
    const url: string =
      `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&playlistId=${uploads}&key=${key}` +
      (pageToken ? `&pageToken=${pageToken}` : "");
    const plJson = await (await fetch(url)).json();
    for (const it of plJson.items ?? []) {
      const published = it.contentDetails?.videoPublishedAt;
      if (published && new Date(published).getTime() < cutoff) break outer;
      if (it.contentDetails?.videoId) ids.push(it.contentDetails.videoId);
    }
    pageToken = plJson.nextPageToken;
    pages++;
    if (!pageToken) break;
  }

  // Fetch stats + duration in batches of 50; keep only long-form in-window.
  let videoCount = 0, totalViews = 0, totalLikes = 0, totalComments = 0;
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50).join(",");
    const vJson = await (
      await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails,snippet&id=${batch}&key=${key}`
      )
    ).json();
    for (const v of vJson.items ?? []) {
      const published = new Date(v.snippet.publishedAt).getTime();
      if (published < cutoff) continue;
      if (parseIsoDuration(v.contentDetails.duration) <= SHORT_MAX_SECONDS) continue; // Short
      videoCount++;
      totalViews += Number(v.statistics.viewCount ?? 0);
      totalLikes += Number(v.statistics.likeCount ?? 0);
      totalComments += Number(v.statistics.commentCount ?? 0);
    }
  }

  return { videoCount, totalViews, totalLikes, totalComments, updatedAt: new Date().toISOString() };
}

// Reads the cached monthly stats; recomputes at most once a day.
export async function getYouTubeMonthly(): Promise<{ monthly: YouTubeMonthly; isSample: boolean }> {
  const supabase = getSupabase();
  if (!integrations.youtube || !supabase) return { monthly: SAMPLE_MONTHLY, isSample: true };

  const { data } = await supabase.from("lifeos_yt_monthly").select("*").eq("id", 1).maybeSingle();
  const row = data as {
    video_count: number; total_views: number; total_likes: number;
    total_comments: number; updated_at: string;
  } | null;

  const fresh = row && Date.now() - new Date(row.updated_at).getTime() < 20 * HOUR;
  if (fresh) {
    return {
      monthly: {
        videoCount: row.video_count, totalViews: row.total_views,
        totalLikes: row.total_likes, totalComments: row.total_comments, updatedAt: row.updated_at,
      },
      isSample: false,
    };
  }

  try {
    const m = await computeMonthlyLongform();
    await supabase.from("lifeos_yt_monthly").upsert({
      id: 1, video_count: m.videoCount, total_views: m.totalViews,
      total_likes: m.totalLikes, total_comments: m.totalComments, updated_at: m.updatedAt,
    });
    return { monthly: m, isSample: false };
  } catch (err) {
    console.error("getYouTubeMonthly error:", (err as Error).message);
    if (row) {
      return {
        monthly: {
          videoCount: row.video_count, totalViews: row.total_views,
          totalLikes: row.total_likes, totalComments: row.total_comments, updatedAt: row.updated_at,
        },
        isSample: false,
      };
    }
    return { monthly: SAMPLE_MONTHLY, isSample: true };
  }
}
