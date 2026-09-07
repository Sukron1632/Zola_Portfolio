import { NextRequest, NextResponse } from "next/server";
import {
  getCertifications,
  saveCertifications,
  addCertification,
  updateCertification,
  deleteCertification,
  Credential,
} from "@/lib/storage";

export const dynamic = "force-dynamic";

// GET /api/certifications - Retrieve all credentials
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const heroOnly = searchParams.get("hero") === "true";

    let certs = getCertifications();
    if (heroOnly) {
      certs = certs.filter((c) => c.isHeroBadge);
    }

    return NextResponse.json(certs, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching certifications:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve certifications" },
      { status: 500 }
    );
  }
}

// POST /api/certifications - Add new credential
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.title || !body.issuer) {
      return NextResponse.json(
        { error: "Judul sertifikasi dan penerbit wajib diisi." },
        { status: 400 }
      );
    }

    const newCert = addCertification({
      title: String(body.title).trim(),
      issuer: String(body.issuer).trim(),
      credentialId: body.credentialId ? String(body.credentialId).trim() : `CERT-${Date.now()}`,
      issueDate: body.issueDate ? String(body.issueDate).trim() : "2024 / Valid",
      hash: body.hash || `sha256:${Date.now().toString(16)}...`,
      fileName: body.fileName || "Certificate.pdf",
      fileSize: body.fileSize || "1.5 MB",
      isHeroBadge: body.isHeroBadge !== undefined ? Boolean(body.isHeroBadge) : false,
      verifyUrl: body.verifyUrl ? String(body.verifyUrl).trim() : "https://bnsp.go.id",
      fileUrl: body.fileUrl ? String(body.fileUrl).trim() : undefined,
      imageUrl: body.imageUrl ? String(body.imageUrl).trim() : undefined,
      description: body.description ? String(body.description).trim() : undefined,
    });

    return NextResponse.json(newCert, { status: 201 });
  } catch (error: any) {
    console.error("Error creating certification:", error);
    return NextResponse.json(
      { error: error.message || "Failed to persist certification" },
      { status: 500 }
    );
  }
}

// PUT /api/certifications - Update existing credential or full array
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    if (Array.isArray(body)) {
      saveCertifications(body as Credential[]);
      return NextResponse.json({ success: true, count: body.length }, { status: 200 });
    }

    if (!body.id) {
      return NextResponse.json(
        { error: "Certification ID is required for update." },
        { status: 400 }
      );
    }

    const updated = updateCertification(body.id, body);
    if (!updated) {
      return NextResponse.json({ error: "Certification not found." }, { status: 404 });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.error("Error updating certification:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update certification" },
      { status: 500 }
    );
  }
}

// DELETE /api/certifications - Remove credential by ID
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Certification ID is required." }, { status: 400 });
    }

    const success = deleteCertification(id);
    if (!success) {
      return NextResponse.json({ error: "Certification not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, id }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting certification:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete certification" },
      { status: 500 }
    );
  }
}

// PATCH /api/certifications - Toggle isHeroBadge
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: "Certification ID is required." }, { status: 400 });
    }

    const certs = getCertifications();
    const cert = certs.find((c) => c.id === body.id);
    if (!cert) {
      return NextResponse.json({ error: "Certification not found." }, { status: 404 });
    }

    const newHero = body.isHeroBadge !== undefined ? Boolean(body.isHeroBadge) : !cert.isHeroBadge;
    const updated = updateCertification(body.id, { isHeroBadge: newHero });

    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.error("Error patching certification:", error);
    return NextResponse.json(
      { error: error.message || "Failed to patch certification" },
      { status: 500 }
    );
  }
}
