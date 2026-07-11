import { getSupabase } from "./supabase";
import { localDay, recentDays } from "./date";

// Activity = everything you do, per day: each item captured counts, and each
// item completed counts again on its completion day. Powers the contribution
// heatmap (GitHub-style) for your whole workflow.
export interface ActivityData {
  countByDay: Record<string, number>;
  days: string[]; // oldest → newest, for the grid
  max: number;
  capturedThisWeek: number;
  completedTotal: number;
  activeDays: number; // days with any activity in the window
}

export async function getActivity(): Promise<ActivityData> {
  const days = recentDays();
  const supabase = getSupabase();
  if (!supabase) {
    return { countByDay: {}, days, max: 0, capturedThisWeek: 0, completedTotal: 0, activeDays: 0 };
  }

  const { data } = await supabase.from("lifeos_items").select("created_at, completed_at, status");
  const rows = (data as { created_at: string; completed_at: string | null; status: string }[]) ?? [];

  const countByDay: Record<string, number> = {};
  const bump = (day: string) => {
    countByDay[day] = (countByDay[day] ?? 0) + 1;
  };

  const week = new Set(recentDays(7));
  let capturedThisWeek = 0;
  let completedTotal = 0;

  for (const r of rows) {
    const created = localDay(new Date(r.created_at));
    bump(created);
    if (week.has(created)) capturedThisWeek++;
    if (r.completed_at) {
      bump(localDay(new Date(r.completed_at)));
      completedTotal++;
    }
  }

  const windowSet = new Set(days);
  const activeDays = Object.keys(countByDay).filter((d) => windowSet.has(d)).length;
  const max = Math.max(1, ...days.map((d) => countByDay[d] ?? 0));

  return { countByDay, days, max, capturedThisWeek, completedTotal, activeDays };
}
