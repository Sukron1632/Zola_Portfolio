import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/skills - Retrieve all registered skills from PostgreSQL
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");

    const skills = await prisma.skill.findMany({
      where: {
        category: category || undefined,
        isFeatured: featured === "true" ? true : undefined,
      },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json(skills, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching skills from database:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve skills" },
      { status: 500 }
    );
  }
}

// POST /api/skills - Add a new skill to PostgreSQL
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name || !body.category) {
      return NextResponse.json(
        { error: "Nama teknologi dan kategori wajib diisi." },
        { status: 400 }
      );
    }

    const newSkill = await prisma.skill.create({
      data: {
        id: body.id ? String(body.id) : undefined,
        name: String(body.name).trim(),
        category: body.category,
        description: body.description ? String(body.description).trim() : null,
        proficiency: Number(body.proficiency) || 85,
        level: body.level || "mastery",
        isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : true,
      },
    });

    return NextResponse.json(newSkill, { status: 201 });
  } catch (error: any) {
    console.error("Error creating skill in database:", error);
    return NextResponse.json(
      { error: error.message || "Failed to persist skill" },
      { status: 500 }
    );
  }
}

// PUT /api/skills - Update existing skill or save full reordered array in PostgreSQL
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    // If body is an array, save order for each
    if (Array.isArray(body)) {
      await prisma.$transaction(
        body.map((item: any, idx: number) =>
          prisma.skill.update({
            where: { id: String(item.id) },
            data: {
              order: idx,
              name: item.name !== undefined ? String(item.name).trim() : undefined,
              category: item.category !== undefined ? item.category : undefined,
              description: item.description !== undefined ? String(item.description).trim() : undefined,
              proficiency: item.proficiency !== undefined ? Number(item.proficiency) : undefined,
              level: item.level !== undefined ? item.level : undefined,
              isFeatured: item.isFeatured !== undefined ? Boolean(item.isFeatured) : undefined,
            },
          })
        )
      );
      return NextResponse.json({ success: true, count: body.length }, { status: 200 });
    }

    if (!body.id) {
      return NextResponse.json(
        { error: "Skill ID is required for update." },
        { status: 400 }
      );
    }

    const updated = await prisma.skill.update({
      where: { id: String(body.id) },
      data: {
        name: body.name !== undefined ? String(body.name).trim() : undefined,
        category: body.category !== undefined ? body.category : undefined,
        description: body.description !== undefined ? String(body.description).trim() : undefined,
        proficiency: body.proficiency !== undefined ? Number(body.proficiency) : undefined,
        level: body.level !== undefined ? body.level : undefined,
        isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : undefined,
        order: body.order !== undefined ? Number(body.order) : undefined,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.error("Error updating skill in database:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update skill" },
      { status: 500 }
    );
  }
}

// DELETE /api/skills - Remove a skill by ID from PostgreSQL
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Skill ID is required." }, { status: 400 });
    }

    await prisma.skill.delete({
      where: { id: String(id) },
    });

    return NextResponse.json({ success: true, id }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting skill from database:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete skill" },
      { status: 500 }
    );
  }
}

// PATCH /api/skills - Toggle isFeatured in PostgreSQL
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: "Skill ID is required." }, { status: 400 });
    }

    const current = await prisma.skill.findUnique({
      where: { id: String(body.id) },
    });

    if (!current) {
      return NextResponse.json({ error: "Skill not found." }, { status: 404 });
    }

    const newFeatured = body.isFeatured !== undefined ? Boolean(body.isFeatured) : !current.isFeatured;

    const updated = await prisma.skill.update({
      where: { id: String(body.id) },
      data: { isFeatured: newFeatured },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.error("Error patching skill in database:", error);
    return NextResponse.json(
      { error: error.message || "Failed to patch skill" },
      { status: 500 }
    );
  }
}
