import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/profile - Fetch singleton profile (public or admin)
export async function GET() {
  try {
    const profile = await prisma.profile
      .findFirst({
        where: { id: 1 },
      })
      .catch(() => null);

    return NextResponse.json(
      profile || {
        id: 1,
        name: "Zola Dimas Firmansyah",
        avatarUrl: null,
        location: "Yogyakarta, Indonesia",
        heroTitle: "Systems Architect & Backend Engineer",
        heroSubtitle: "Specializing in Distributed Systems, UML Modeling, and PostgreSQL Optimization",
        aboutText:
          "Information Systems specialist with deep focus on enterprise backend architectures, PostgreSQL query optimization (42% latency reduction during Diskominfo DIY tenure), UML system analysis, and reliable REST/gRPC API gateways.",
        emailContact: "zoladimas32@gmail.com",
        githubUrl: "https://github.com/zoladimas",
        linkedinUrl: "https://linkedin.com/in/zoladimas",
        resumeUrl: "/cv-zola-dimas.pdf",
      }
    );
  } catch (error: any) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({
      id: 1,
      name: "Zola Dimas Firmansyah",
      heroTitle: "Systems Architect & Backend Engineer",
      emailContact: "zoladimas32@gmail.com",
    });
  }
}

// PUT /api/profile - Update singleton profile (admin only)
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const isDev = process.env.NODE_ENV !== "production";
    if (!isDev && (!session || !session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      avatarUrl,
      location,
      heroTitle,
      heroSubtitle,
      aboutText,
      emailContact,
      githubUrl,
      linkedinUrl,
      resumeUrl,
    } = body;

    // Validate email format if provided
    if (emailContact && typeof emailContact === "string") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailContact.trim())) {
        return NextResponse.json(
          { error: "Format email kontak tidak valid." },
          { status: 400 }
        );
      }
    }

    const profile = await prisma.profile.upsert({
      where: { id: 1 },
      update: {
        name: name !== undefined ? String(name).trim() : undefined,
        avatarUrl: avatarUrl !== undefined ? (avatarUrl ? String(avatarUrl).trim() : null) : undefined,
        location: location !== undefined ? String(location).trim() : undefined,
        heroTitle: heroTitle !== undefined ? String(heroTitle).trim() : undefined,
        heroSubtitle: heroSubtitle !== undefined ? String(heroSubtitle).trim() : undefined,
        aboutText: aboutText !== undefined ? String(aboutText) : undefined,
        emailContact: emailContact !== undefined ? String(emailContact).trim() : undefined,
        githubUrl: githubUrl !== undefined ? (githubUrl ? String(githubUrl).trim() : null) : undefined,
        linkedinUrl: linkedinUrl !== undefined ? (linkedinUrl ? String(linkedinUrl).trim() : null) : undefined,
        resumeUrl: resumeUrl !== undefined ? (resumeUrl ? String(resumeUrl).trim() : null) : undefined,
      },
      create: {
        id: 1,
        name: name ? String(name).trim() : "Zola Dimas Firmansyah",
        avatarUrl: avatarUrl ? String(avatarUrl).trim() : null,
        location: location ? String(location).trim() : "Yogyakarta, Indonesia",
        heroTitle: heroTitle ? String(heroTitle).trim() : "Systems Architect & Backend Engineer",
        heroSubtitle: heroSubtitle ? String(heroSubtitle).trim() : "Specializing in Distributed Systems, UML Modeling, and PostgreSQL Optimization",
        aboutText: aboutText ? String(aboutText) : "Information Systems specialist with deep focus on enterprise backend architectures.",
        emailContact: emailContact ? String(emailContact).trim() : "zoladimas32@gmail.com",
        githubUrl: githubUrl ? String(githubUrl).trim() : null,
        linkedinUrl: linkedinUrl ? String(linkedinUrl).trim() : null,
        resumeUrl: resumeUrl ? String(resumeUrl).trim() : null,
      },
    });

    return NextResponse.json(profile, { status: 200 });
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
