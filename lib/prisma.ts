import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function getDatabaseUrl(): string | undefined {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) return undefined;
  let url = rawUrl.trim();

  // 1. Strip wrapping double or single quotes if pasted in Vercel UI
  if (
    (url.startsWith('"') && url.endsWith('"')) ||
    (url.startsWith("'") && url.endsWith("'"))
  ) {
    url = url.slice(1, -1).trim();
  }

  // 2. Auto-sanitize if password was copied with square brackets [password] or %5Bpassword%5D
  url = url.replace(/:\[([^\]]+)\]@/, ":$1@");
  url = url.replace(/:%5B([^%]+)%5D@/i, ":$1@");

  try {
    const parsed = new URL(url);
    // Ensure pgbouncer param on port 6543
    if (parsed.port === "6543" && !parsed.searchParams.has("pgbouncer")) {
      parsed.searchParams.set("pgbouncer", "true");
    }
    // Ensure connection timeouts for serverless environments
    if (!parsed.searchParams.has("connect_timeout")) {
      parsed.searchParams.set("connect_timeout", "15");
    }
    if (!parsed.searchParams.has("pool_timeout")) {
      parsed.searchParams.set("pool_timeout", "15");
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

const dbUrl = getDatabaseUrl();

export const prisma =
  globalThis.prisma ??
  new PrismaClient({
    datasources: dbUrl
      ? {
          db: {
            url: dbUrl,
          },
        }
      : undefined,
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

export default prisma;
