interface CloudflareEnv {
  DB: D1Database;
  PHOTOS: R2Bucket;
  ASSETS: Fetcher;
  BETTER_AUTH_URL: string;
  BETTER_AUTH_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
}
