import { getCloudflareContext } from "@opennextjs/cloudflare";
export async function getPhotosBucket() { return (await getCloudflareContext({ async: true })).env.PHOTOS; }
export function yearPhotoKeys(userId: string, personId: string, stage: "first_seen" | "age", age: number | null) { const id = crypto.randomUUID(); const segment = stage === "first_seen" ? "first-seen" : `ages/${age}`; return { thumbnailKey: `users/${userId}/persons/${personId}/${segment}/${id}-thumb.webp`, largeKey: `users/${userId}/persons/${personId}/${segment}/${id}-large.webp` }; }
export function coverKey(userId: string, personId: string) { return `users/${userId}/persons/${personId}/cover/${crypto.randomUUID()}.webp`; }
