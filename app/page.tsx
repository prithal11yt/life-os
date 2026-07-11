import Topbar from "@/components/Topbar";
import StatCards from "@/components/StatCards";
import Heatmap from "@/components/Heatmap";
import PriorityTasks from "@/components/PriorityTasks";
import YouTubeCard from "@/components/YouTubeCard";
import RecentActivity from "@/components/RecentActivity";
import ScheduleCard from "@/components/ScheduleCard";
import { getItems } from "@/lib/items";
import { getYouTube } from "@/lib/youtube";
import { getActivity } from "@/lib/activity";
import { localDay } from "@/lib/date";

export const dynamic = "force-dynamic";

const ADDRESS = process.env.NEXT_PUBLIC_ADDRESS_AS || "sir";

export default async function Home() {
  const [{ items }, { stats }, activity] = await Promise.all([
    getItems(),
    getYouTube(),
    getActivity(),
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

      <StatCards items={items} capturedThisWeek={activity.capturedThisWeek} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Heatmap countByDay={activity.countByDay} days={activity.days} today={today} activeDays={activity.activeDays} />
        <PriorityTasks initialItems={items} />
        <YouTubeCard stats={stats} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ScheduleCard items={dueToday} />
        <RecentActivity items={items} />
      </div>
    </>
  );
}
