import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { hashPassword, verifyPassword } from "@/lib/password";

export async function getAuth() {
  return betterAuth({ database: drizzleAdapter(await getDb(), { provider: "sqlite", schema }), baseURL: process.env.BETTER_AUTH_URL, emailAndPassword: { enabled: true, password: { hash: hashPassword, verify: verifyPassword } }, advanced: { database: { generateId: () => crypto.randomUUID() } }, plugins: [nextCookies()] });
}
