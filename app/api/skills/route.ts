import { NextRequest, NextResponse } from "next/server";
import {
  getSkills,
  saveSkills,
  addSkill,
  updateSkill,
  deleteSkill,
  TechItem,
} from "@/lib/storage";

export const dynamic = "force-dynamic";

// GET /api/skills - Retrieve all registered skills
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");

    let skills = getSkills();

    if (category) {
      skills = skills.filter((s) => s.category === category);
    }
    if (featured === "true") {
      skills = skills.filter((s) => s.isFeatured);
    }

    return NextResponse.json(skills, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching skills:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve skills" },
      { status: 500 }
    );
  }
}

// POST /api/skills - Add a new skill
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name || !body.category) {
      return NextResponse.json(
        { error: "Nama teknologi dan kategori wajib diisi." },
        { status: 400 }
      );
    }

    const newSkill = addSkill({
      name: String(body.name).trim(),
      category: body.category,
      description: body.description ? String(body.description).trim() : "",
      proficiency: Number(body.proficiency) || 85,
      level: body.level || "mastery",
      isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : true,
    });

    return NextResponse.json(newSkill, { status: 201 });
  } catch (error: any) {
    console.error("Error creating skill:", error);
    return NextResponse.json(
      { error: error.message || "Failed to persist skill" },
      { status: 500 }
    );
  }
}

// PUT /api/skills - Update existing skill or save full reordered array
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    // If body is an array, save entire collection
    if (Array.isArray(body)) {
      saveSkills(body as TechItem[]);
      return NextResponse.json({ success: true, count: body.length }, { status: 200 });
    }

    if (!body.id) {
      return NextResponse.json(
        { error: "Skill ID is required for update." },
        { status: 400 }
      );
    }

    const updated = updateSkill(body.id, body);
    if (!updated) {
      return NextResponse.json({ error: "Skill not found." }, { status: 404 });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.error("Error updating skill:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update skill" },
      { status: 500 }
    );
  }
}

// DELETE /api/skills - Remove a skill by ID
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Skill ID is required." }, { status: 400 });
    }

    const success = deleteSkill(id);
    if (!success) {
      return NextResponse.json({ error: "Skill not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, id }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting skill:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete skill" },
      { status: 500 }
    );
  }
}

// PATCH /api/skills - Toggle isFeatured
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: "Skill ID is required." }, { status: 400 });
    }

    const skill = getSkills().find((s) => s.id === body.id);
    if (!skill) {
      return NextResponse.json({ error: "Skill not found." }, { status: 404 });
    }

    const newFeatured = body.isFeatured !== undefined ? Boolean(body.isFeatured) : !skill.isFeatured;
    const updated = updateSkill(body.id, { isFeatured: newFeatured });

    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.error("Error patching skill:", error);
    return NextResponse.json(
      { error: error.message || "Failed to patch skill" },
      { status: 500 }
    );
  }
}
