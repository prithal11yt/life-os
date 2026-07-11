import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import StatCards from "@/components/StatCards";
import Heatmap from "@/components/Heatmap";
import PriorityTasks from "@/components/PriorityTasks";
import YouTubeCard from "@/components/YouTubeCard";
import MessagesCard from "@/components/MessagesCard";
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
  const messages = items
    .filter((i) => i.source === "telegram")
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4);

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex min-w-0 flex-1 flex-col gap-[18px] p-5 sm:p-7">
        <Topbar address={ADDRESS} openTasks={openTasks} dueToday={dueToday.length} />

        <StatCards items={items} habits={habits.habits} />

        <div className="grid gap-4 lg:grid-cols-3">
          <Heatmap countByDay={habits.countByDay} days={recentDays()} totalHabits={habits.totalHabits} today={today} />
          <PriorityTasks initialItems={items} />
          <YouTubeCard stats={stats} />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <MessagesCard messages={messages} />
          <HabitsCard initialHabits={habits.habits} />
          <ScheduleCard items={dueToday} />
        </div>
      </main>
    </div>
  );
}
