// Core domain types for the Life OS assistant.

export type ItemType = "task" | "idea" | "reminder" | "video";
export type Priority = "high" | "medium" | "low";
export type Category = "business" | "personal";
export type Status = "open" | "done" | "archived";

export interface Item {
  id: string;
  created_at: string;
  type: ItemType;
  title: string;
  details: string | null;
  priority: Priority;
  category: Category;
  status: Status;
  due_at: string | null;
  source: string; // 'telegram' | 'manual'
  raw_transcript: string | null;
  completed_at?: string | null;
}

// Shape Claude returns when it "understands" a voice note.
export interface ExtractedItem {
  type: ItemType;
  title: string;
  details?: string | null;
  priority: Priority;
  category: Category;
  due_at?: string | null; // ISO 8601 or null
}

export interface YouTubeStats {
  channelTitle: string;
  subscribers: number;
  totalViews: number;
  videoCount: number;
  recent: YouTubeVideo[];
  updatedAt: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  views: number;
  publishedAt: string;
  thumbnail: string | null;
}

// Long-form-only performance for one 30-day window.
export interface YouTubeMonthlyStats {
  videoCount: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
}

// Three rolling 30-day windows for comparison, refreshed daily.
export interface YouTubeMonthly {
  current: YouTubeMonthlyStats; // last 30 days (focus)
  prev1: YouTubeMonthlyStats; // 30–60 days ago
  prev2: YouTubeMonthlyStats; // 60–90 days ago
  updatedAt: string | null;
}
