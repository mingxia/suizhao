import { getCloudflareContext } from "@opennextjs/cloudflare";
export async function getPhotosBucket() { return (await getCloudflareContext({ async: true })).env.PHOTOS; }
export function yearPhotoKeys(userId: string, personId: string, age: number) { const id = crypto.randomUUID(); return { thumbnailKey: `users/${userId}/persons/${personId}/ages/${age}/${id}-thumb.webp`, largeKey: `users/${userId}/persons/${personId}/ages/${age}/${id}-large.webp` }; }
export function coverKey(userId: string, personId: string) { return `users/${userId}/persons/${personId}/cover/${crypto.randomUUID()}.webp`; }
