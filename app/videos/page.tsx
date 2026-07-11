import PageHeader from "@/components/PageHeader";
import VideoIdeas from "@/components/VideoIdeas";
import { getItems } from "@/lib/items";

export const dynamic = "force-dynamic";

export default async function VideosPage() {
  const { items } = await getItems();
  const videos = items.filter((i) => i.type === "video");
  const open = videos.filter((v) => v.status !== "done").length;
  const made = videos.filter((v) => v.status === "done").length;
  return (
    <>
      <PageHeader title="Video Ideas" subtitle={`${open} to make · ${made} published — captured by voice`} />
      <VideoIdeas initial={items} showDone />
    </>
  );
}
