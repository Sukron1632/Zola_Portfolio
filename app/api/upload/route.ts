import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadToSupabaseStorage } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 1. Verify admin session (bypassed for testing / dev mode)
    const session = await getServerSession(authOptions);
    const isDev = process.env.NODE_ENV !== "production";
    if (!isDev && (!session || !session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "projects";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 3. Validate file type (Images + Documents)
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Format file tidak didukung. Format yang diizinkan: JPG, PNG, WEBP, GIF, SVG, PDF, dan DOCX.",
        },
        { status: 400 }
      );
    }

    // Max 10MB file size limit for photos & documents
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Ukuran file melebihi batas maksimal 10MB." },
        { status: 400 }
      );
    }

    // 4. Generate unique file path
    const fileExt = file.name.split(".").pop() || "jpg";
    const sanitizedBase = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .toLowerCase();
    const fileName = `${folder}/${Date.now()}-${sanitizedBase}.${fileExt}`;

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 5. Upload to Supabase Storage bucket (default bucket: "portfolio")
    const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "portfolio";
    const { url, error } = await uploadToSupabaseStorage(buffer, fileName, file.type, bucket);

    if (error || !url) {
      return NextResponse.json(
        { error: error || "Failed to upload to Supabase Storage" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url, success: true }, { status: 201 });
  } catch (error: any) {
    console.error("Error in upload API:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
