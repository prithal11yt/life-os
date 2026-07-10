import { env, integrations } from "./config";
import { sampleYouTube } from "./sample-data";
import { YouTubeStats, YouTubeVideo } from "./types";

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
