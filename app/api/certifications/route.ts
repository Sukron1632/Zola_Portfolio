import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/certifications - Retrieve all credentials from PostgreSQL
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const heroOnly = searchParams.get("hero") === "true";

    const certs = await prisma.certification.findMany({
      where: heroOnly ? { isHeroBadge: true } : undefined,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(certs, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching certifications from database:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve certifications" },
      { status: 500 }
    );
  }
}

// POST /api/certifications - Add new credential to PostgreSQL
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.title || !body.issuer) {
      return NextResponse.json(
        { error: "Judul sertifikasi dan penerbit wajib diisi." },
        { status: 400 }
      );
    }

    const newCert = await prisma.certification.create({
      data: {
        id: body.id ? String(body.id) : undefined,
        title: String(body.title).trim(),
        issuer: String(body.issuer).trim(),
        credentialId: body.credentialId ? String(body.credentialId).trim() : `CERT-${Date.now()}`,
        issueDate: body.issueDate ? String(body.issueDate).trim() : "2024 / Valid",
        hash: body.hash || `sha256:${Date.now().toString(16)}...`,
        fileName: body.fileName || "Certificate.pdf",
        fileSize: body.fileSize || "1.5 MB",
        isHeroBadge: body.isHeroBadge !== undefined ? Boolean(body.isHeroBadge) : false,
        verifyUrl: body.verifyUrl ? String(body.verifyUrl).trim() : null,
        fileUrl: body.fileUrl ? String(body.fileUrl).trim() : null,
        imageUrl: body.imageUrl ? String(body.imageUrl).trim() : null,
        gallery: Array.isArray(body.gallery) ? body.gallery : [],
        description: body.description ? String(body.description).trim() : null,
      },
    });

    return NextResponse.json(newCert, { status: 201 });
  } catch (error: any) {
    console.error("Error creating certification in database:", error);
    return NextResponse.json(
      { error: error.message || "Failed to persist certification" },
      { status: 500 }
    );
  }
}

// PUT /api/certifications - Update existing credential or full array in PostgreSQL
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    if (Array.isArray(body)) {
      await prisma.$transaction(
        body.map((item: any, idx: number) =>
          prisma.certification.update({
            where: { id: String(item.id) },
            data: {
              order: idx,
              title: item.title !== undefined ? String(item.title).trim() : undefined,
              issuer: item.issuer !== undefined ? String(item.issuer).trim() : undefined,
              credentialId: item.credentialId !== undefined ? String(item.credentialId).trim() : undefined,
              issueDate: item.issueDate !== undefined ? String(item.issueDate).trim() : undefined,
              verifyUrl: item.verifyUrl !== undefined ? (item.verifyUrl ? String(item.verifyUrl).trim() : null) : undefined,
              fileUrl: item.fileUrl !== undefined ? (item.fileUrl ? String(item.fileUrl).trim() : null) : undefined,
              imageUrl: item.imageUrl !== undefined ? (item.imageUrl ? String(item.imageUrl).trim() : null) : undefined,
              description: item.description !== undefined ? (item.description ? String(item.description).trim() : null) : undefined,
              isHeroBadge: item.isHeroBadge !== undefined ? Boolean(item.isHeroBadge) : undefined,
            },
          })
        )
      );
      return NextResponse.json({ success: true, count: body.length }, { status: 200 });
    }

    if (!body.id) {
      return NextResponse.json(
        { error: "Certification ID is required for update." },
        { status: 400 }
      );
    }

    const updated = await prisma.certification.update({
      where: { id: String(body.id) },
      data: {
        title: body.title !== undefined ? String(body.title).trim() : undefined,
        issuer: body.issuer !== undefined ? String(body.issuer).trim() : undefined,
        credentialId: body.credentialId !== undefined ? String(body.credentialId).trim() : undefined,
        issueDate: body.issueDate !== undefined ? String(body.issueDate).trim() : undefined,
        hash: body.hash !== undefined ? String(body.hash) : undefined,
        fileName: body.fileName !== undefined ? String(body.fileName) : undefined,
        fileSize: body.fileSize !== undefined ? String(body.fileSize) : undefined,
        isHeroBadge: body.isHeroBadge !== undefined ? Boolean(body.isHeroBadge) : undefined,
        verifyUrl: body.verifyUrl !== undefined ? (body.verifyUrl ? String(body.verifyUrl).trim() : null) : undefined,
        fileUrl: body.fileUrl !== undefined ? (body.fileUrl ? String(body.fileUrl).trim() : null) : undefined,
        imageUrl: body.imageUrl !== undefined ? (body.imageUrl ? String(body.imageUrl).trim() : null) : undefined,
        gallery: Array.isArray(body.gallery) ? body.gallery : undefined,
        description: body.description !== undefined ? (body.description ? String(body.description).trim() : null) : undefined,
        order: body.order !== undefined ? Number(body.order) : undefined,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.error("Error updating certification in database:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update certification" },
      { status: 500 }
    );
  }
}

// DELETE /api/certifications - Remove credential by ID from PostgreSQL
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Certification ID is required." }, { status: 400 });
    }

    await prisma.certification.delete({
      where: { id: String(id) },
    });

    return NextResponse.json({ success: true, id }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting certification from database:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete certification" },
      { status: 500 }
    );
  }
}

// PATCH /api/certifications - Toggle isHeroBadge in PostgreSQL
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: "Certification ID is required." }, { status: 400 });
    }

    const current = await prisma.certification.findUnique({
      where: { id: String(body.id) },
    });

    if (!current) {
      return NextResponse.json({ error: "Certification not found." }, { status: 404 });
    }

    const newHero = body.isHeroBadge !== undefined ? Boolean(body.isHeroBadge) : !current.isHeroBadge;

    const updated = await prisma.certification.update({
      where: { id: String(body.id) },
      data: { isHeroBadge: newHero },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.error("Error patching certification in database:", error);
    return NextResponse.json(
      { error: error.message || "Failed to patch certification" },
      { status: 500 }
    );
  }
}
