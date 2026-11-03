import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/experience - Retrieve all experience milestones from PostgreSQL
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const publishedOnly = searchParams.get("published") === "true";

    const records = await prisma.experience.findMany({
      where: publishedOnly ? { isPublished: true } : undefined,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(records, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching experience from database:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve experience" },
      { status: 500 }
    );
  }
}

// POST /api/experience - Add new career record to PostgreSQL
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.role || !body.organization) {
      return NextResponse.json(
        { error: "Peran/posisi dan organisasi wajib diisi." },
        { status: 400 }
      );
    }

    const newRecord = await prisma.experience.create({
      data: {
        id: body.id ? String(body.id) : undefined,
        role: String(body.role).trim(),
        organization: String(body.organization).trim(),
        location: body.location ? String(body.location).trim() : "Indonesia",
        period: body.period ? String(body.period).trim() : "2024",
        type: body.type || "Internship",
        status: body.status || "Completed",
        impactMetric: body.impactMetric ? String(body.impactMetric).trim() : null,
        description: body.description ? String(body.description).trim() : "",
        technologies: Array.isArray(body.technologies) ? body.technologies : [],
        proofFileName: body.proofFileName || null,
        isPublished: body.isPublished !== undefined ? Boolean(body.isPublished) : true,
      },
    });

    return NextResponse.json(newRecord, { status: 201 });
  } catch (error: any) {
    console.error("Error creating experience record in database:", error);
    return NextResponse.json(
      { error: error.message || "Failed to persist experience record" },
      { status: 500 }
    );
  }
}

// PUT /api/experience - Update existing milestone or full array in PostgreSQL
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    if (Array.isArray(body)) {
      await prisma.$transaction(
        body.map((item: any, idx: number) =>
          prisma.experience.update({
            where: { id: String(item.id) },
            data: {
              order: idx,
              role: item.role !== undefined ? String(item.role).trim() : undefined,
              organization: item.organization !== undefined ? String(item.organization).trim() : undefined,
              location: item.location !== undefined ? String(item.location).trim() : undefined,
              period: item.period !== undefined ? String(item.period).trim() : undefined,
              type: item.type !== undefined ? item.type : undefined,
              status: item.status !== undefined ? item.status : undefined,
              impactMetric: item.impactMetric !== undefined ? (item.impactMetric ? String(item.impactMetric).trim() : null) : undefined,
              description: item.description !== undefined ? String(item.description) : undefined,
              technologies: Array.isArray(item.technologies) ? item.technologies : undefined,
              isPublished: item.isPublished !== undefined ? Boolean(item.isPublished) : undefined,
            },
          })
        )
      );
      return NextResponse.json({ success: true, count: body.length }, { status: 200 });
    }

    if (!body.id) {
      return NextResponse.json(
        { error: "Experience ID is required for update." },
        { status: 400 }
      );
    }

    const updated = await prisma.experience.update({
      where: { id: String(body.id) },
      data: {
        role: body.role !== undefined ? String(body.role).trim() : undefined,
        organization: body.organization !== undefined ? String(body.organization).trim() : undefined,
        location: body.location !== undefined ? String(body.location).trim() : undefined,
        period: body.period !== undefined ? String(body.period).trim() : undefined,
        type: body.type !== undefined ? body.type : undefined,
        status: body.status !== undefined ? body.status : undefined,
        impactMetric: body.impactMetric !== undefined ? (body.impactMetric ? String(body.impactMetric).trim() : null) : undefined,
        description: body.description !== undefined ? String(body.description) : undefined,
        technologies: Array.isArray(body.technologies) ? body.technologies : undefined,
        proofFileName: body.proofFileName !== undefined ? (body.proofFileName ? String(body.proofFileName) : null) : undefined,
        isPublished: body.isPublished !== undefined ? Boolean(body.isPublished) : undefined,
        order: body.order !== undefined ? Number(body.order) : undefined,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.error("Error updating experience in database:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update experience" },
      { status: 500 }
    );
  }
}

// DELETE /api/experience - Remove milestone by ID from PostgreSQL
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Experience ID is required." }, { status: 400 });
    }

    await prisma.experience.delete({
      where: { id: String(id) },
    });

    return NextResponse.json({ success: true, id }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting experience from database:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete experience" },
      { status: 500 }
    );
  }
}

// PATCH /api/experience - Toggle isPublished in PostgreSQL
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: "Experience ID is required." }, { status: 400 });
    }

    const current = await prisma.experience.findUnique({
      where: { id: String(body.id) },
    });

    if (!current) {
      return NextResponse.json({ error: "Experience milestone not found." }, { status: 404 });
    }

    const newPublished = body.isPublished !== undefined ? Boolean(body.isPublished) : !current.isPublished;

    const updated = await prisma.experience.update({
      where: { id: String(body.id) },
      data: { isPublished: newPublished },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.error("Error patching experience in database:", error);
    return NextResponse.json(
      { error: error.message || "Failed to patch experience" },
      { status: 500 }
    );
  }
}
