import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins";
import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { hashPassword, verifyPassword } from "@/lib/password";

export async function getAuth() {
  return betterAuth({
    database: drizzleAdapter(await getDb(), { provider: "sqlite", schema }),
    baseURL: process.env.BETTER_AUTH_URL,
    emailAndPassword: {
      enabled: true,
      password: { hash: hashPassword, verify: verifyPassword },
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    },
    user: {
      additionalFields: {
        membership: { type: "string", required: false, defaultValue: "free", input: false },
        isAdmin: { type: "boolean", required: false, defaultValue: false, input: false },
      },
    },
    advanced: { database: { generateId: () => crypto.randomUUID() } },
    plugins: [username({ schema: { user: { fields: { displayUsername: "name" } } } }), nextCookies()],
  });
}
