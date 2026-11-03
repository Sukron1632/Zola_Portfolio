import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/settings - Retrieve current system configurations from PostgreSQL
export async function GET() {
  try {
    const settings = await prisma.systemSetting.findFirst({
      where: { id: 1 },
    });

    return NextResponse.json(
      settings || {
        id: 1,
        displayName: "Zola Dimas Firmansyah",
        titleTag: "Information Systems & Junior Web Developer",
        siteTitle: "Information Systems & Junior Web Developer",
        adminEmail: "zoladimas32@gmail.com",
        sessionTimeout: "7 Days (Standard Persistence)",
        logClicks: true,
        deanonymizeGeo: true,
        retentionDays: "30 Days (Auto-pruning)",
        poolLimit: 20,
        maintenanceMode: false,
        maxUploadSizeMB: 10,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching system settings from database:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve settings" },
      { status: 500 }
    );
  }
}

// PUT /api/settings - Update system configurations in PostgreSQL
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    const titleTag = body.titleTag || body.siteTitle || "Information Systems & Junior Web Developer";
    const siteTitle = body.siteTitle || body.titleTag || titleTag;

    const updated = await prisma.systemSetting.upsert({
      where: { id: 1 },
      update: {
        displayName: body.displayName !== undefined ? String(body.displayName).trim() : undefined,
        titleTag: titleTag ? String(titleTag).trim() : undefined,
        siteTitle: siteTitle ? String(siteTitle).trim() : undefined,
        adminEmail: body.adminEmail !== undefined ? String(body.adminEmail).trim() : undefined,
        sessionTimeout: body.sessionTimeout !== undefined ? String(body.sessionTimeout).trim() : undefined,
        logClicks: body.logClicks !== undefined ? Boolean(body.logClicks) : undefined,
        deanonymizeGeo: body.deanonymizeGeo !== undefined ? Boolean(body.deanonymizeGeo) : undefined,
        retentionDays: body.retentionDays !== undefined ? String(body.retentionDays).trim() : undefined,
        poolLimit: body.poolLimit !== undefined ? Number(body.poolLimit) : undefined,
        maintenanceMode: body.maintenanceMode !== undefined ? Boolean(body.maintenanceMode) : undefined,
        maxUploadSizeMB: body.maxUploadSizeMB !== undefined ? Number(body.maxUploadSizeMB) : undefined,
      },
      create: {
        id: 1,
        displayName: body.displayName ? String(body.displayName).trim() : "Zola Dimas Firmansyah",
        titleTag: titleTag ? String(titleTag).trim() : "Information Systems & Junior Web Developer",
        siteTitle: siteTitle ? String(siteTitle).trim() : "Information Systems & Junior Web Developer",
        adminEmail: body.adminEmail ? String(body.adminEmail).trim() : "zoladimas32@gmail.com",
        sessionTimeout: body.sessionTimeout ? String(body.sessionTimeout).trim() : "7 Days (Standard Persistence)",
        logClicks: body.logClicks !== undefined ? Boolean(body.logClicks) : true,
        deanonymizeGeo: body.deanonymizeGeo !== undefined ? Boolean(body.deanonymizeGeo) : true,
        retentionDays: body.retentionDays ? String(body.retentionDays).trim() : "30 Days (Auto-pruning)",
        poolLimit: body.poolLimit !== undefined ? Number(body.poolLimit) : 20,
        maintenanceMode: body.maintenanceMode !== undefined ? Boolean(body.maintenanceMode) : false,
        maxUploadSizeMB: body.maxUploadSizeMB !== undefined ? Number(body.maxUploadSizeMB) : 10,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.error("Error saving system settings in database:", error);
    return NextResponse.json(
      { error: error.message || "Failed to persist settings" },
      { status: 500 }
    );
  }
}
