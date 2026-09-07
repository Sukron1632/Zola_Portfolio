import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/projects/[id] - Retrieve single project by ID or Slug
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // First try lookup by primary key ID, then fallback to unique slug
    let project = await prisma.project.findUnique({
      where: { id },
      include: {
        _count: {
          select: { clickTracks: true },
        },
      },
    });

    if (!project) {
      project = await prisma.project.findUnique({
        where: { slug: id },
        include: {
          _count: {
            select: { clickTracks: true },
          },
        },
      });
    }

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(project, { status: 200 });
  } catch (error: any) {
    console.error("Error retrieving project:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve project" },
      { status: 500 }
    );
  }
}

// PATCH /api/projects/[id] - Toggle publish or update project fields
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const isDev = process.env.NODE_ENV !== "production";
    if (!isDev && (!session || !session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();

    // Check project existence
    const existing = await prisma.project.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Build sanitised update payload
    const dataToUpdate: any = {};

    if (body.title !== undefined) dataToUpdate.title = String(body.title).trim();
    if (body.slug !== undefined) dataToUpdate.slug = String(body.slug).trim().toLowerCase();
    if (body.badge !== undefined) dataToUpdate.badge = body.badge ? String(body.badge).trim() : null;
    if (body.description !== undefined) dataToUpdate.description = String(body.description);
    if (body.thumbnail !== undefined) dataToUpdate.thumbnail = body.thumbnail || null;
    if (body.videoUrl !== undefined) dataToUpdate.videoUrl = body.videoUrl || null;
    if (body.liveUrl !== undefined) dataToUpdate.liveUrl = body.liveUrl || null;
    if (body.repoUrl !== undefined) dataToUpdate.repoUrl = body.repoUrl || null;
    if (body.isPublished !== undefined) dataToUpdate.isPublished = Boolean(body.isPublished);
    if (body.isFeatured !== undefined) {
      const nextFeatured = Boolean(body.isFeatured);
      if (nextFeatured) {
        // Unset any other project so this is the sole highlighted showcase
        await prisma.project.updateMany({
          where: { id: { not: id } },
          data: { isFeatured: false },
        });
      }
      dataToUpdate.isFeatured = nextFeatured;
    }
    if (body.documentUrl !== undefined) dataToUpdate.documentUrl = body.documentUrl || null;
    if (body.completedAt !== undefined) dataToUpdate.completedAt = body.completedAt ? new Date(body.completedAt) : null;

    if (body.techStack !== undefined) {
      dataToUpdate.techStack = Array.isArray(body.techStack)
        ? body.techStack
        : typeof body.techStack === "string"
        ? body.techStack.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [];
    }

    if (body.gallery !== undefined) {
      dataToUpdate.gallery = Array.isArray(body.gallery)
        ? body.gallery
        : typeof body.gallery === "string"
        ? body.gallery.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [];
    }

    const updated = await prisma.project.update({
      where: { id },
      data: dataToUpdate,
      include: {
        _count: {
          select: { clickTracks: true },
        },
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update project" },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Delete a project (with cascade)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const isDev = process.env.NODE_ENV !== "production";
    if (!isDev && (!session || !session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const existing = await prisma.project.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json(
      { success: true, message: `Project ${id} deleted successfully` },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete project" },
      { status: 500 }
    );
  }
}
