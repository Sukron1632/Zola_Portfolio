import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  const checks: Record<string, any> = {};

  // 1. Check PostgreSQL via Prisma
  const rawDbUrl = process.env.DATABASE_URL || "";
  let dbDiagnostics: any = null;
  try {
    const parsed = new URL(rawDbUrl);
    dbDiagnostics = {
      username: parsed.username,
      host: parsed.host,
      port: parsed.port,
      database: parsed.pathname.replace(/^\//, ""),
      hasPassword: !!parsed.password,
      passwordLength: parsed.password ? parsed.password.length : 0,
      hasBracketsInPassword: parsed.password.includes("[") || parsed.password.includes("]"),
      pgbouncerParam: parsed.searchParams.get("pgbouncer"),
    };
  } catch (e: any) {
    dbDiagnostics = { error: "Failed to parse DATABASE_URL: " + e.message };
  }

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - dbStart;
    checks.database = {
      status: "HEALTHY",
      provider: "Supabase PostgreSQL",
      latencyMs: dbLatency,
      diagnostics: dbDiagnostics,
    };
  } catch (error: any) {
    checks.database = {
      status: "DEGRADED",
      error: error.message || "Database connection failed",
      diagnostics: dbDiagnostics,
    };
  }

  // 2. Check Supabase Object Storage
  try {
    const admin = getSupabaseAdmin();
    const { data: buckets, error } = await admin.storage.listBuckets();
    if (error) {
      checks.storage = {
        status: "DEGRADED",
        error: error.message,
      };
    } else {
      const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "portofolio";
      const target = buckets?.find((b) => b.name === bucketName || b.name === "portfolio" || b.name === "portofolio");
      checks.storage = {
        status: "HEALTHY",
        bucket: target?.name || bucketName,
        isPublic: target?.public ?? false,
      };
    }
  } catch (error: any) {
    checks.storage = {
      status: "DEGRADED",
      error: error.message || "Storage access failed",
    };
  }

  // 3. Auth Configuration status
  checks.auth = {
    provider: "Google OAuth",
    adminConfigured: !!process.env.ADMIN_EMAIL,
    adminEmail: process.env.ADMIN_EMAIL || "NOT_SET",
  };

  const totalTime = Date.now() - startTime;
  const isHealthy =
    checks.database?.status === "HEALTHY" && checks.storage?.status === "HEALTHY";

  return NextResponse.json(
    {
      status: isHealthy ? "HEALTHY" : "DEGRADED",
      timestamp: new Date().toISOString(),
      responseTimeMs: totalTime,
      checks,
    },
    { status: isHealthy ? 200 : 503 }
  );
}
