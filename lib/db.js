import { createClient } from "@libsql/client";

// TURSO_DATABASE_URL & TURSO_AUTH_TOKEN diisi lewat environment variables di Vercel
export const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
