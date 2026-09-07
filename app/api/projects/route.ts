import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/projects - Retrieve published or all projects
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const onlyPublished = searchParams.get("published") === "true";

    const projects = await prisma.project
      .findMany({
        where: onlyPublished ? { isPublished: true } : undefined,
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        include: {
          _count: {
            select: { clickTracks: true },
          },
        },
      })
      .catch(() => []);

    return NextResponse.json(projects);
  } catch (error: any) {
    console.error("Error fetching projects:", error);
    return NextResponse.json([]);
  }
}

// POST /api/projects - Create a new project (Admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const isDev = process.env.NODE_ENV !== "production";
    if (!isDev && (!session || !session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      slug,
      badge,
      description,
      thumbnail,
      videoUrl,
      techStack,
      liveUrl,
      repoUrl,
      isFeatured,
      isPublished,
      gallery,
      documentUrl,
      completedAt,
    } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required." },
        { status: 400 }
      );
    }

    // Auto-generate slug if not provided
    let finalSlug = slug
      ? String(slug).trim().toLowerCase()
      : title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") || `project-${Date.now()}`;

    // Check if slug already exists
    const existing = await prisma.project.findUnique({
      where: { slug: finalSlug },
    });

    if (existing) {
      if (slug) {
        return NextResponse.json(
          { error: "A project with this slug already exists." },
          { status: 409 }
        );
      } else {
        finalSlug = `${finalSlug}-${Date.now().toString(36)}`;
      }
    }

    // Format techStack array
    const formattedTechStack = Array.isArray(techStack)
      ? techStack
      : typeof techStack === "string"
      ? techStack.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [];

    // Format gallery array
    const formattedGallery = Array.isArray(gallery)
      ? gallery
      : typeof gallery === "string"
      ? gallery.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [];

    // If marked as featured/highlighted, unset other featured projects
    if (Boolean(isFeatured)) {
      await prisma.project.updateMany({
        data: { isFeatured: false },
      });
    }

    const project = await prisma.project.create({
      data: {
        title,
        slug: finalSlug,
        badge: badge ? String(badge).trim() : null,
        description,
        thumbnail: thumbnail || null,
        videoUrl: videoUrl || null,
        techStack: formattedTechStack,
        liveUrl: liveUrl || null,
        repoUrl: repoUrl || null,
        isFeatured: Boolean(isFeatured),
        isPublished: Boolean(isPublished),
        gallery: formattedGallery,
        documentUrl: documentUrl || null,
        completedAt: completedAt ? new Date(completedAt) : null,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create project" },
      { status: 500 }
    );
  }
}
