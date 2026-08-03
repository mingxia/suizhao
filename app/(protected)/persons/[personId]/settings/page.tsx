import { redirect } from "next/navigation";
import { requirePersonOwner } from "@/lib/permissions";
import { requireSession } from "@/lib/session";

// Keep old bookmarks working; member management now shares the timeline's modal workflow.
export default async function Settings({ params }: { params: Promise<{ personId: string }> }) {
  const { personId } = await params;
  const session = await requireSession();
  await requirePersonOwner(personId, session.user.id);
  redirect(`/persons/${personId}`);
}
