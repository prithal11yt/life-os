import { getSupabase } from "./supabase";
import { sampleItems } from "./sample-data";
import { normalizeDueAt } from "./date";
import { ExtractedItem, Item } from "./types";

// Data access for captured items. Reads/writes Supabase when configured,
// otherwise serves in-memory sample data so the UI always works.

// Prefixed table living alongside the tse_* tables in the shared project.
const TABLE = "lifeos_items";

export async function getItems(): Promise<{ items: Item[]; isSample: boolean }> {
  const supabase = getSupabase();
  if (!supabase) return { items: sampleItems, isSample: true };

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .neq("status", "archived")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getItems error:", error.message);
    return { items: sampleItems, isSample: true };
  }
  return { items: (data as Item[]) ?? [], isSample: false };
}

export async function insertItems(
  extracted: ExtractedItem[],
  meta: { source: string; rawTranscript?: string | null }
): Promise<Item[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not configured");

  const rows = extracted.map((e) => ({
    type: e.type,
    title: e.title,
    details: e.details ?? null,
    priority: e.priority,
    category: e.category,
    status: "open" as const,
    due_at: normalizeDueAt(e.due_at), // model may return phrases like "tomorrow"
    source: meta.source,
    raw_transcript: meta.rawTranscript ?? null,
  }));

  const { data, error } = await supabase.from(TABLE).insert(rows).select();
  if (error) throw new Error(error.message);
  return (data as Item[]) ?? [];
}

export async function setItemStatus(id: string, status: Item["status"]) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not configured");
  const { error } = await supabase.from(TABLE).update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
}

// Items that are due within the given window and still open — used by reminders.
export async function getDueItems(withinHours: number): Promise<Item[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const cutoff = new Date(Date.now() + withinHours * 3600_000).toISOString();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("status", "open")
    .not("due_at", "is", null)
    .lte("due_at", cutoff)
    .order("due_at", { ascending: true });
  if (error) {
    console.error("getDueItems error:", error.message);
    return [];
  }
  return (data as Item[]) ?? [];
}

// Due (or overdue) open items we haven't reminded about yet.
export async function getItemsToRemind(windowMinutes: number): Promise<Item[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const cutoff = new Date(Date.now() + windowMinutes * 60_000).toISOString();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("status", "open")
    .is("reminded_at", null)
    .not("due_at", "is", null)
    .lte("due_at", cutoff)
    .order("due_at", { ascending: true });
  if (error) {
    console.error("getItemsToRemind error:", error.message);
    return [];
  }
  return (data as Item[]) ?? [];
}

export async function markReminded(ids: string[]) {
  const supabase = getSupabase();
  if (!supabase || ids.length === 0) return;
  const { error } = await supabase
    .from(TABLE)
    .update({ reminded_at: new Date().toISOString() })
    .in("id", ids);
  if (error) console.error("markReminded error:", error.message);
}

// All open items — used to build the morning brief.
export async function getOpenItems(): Promise<Item[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("status", "open")
    .order("due_at", { ascending: true, nullsFirst: false });
  if (error) {
    console.error("getOpenItems error:", error.message);
    return [];
  }
  return (data as Item[]) ?? [];
}
