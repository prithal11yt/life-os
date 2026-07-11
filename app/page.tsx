import Topbar from "@/components/Topbar";
import StatCards from "@/components/StatCards";
import Heatmap from "@/components/Heatmap";
import PriorityTasks from "@/components/PriorityTasks";
import YouTubeCard from "@/components/YouTubeCard";
import HabitsCard from "@/components/HabitsCard";
import ScheduleCard from "@/components/ScheduleCard";
import { getItems } from "@/lib/items";
import { getYouTube } from "@/lib/youtube";
import { getHabits, localDay, recentDays } from "@/lib/habits";

export const dynamic = "force-dynamic";

const ADDRESS = process.env.NEXT_PUBLIC_ADDRESS_AS || "sir";

export default async function Home() {
  const [{ items }, { stats }, habits] = await Promise.all([
    getItems(),
    getYouTube(),
    getHabits(),
  ]);

  const today = localDay();
  const open = items.filter((i) => i.status === "open");
  const openTasks = open.filter((i) => i.type === "task").length;
  const dueToday = open
    .filter((i) => i.due_at && localDay(new Date(i.due_at)) <= today)
    .sort((a, b) => new Date(a.due_at!).getTime() - new Date(b.due_at!).getTime());

  return (
    <>
      <Topbar address={ADDRESS} openTasks={openTasks} dueToday={dueToday.length} />

      <StatCards items={items} habits={habits.habits} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Heatmap countByDay={habits.countByDay} days={recentDays()} totalHabits={habits.totalHabits} today={today} />
        <PriorityTasks initialItems={items} />
        <YouTubeCard stats={stats} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <HabitsCard initialHabits={habits.habits} />
        <ScheduleCard items={dueToday} />
      </div>
    </>
  );
}
