import PageHeader from "@/components/PageHeader";
import NotesBoard from "@/components/NotesBoard";
import { getItems } from "@/lib/items";

export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const { items } = await getItems();
  const notes = items.filter((i) => i.type === "idea");
  const open = notes.filter((n) => n.status !== "done").length;
  return (
    <>
      <PageHeader title="Notes" subtitle={`${open} ideas & thoughts captured`} />
      <NotesBoard initialNotes={notes} />
    </>
  );
}
