import PageHeader from "@/components/PageHeader";
import TasksBoard from "@/components/TasksBoard";
import { getItems } from "@/lib/items";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const { items } = await getItems();
  const open = items.filter((i) => i.status === "open").length;
  const done = items.filter((i) => i.status === "done").length;
  return (
    <>
      <PageHeader title="Tasks" subtitle={`${open} open · ${done} completed — across business & personal`} />
      <TasksBoard initialItems={items} />
    </>
  );
}
