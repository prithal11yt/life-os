import { getSupabase } from "./supabase";

// GitHub-style habit tracking. Habits live in lifeos_habits; each completed
// habit-day is a row in lifeos_habit_logs.

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  sort: number;
}

export interface HabitView extends Habit {
  doneToday: boolean;
  streak: number; // consecutive days completed (up to today)
  total: number; // total completions
}

const HABITS_TABLE = "lifeos_habits";
const LOGS_TABLE = "lifeos_habit_logs";
const GRID_DAYS = 133; // 19 weeks

// yyyy-mm-dd in the user's timezone (IST), so "today" is consistent.
export function localDay(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(d);
}

// The last N day-strings, oldest → newest.
export function recentDays(n: number = GRID_DAYS): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    out.push(localDay(new Date(Date.now() - i * 86400_000)));
  }
  return out;
}

export interface HabitsData {
  habits: HabitView[];
  countByDay: Record<string, number>; // day -> # habits completed
  totalHabits: number;
  configured: boolean;
}

export async function getHabits(): Promise<HabitsData> {
  const supabase = getSupabase();
  if (!supabase) return { habits: [], countByDay: {}, totalHabits: 0, configured: false };

  const [{ data: habitRows }, { data: logRows }] = await Promise.all([
    supabase.from(HABITS_TABLE).select("*").eq("archived", false).order("sort"),
    supabase.from(LOGS_TABLE).select("habit_id, day").gte("day", recentDays()[0]),
  ]);

  const habits = (habitRows as Habit[]) ?? [];
  const logs = (logRows as { habit_id: string; day: string }[]) ?? [];

  // Index logs by habit and count per day.
  const daysByHabit = new Map<string, Set<string>>();
  const countByDay: Record<string, number> = {};
  for (const l of logs) {
    if (!daysByHabit.has(l.habit_id)) daysByHabit.set(l.habit_id, new Set());
    daysByHabit.get(l.habit_id)!.add(l.day);
    countByDay[l.day] = (countByDay[l.day] ?? 0) + 1;
  }

  const today = localDay();
  const views: HabitView[] = habits.map((h) => {
    const set = daysByHabit.get(h.id) ?? new Set<string>();
    return {
      ...h,
      doneToday: set.has(today),
      streak: computeStreak(set),
      total: set.size,
    };
  });

  return { habits: views, countByDay, totalHabits: habits.length, configured: true };
}

export async function addHabit(name: string, emoji: string): Promise<Habit> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not configured");
  const { data: maxRow } = await supabase
    .from(HABITS_TABLE)
    .select("sort")
    .order("sort", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort = ((maxRow as { sort?: number } | null)?.sort ?? 0) + 1;
  const { data, error } = await supabase
    .from(HABITS_TABLE)
    .insert({ name, emoji: emoji || "✅", sort })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Habit;
}

// Toggle today's completion for a habit. Returns the new done state.
export async function toggleHabitToday(habitId: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not configured");
  const day = localDay();
  const { data: existing } = await supabase
    .from(LOGS_TABLE)
    .select("id")
    .eq("habit_id", habitId)
    .eq("day", day)
    .maybeSingle();

  if (existing) {
    await supabase.from(LOGS_TABLE).delete().eq("id", (existing as { id: string }).id);
    return false;
  }
  await supabase.from(LOGS_TABLE).insert({ habit_id: habitId, day });
  return true;
}

export async function archiveHabit(habitId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not configured");
  await supabase.from(HABITS_TABLE).update({ archived: true }).eq("id", habitId);
}

// Consecutive days completed, ending today (or yesterday if today isn't done yet,
// so the streak doesn't "break" until a full day is missed).
function computeStreak(days: Set<string>): number {
  let streak = 0;
  const start = days.has(localDay()) ? 0 : 1;
  for (let i = start; i < 400; i++) {
    const day = localDay(new Date(Date.now() - i * 86400_000));
    if (days.has(day)) streak++;
    else break;
  }
  return streak;
}
