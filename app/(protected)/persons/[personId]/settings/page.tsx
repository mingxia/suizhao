import { redirect } from "next/navigation";
import { requirePersonOwner } from "@/lib/permissions";
import { requireSession } from "@/lib/session";

export default async function Settings({ params }: { params: Promise<{ personId: string }> }) {
  const { personId } = await params;
  const session = await requireSession();
  await requirePersonOwner(personId, session.user.id);
  redirect(`/persons/${personId}`);
}
