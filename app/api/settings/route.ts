import { NextRequest, NextResponse } from "next/server";
import { getSystemSettings, saveSystemSettings } from "@/lib/storage";

// GET /api/settings - Retrieve current system configurations
export async function GET() {
  try {
    const settings = getSystemSettings();
    return NextResponse.json(settings, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching system settings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve settings" },
      { status: 500 }
    );
  }
}

// PUT /api/settings - Update system configurations
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = saveSystemSettings(body);
    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.error("Error saving system settings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to persist settings" },
      { status: 500 }
    );
  }
}
