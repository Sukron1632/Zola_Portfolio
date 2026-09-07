import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// POST /api/track-click - Record outbound click event (fire-and-forget)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId } = body;

    if (!projectId || typeof projectId !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing projectId" },
        { status: 400 }
      );
    }

    // Extract telemetry headers
    const userAgent = req.headers.get("user-agent") || "unknown";
    const country =
      req.headers.get("x-vercel-ip-country") ||
      req.headers.get("cf-ipcountry") ||
      "ID";

    // Resolve project ID (in case slug or custom identifier is sent)
    let validProjectId = projectId;
    const projectExists = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    }).catch(() => null);

    if (!projectExists) {
      // Check if it's a project slug
      const projectBySlug = await prisma.project.findUnique({
        where: { slug: projectId },
        select: { id: true },
      }).catch(() => null);

      if (projectBySlug) {
        validProjectId = projectBySlug.id;
      } else {
        // If not a registered Project id/slug (e.g. resume link), return success without foreign key failure
        return NextResponse.json({ success: true, tracked: false, reason: "Unlinked asset" }, { status: 200 });
      }
    }

    // Record click event in PostgreSQL
    await prisma.clickTracker
      .create({
        data: {
          projectId: validProjectId,
          userAgent: userAgent.slice(0, 255),
          country: country.slice(0, 10),
        },
      })
      .catch((err) => {
        console.error("Telemetry insert error:", err.message);
      });

    return NextResponse.json({ success: true, tracked: true }, { status: 200 });
  } catch (error) {
    // Fail silent to never block client navigation
    return NextResponse.json({ success: true, tracked: false }, { status: 200 });
  }
}

// GET /api/track-click - Retrieve telemetry analytics summary
export async function GET(req: NextRequest) {
  try {
    const [totalClicks, recentClicks, projectsWithClicks] = await Promise.all([
      prisma.clickTracker.count().catch(() => 0),
      prisma.clickTracker
        .findMany({
          take: 20,
          orderBy: { clickedAt: "desc" },
          include: {
            project: {
              select: { title: true, slug: true },
            },
          },
        })
        .catch(() => []),
      prisma.project
        .findMany({
          select: {
            id: true,
            title: true,
            slug: true,
            _count: {
              select: { clickTracks: true },
            },
          },
          orderBy: {
            clickTracks: {
              _count: "desc",
            },
          },
        })
        .catch(() => []),
    ]);

    // Aggregate country counts
    const countryMap: Record<string, number> = {};
    recentClicks.forEach((click) => {
      const c = click.country || "GLOBAL";
      countryMap[c] = (countryMap[c] || 0) + 1;
    });

    return NextResponse.json({
      totalClicks,
      projectsWithClicks,
      countryBreakdown: countryMap,
      recentFeed: recentClicks,
    });
  } catch (error: any) {
    console.error("Error fetching telemetry analytics:", error);
    return NextResponse.json(
      {
        totalClicks: 0,
        projectsWithClicks: [],
        countryBreakdown: {},
        recentFeed: [],
      },
      { status: 200 }
    );
  }
}

// DELETE /api/track-click - Reset/Purge telemetry logs (Admin only)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const isDev = process.env.NODE_ENV !== "production";
    if (!isDev && (!session || !session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deleteResult = await prisma.clickTracker.deleteMany();

    return NextResponse.json({
      success: true,
      message: `Cleared ${deleteResult.count} telemetry records`,
      count: deleteResult.count,
    });
  } catch (error: any) {
    console.error("Error purging telemetry:", error);
    return NextResponse.json(
      { error: error.message || "Failed to purge telemetry" },
      { status: 500 }
    );
  }
}
