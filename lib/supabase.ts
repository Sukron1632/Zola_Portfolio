import { createClient } from "@supabase/supabase-js";

// Polyfill WebSocket in Node runtime if missing (prevents RealtimeClient crash in Node.js < 22)
if (typeof globalThis.WebSocket === "undefined") {
  globalThis.WebSocket = class DummyWebSocket {} as any;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tyywhqwzadynlibihfon.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "";

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Server-side / Admin Supabase client (service role key bypasses RLS for admin uploads)
export function getSupabaseAdmin() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Upload an image to Supabase Storage and return its public URL.
 * @param file The file to upload (Buffer, File, or Blob)
 * @param fileName Unique file name or relative path in bucket (e.g. "thumbnails/project-1.jpg")
 * @param contentType Optional MIME type
 * @param bucket Default bucket configured in environment or 'portofolio'
 */
export async function uploadToSupabaseStorage(
  file: File | Blob | Buffer,
  fileName: string,
  contentType?: string,
  bucket: string = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "portofolio"
): Promise<{ url: string | null; error: string | null }> {
  try {
    const admin = getSupabaseAdmin();

    const { error: uploadError } = await admin.storage
      .from(bucket)
      .upload(fileName, file, {
        contentType: contentType || "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      // Fallback check: if bucket was named 'portfolio' vs 'portofolio'
      if (uploadError.message?.toLowerCase().includes("bucket not found")) {
        const fallbackBucket = bucket === "portofolio" ? "portfolio" : "portofolio";
        const { error: fallbackError } = await admin.storage
          .from(fallbackBucket)
          .upload(fileName, file, {
            contentType: contentType || "image/jpeg",
            upsert: true,
          });
        if (!fallbackError) {
          const { data } = admin.storage.from(fallbackBucket).getPublicUrl(fileName);
          return { url: data.publicUrl, error: null };
        }
      }
      return { url: null, error: uploadError.message };
    }

    const { data } = admin.storage.from(bucket).getPublicUrl(fileName);
    return { url: data.publicUrl, error: null };
  } catch (err: any) {
    return { url: null, error: err.message || "Unknown error during upload" };
  }
}
