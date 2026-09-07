import { NextRequest, NextResponse } from "next/server";
import {
  getExperience,
  saveExperience,
  addExperience,
  updateExperience,
  deleteExperience,
  CareerRecord,
} from "@/lib/storage";

export const dynamic = "force-dynamic";

// GET /api/experience - Retrieve all experience milestones
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const publishedOnly = searchParams.get("published") === "true";

    let records = getExperience();
    if (publishedOnly) {
      records = records.filter((r) => r.isPublished !== false);
    }

    return NextResponse.json(records, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching experience:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve experience" },
      { status: 500 }
    );
  }
}

// POST /api/experience - Add new career record
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.role || !body.organization) {
      return NextResponse.json(
        { error: "Peran/posisi dan organisasi wajib diisi." },
        { status: 400 }
      );
    }

    const newRecord = addExperience({
      role: String(body.role).trim(),
      organization: String(body.organization).trim(),
      location: body.location ? String(body.location).trim() : "Indonesia",
      period: body.period ? String(body.period).trim() : "2024",
      type: body.type || "Internship",
      status: body.status || "Completed",
      impactMetric: body.impactMetric ? String(body.impactMetric).trim() : "",
      description: body.description ? String(body.description).trim() : "",
      technologies: Array.isArray(body.technologies) ? body.technologies : [],
      proofFileName: body.proofFileName || undefined,
      isPublished: body.isPublished !== undefined ? Boolean(body.isPublished) : true,
    });

    return NextResponse.json(newRecord, { status: 201 });
  } catch (error: any) {
    console.error("Error creating experience record:", error);
    return NextResponse.json(
      { error: error.message || "Failed to persist experience record" },
      { status: 500 }
    );
  }
}

// PUT /api/experience - Update existing milestone or full array
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    if (Array.isArray(body)) {
      saveExperience(body as CareerRecord[]);
      return NextResponse.json({ success: true, count: body.length }, { status: 200 });
    }

    if (!body.id) {
      return NextResponse.json(
        { error: "Experience ID is required for update." },
        { status: 400 }
      );
    }

    const updated = updateExperience(body.id, body);
    if (!updated) {
      return NextResponse.json({ error: "Experience milestone not found." }, { status: 404 });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.error("Error updating experience:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update experience" },
      { status: 500 }
    );
  }
}

// DELETE /api/experience - Remove milestone by ID
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Experience ID is required." }, { status: 400 });
    }

    const success = deleteExperience(id);
    if (!success) {
      return NextResponse.json({ error: "Experience milestone not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, id }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting experience:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete experience" },
      { status: 500 }
    );
  }
}

// PATCH /api/experience - Toggle isPublished
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: "Experience ID is required." }, { status: 400 });
    }

    const records = getExperience();
    const item = records.find((r) => r.id === body.id);
    if (!item) {
      return NextResponse.json({ error: "Experience milestone not found." }, { status: 404 });
    }

    const newPublished = body.isPublished !== undefined ? Boolean(body.isPublished) : !item.isPublished;
    const updated = updateExperience(body.id, { isPublished: newPublished });

    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.error("Error patching experience:", error);
    return NextResponse.json(
      { error: error.message || "Failed to patch experience" },
      { status: 500 }
    );
  }
}
