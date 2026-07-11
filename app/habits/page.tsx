import PageHeader from "@/components/PageHeader";
import Heatmap from "@/components/Heatmap";
import HabitsManager from "@/components/HabitsManager";
import { getHabits, localDay, recentDays } from "@/lib/habits";

export const dynamic = "force-dynamic";

export default async function HabitsPage() {
  const habits = await getHabits();
  const doneToday = habits.habits.filter((h) => h.doneToday).length;
  return (
    <>
      <PageHeader title="Habits" subtitle={`${doneToday}/${habits.totalHabits} done today · keep the streak alive`} />
      <Heatmap countByDay={habits.countByDay} days={recentDays()} totalHabits={habits.totalHabits} today={localDay()} />
      <HabitsManager initialHabits={habits.habits} />
    </>
  );
}
