import type { witnesses } from "@/db/schema";

type Witness = typeof witnesses.$inferSelect;

export function isWitnessActive(witness: Pick<Witness, "status" | "expiresAt">, now = new Date()) {
  return witness.status === "active" && (witness.expiresAt === null || witness.expiresAt.getTime() > now.getTime());
}

export function witnessExpiration(duration: "7" | "30" | "90" | "never", now = new Date()) {
  if (duration === "never") return null;
  const expiresAt = new Date(now);
  expiresAt.setUTCDate(expiresAt.getUTCDate() + Number(duration));
  return expiresAt;
}
