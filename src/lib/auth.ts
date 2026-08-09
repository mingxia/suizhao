import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins";
import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { hashPassword, verifyPassword } from "@/lib/password";

export async function getAuth() {
  const baseURL = process.env.BETTER_AUTH_URL;

  return betterAuth({
    database: drizzleAdapter(await getDb(), { provider: "sqlite", schema }),
    baseURL,
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
    oauthConfig: {
      // Keep the short-lived OAuth state in an encrypted cookie. This avoids a
      // second, region-dependent D1 read when Google redirects back to Workers.
      storeStateStrategy: "cookie",
    },
    advanced: {
      database: { generateId: () => crypto.randomUUID() },
      // A visitor may enter through www while Google returns to the canonical
      // apex URL. Share the OAuth state cookie between those two hosts.
      crossSubDomainCookies: {
        enabled: baseURL === "https://weseeva.com",
        domain: ".weseeva.com",
      },
    },
    plugins: [username({
      minUsernameLength: 3,
      maxUsernameLength: 30,
      usernameValidator: (value) => /^[A-Za-z0-9_.]+$/.test(value),
      schema: { user: { fields: { displayUsername: "name" } } },
    }), nextCookies()],
  });
}
