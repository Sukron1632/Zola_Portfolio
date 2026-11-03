"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  Save,
  Loader2,
  X,
  Terminal,
  FileText,
  RefreshCw,
  Plus,
  Trash2,
  Calendar,
  Maximize2,
  Star,
  ExternalLink,
  Video,
  Globe,
  FileCode,
  Sparkles,
  Download,
} from "lucide-react";
import { compressImage } from "@/lib/compressImage";

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    badge: "",
    description: "",
    techStack: "",
    liveUrl: "",
    repoUrl: "",
    videoUrl: "",
    completedAt: "",
    isFeatured: false,
    isPublished: true,
  });

  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [documentUrl, setDocumentUrl] = useState<string>("");

  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewGalleryImage, setPreviewGalleryImage] = useState<string | null>(null);

  const dateInputRef = useRef<HTMLInputElement>(null);

  // Helper to generate URL-safe kebab-case slug
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  useEffect(() => {
    if (!projectId) return;

    async function loadProject() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/projects/${projectId}`);
        if (!res.ok) {
          throw new Error("Proyek tidak ditemukan.");
        }
        const data = await res.json();

        // Format completion date to YYYY-MM-DD for input[type="date"]
        let formattedDate = "";
        if (data.completedAt) {
          formattedDate = new Date(data.completedAt).toISOString().split("T")[0];
        }

        setFormData({
          title: data.title || "",
          slug: data.slug || "",
          badge: data.badge || "",
          description: data.description || "",
          techStack: Array.isArray(data.techStack)
            ? data.techStack.join(", ")
            : data.techStack || "",
          liveUrl: data.liveUrl || "",
          repoUrl: data.repoUrl || "",
          videoUrl: data.videoUrl || "",
          completedAt: formattedDate,
          isFeatured: Boolean(data.isFeatured),
          isPublished: Boolean(data.isPublished),
        });

        setThumbnailUrl(data.thumbnail || "");
        setGallery(Array.isArray(data.gallery) ? data.gallery : []);
        setDocumentUrl(data.documentUrl || "");
      } catch (err: any) {
        setErrorMessage(err.message || "Gagal memuat data proyek.");
      } finally {
        setIsLoading(false);
      }
    }

    loadProject();
  }, [projectId]);

  // Upload thumbnail with client-side compression
  const handleThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingThumb(true);
    setErrorMessage(null);

    try {
      const processedFile = await compressImage(file, {
        maxWidth: 1600,
        maxHeight: 1200,
        quality: 0.85,
      });

      const uploadFormData = new FormData();
      uploadFormData.append("file", processedFile);
      uploadFormData.append("folder", "projects");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (response.status === 413) {
        throw new Error("Ukuran foto thumbnail melebihi batas 4.5MB. Harap gunakan gambar yang lebih kecil.");
      }

      const text = await response.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Respon upload tidak valid (${response.status} ${response.statusText})`);
      }

      if (!response.ok) {
        throw new Error(data.error || "Gagal mengunggah thumbnail.");
      }

      setThumbnailUrl(data.url);
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal mengunggah foto thumbnail.");
    } finally {
      setIsUploadingThumb(false);
    }
  };

  // Upload Gallery Image with client-side compression
  const handleGalleryUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingGallery(true);
    setErrorMessage(null);

    try {
      const processedFile = await compressImage(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.85,
      });

      const uploadFormData = new FormData();
      uploadFormData.append("file", processedFile);
      uploadFormData.append("folder", "gallery");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (response.status === 413) {
        throw new Error("Ukuran foto galeri melebihi batas 4.5MB. Harap gunakan gambar yang lebih kecil.");
      }

      const text = await response.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Respon upload tidak valid (${response.status} ${response.statusText})`);
      }

      if (!response.ok) {
        throw new Error(data.error || "Gagal mengunggah tangkapan layar.");
      }

      setGallery((prev) => [...prev, data.url]);
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal mengunggah tangkapan layar galeri.");
    } finally {
      setIsUploadingGallery(false);
    }
  };

  // Upload Technical Specification / SRS Document (PDF/DOCX)
  const handleDocumentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingDoc(true);
    setErrorMessage(null);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("folder", "documents");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (response.status === 413) {
        throw new Error("Ukuran dokumen SRS melebihi batas 4.5MB. Harap gunakan berkas yang lebih kecil.");
      }

      const text = await response.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Respon upload tidak valid (${response.status} ${response.statusText})`);
      }

      if (!response.ok) {
        throw new Error(data.error || "Gagal mengunggah dokumen SRS.");
      }

      setDocumentUrl(data.url);
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal mengunggah dokumen spesifikasi teknis.");
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleAddGalleryUrl = () => {
    if (!newGalleryUrl.trim()) return;
    setGallery((prev) => [...prev, newGalleryUrl.trim()]);
    setNewGalleryUrl("");
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGallery((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          slug: formData.slug.trim() || undefined,
          liveUrl: formData.liveUrl.trim() || null,
          repoUrl: formData.repoUrl.trim() || null,
          videoUrl: formData.videoUrl.trim() || null,
          thumbnail: thumbnailUrl || null,
          gallery: gallery,
          documentUrl: documentUrl.trim() || null,
          completedAt: formData.completedAt || null,
        }),
      });

      const text = await response.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Respon server tidak valid (${response.status} ${response.statusText}). Kemungkinan timeout database.`);
      }

      if (!response.ok) {
        throw new Error(data.error || "Gagal memperbarui proyek di database.");
      }

      router.push("/admin/projects");
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal memperbarui proyek.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-obsidian-subtext hover:text-white transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Daftar Proyek</span>
        </Link>
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-brand-emerald" />
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Edit Blueprint & Spesifikasi Proyek
          </h1>
        </div>
        <p className="text-xs text-obsidian-subtext mt-1 font-mono">
          Perbarui arsitektur sistem, metadata dokumen SRS, live demo endpoints, dan galeri tangkapan layar dengan sinkronisasi langsung ke database.
        </p>
      </div>

      {isLoading ? (
        <div className="py-24 text-center space-y-3 font-mono border border-obsidian-border bg-obsidian-canvas rounded-lg card-radial-glow">
          <Loader2 className="w-8 h-8 animate-spin text-brand-emerald mx-auto" />
          <p className="text-xs text-obsidian-subtext">Memuat blueprint proyek dari database...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-md border border-rose-500/40 bg-rose-500/10 text-rose-300 text-xs font-mono">
              {errorMessage}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-lg border border-obsidian-border bg-obsidian-canvas card-radial-glow p-6 text-xs font-mono"
          >
            {/* Project Thumbnail with Supabase Storage upload */}
            <div>
              <label className="block text-[11px] font-semibold text-obsidian-subtext uppercase tracking-wider mb-2">
                Featured Cover Visual (Supabase Storage)
              </label>

              {thumbnailUrl ? (
                <div className="relative group rounded-md border border-obsidian-border overflow-hidden bg-obsidian-void max-w-sm">
                  <img
                    src={thumbnailUrl}
                    alt="Thumbnail preview"
                    className="w-full h-44 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setThumbnailUrl("")}
                    className="absolute top-2 right-2 p-1.5 rounded bg-obsidian-void/90 text-rose-400 hover:text-white border border-obsidian-border"
                    title="Hapus foto cover"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 border border-dashed border-obsidian-border hover:border-brand-emerald/60 rounded-md bg-obsidian-void cursor-pointer transition-colors max-w-sm">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    disabled={isUploadingThumb}
                    className="hidden"
                  />
                  {isUploadingThumb ? (
                    <div className="flex flex-col items-center gap-2 text-obsidian-subtext">
                      <RefreshCw className="w-5 h-5 animate-spin text-brand-cyan" />
                      <span>Mengunggah ke Supabase Storage...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-obsidian-subtext text-center">
                      <Upload className="w-5 h-5 text-brand-emerald" />
                      <span className="font-semibold text-white">
                        Unggah Cover Visual
                      </span>
                      <span className="text-[10px] text-obsidian-muted">
                        PNG, JPG, WEBP (Auto compressed, Max 10MB)
                      </span>
                    </div>
                  )}
                </label>
              )}
            </div>

            {/* Project Title & Highlight Badge */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-obsidian-subtext uppercase tracking-wider mb-2">
                  Judul Proyek *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      title: val,
                      slug: isSlugManuallyEdited ? prev.slug : generateSlug(val),
                    }));
                  }}
                  placeholder="e.g. Multi-Hotel IT Asset Management"
                  className="w-full px-3.5 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-obsidian-subtext uppercase tracking-wider mb-2">
                  Highlight Tag / Badge
                </label>
                <input
                  type="text"
                  value={formData.badge}
                  onChange={(e) =>
                    setFormData({ ...formData, badge: e.target.value })
                  }
                  placeholder="e.g. GOV-TECH | PUBLIC SECTOR or ENTERPRISE SaaS"
                  className="w-full px-3.5 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
                />
              </div>
            </div>

            {/* Custom Slug with Auto Generator Helper */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[11px] font-semibold text-obsidian-subtext uppercase tracking-wider">
                  URL Slug Identifier
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      slug: generateSlug(prev.title),
                    }));
                    setIsSlugManuallyEdited(false);
                  }}
                  disabled={!formData.title}
                  className="inline-flex items-center gap-1 text-[10px] font-mono text-brand-cyan hover:text-cyan-300 disabled:opacity-40 transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Auto Generate from Title</span>
                </button>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-obsidian-muted select-none text-xs font-mono">
                  /
                </span>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => {
                    setIsSlugManuallyEdited(true);
                    setFormData({
                      ...formData,
                      slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                    });
                  }}
                  placeholder="multi-hotel-it-asset-management"
                  className="w-full pl-6 pr-3.5 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-brand-emerald font-mono text-xs focus:outline-none focus:border-brand-emerald transition-colors"
                />
              </div>
              <p className="text-[10px] text-obsidian-muted mt-1 font-mono">
                Unique slug identifier used for direct URL routing, telemetries, and blueprint lookup.
              </p>
            </div>

            {/* Executive Summary & Architecture Description */}
            <div>
              <label className="block text-[11px] font-semibold text-obsidian-subtext uppercase tracking-wider mb-2">
                Deskripsi Arsitektur Sistem & Scope Teknis *
              </label>
              <textarea
                rows={4}
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Rincian arsitektur sistem, database transaction, diagram relasi, endpoint API, dan problem-solving..."
                className="w-full px-3.5 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
              />
            </div>

            {/* Tech Stack & Completion Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-obsidian-subtext uppercase tracking-wider mb-2">
                  Tag Teknologi (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={formData.techStack}
                  onChange={(e) =>
                    setFormData({ ...formData, techStack: e.target.value })
                  }
                  placeholder="Next.js 14, PostgreSQL, Prisma, Docker, RBAC"
                  className="w-full px-3.5 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-semibold text-obsidian-subtext uppercase tracking-wider">
                    Tanggal Penyelesaian (Calendar Picker)
                  </label>
                  {formData.completedAt && (
                    <span className="text-[10px] font-mono text-brand-emerald">
                      {new Date(formData.completedAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>
                <div className="relative flex items-center">
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={formData.completedAt}
                    style={{ colorScheme: "dark" }}
                    onClick={(e) => {
                      try {
                        (e.currentTarget as any).showPicker?.();
                      } catch {}
                    }}
                    onChange={(e) =>
                      setFormData({ ...formData, completedAt: e.target.value })
                    }
                    className="w-full pl-3.5 pr-24 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs cursor-pointer focus:outline-none focus:border-brand-emerald transition-colors"
                  />
                  <div className="absolute right-2 flex items-center gap-1">
                    {formData.completedAt && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, completedAt: "" })}
                        className="p-1 rounded text-obsidian-muted hover:text-rose-400 transition-colors"
                        title="Hapus Tanggal"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const today = new Date().toISOString().split("T")[0];
                        setFormData({ ...formData, completedAt: today });
                      }}
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-obsidian-card hover:bg-obsidian-highlight text-obsidian-subtext hover:text-white border border-obsidian-border transition-colors"
                      title="Set ke Hari Ini"
                    >
                      Hari ini
                    </button>
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => {
                        try {
                          dateInputRef.current?.showPicker?.();
                        } catch {}
                      }}
                      className="p-1 text-obsidian-muted hover:text-brand-emerald transition-colors"
                      title="Buka Kalender"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Endpoints & Links Grid: Live Demo, Video Walkthrough, GitHub Repository */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-obsidian-subtext uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-brand-cyan" />
                  <span>Live Production URL</span>
                </label>
                <input
                  type="url"
                  value={formData.liveUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, liveUrl: e.target.value })
                  }
                  placeholder="https://app.domain.com"
                  className="w-full px-3.5 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-obsidian-subtext uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-brand-emerald" />
                  <span>Video Demo / Tour URL</span>
                </label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, videoUrl: e.target.value })
                  }
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-3.5 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-obsidian-subtext uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-obsidian-subtext" />
                  <span>GitHub Repository URL</span>
                </label>
                <input
                  type="url"
                  value={formData.repoUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, repoUrl: e.target.value })
                  }
                  placeholder="https://github.com/username/repo"
                  className="w-full px-3.5 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
                />
              </div>
            </div>

            {/* Technical Specifications & SRS Document (PDF/DOCX) */}
            <div className="p-4 rounded-lg border border-obsidian-border bg-obsidian-void/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="block text-[11px] font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-brand-emerald" />
                    <span>Dokumen Spesifikasi Teknis & SRS</span>
                  </label>
                  <p className="text-[10px] text-obsidian-muted font-mono">
                    Lampirkan dokumentasi arsitektur resmi, spesifikasi SRS, atau UML blueprint (PDF atau DOCX).
                  </p>
                </div>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-brand-emerald/40 bg-brand-emerald/10 hover:bg-brand-emerald/20 text-brand-emerald-dim hover:text-brand-emerald text-xs cursor-pointer transition-all">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="hidden"
                    onChange={handleDocumentUpload}
                    disabled={isUploadingDoc}
                  />
                  {isUploadingDoc ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>Unggah Dokumen</span>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                  placeholder="https://domain.com/docs/system-specification-srs.pdf"
                  className="flex-1 px-3.5 py-2 rounded-md border border-obsidian-border bg-obsidian-canvas text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors font-mono"
                />
                {documentUrl && (
                  <button
                    type="button"
                    onClick={() => setDocumentUrl("")}
                    className="p-2 rounded-md border border-obsidian-border bg-obsidian-card hover:bg-obsidian-highlight text-rose-400 hover:text-white transition-colors"
                    title="Hapus dokumen terlampir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {documentUrl && (
                <div className="flex items-center justify-between p-2.5 rounded border border-brand-emerald/30 bg-brand-emerald/5 text-xs font-mono">
                  <div className="flex items-center gap-2 truncate text-brand-emerald-dim">
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{documentUrl}</span>
                  </div>
                  <a
                    href={documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-brand-emerald hover:underline shrink-0 ml-2"
                  >
                    <Download className="w-3 h-3" />
                    <span>Uji Tautan</span>
                  </a>
                </div>
              )}
            </div>

            {/* Visual Blueprint & Gallery Screenshots */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-semibold text-white">
                    Visual Blueprint & Galeri Tangkapan Layar ({gallery.length})
                  </label>
                  <p className="text-[11px] text-obsidian-muted font-mono">
                    Unggah diagram arsitektur, skema DB, atau UI aplikasi. Klik gambar untuk inspeksi.
                  </p>
                </div>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-obsidian-border bg-obsidian-card hover:bg-obsidian-highlight text-obsidian-text text-xs cursor-pointer transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleGalleryUpload}
                    disabled={isUploadingGallery}
                  />
                  {isUploadingGallery ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>Unggah Screenshot</span>
                </label>
              </div>

              {/* Add gallery image URL directly */}
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newGalleryUrl}
                  onChange={(e) => setNewGalleryUrl(e.target.value)}
                  placeholder="Atau tempelkan URL screenshot eksternal (https://...)"
                  className="flex-1 px-3.5 py-1.5 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
                />
                <button
                  type="button"
                  onClick={handleAddGalleryUrl}
                  className="px-3 py-1.5 rounded-md border border-obsidian-border bg-obsidian-card hover:bg-obsidian-highlight text-obsidian-text text-xs font-semibold transition-all"
                >
                  Tambah URL
                </button>
              </div>

              {gallery.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {gallery.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative group rounded-md border border-obsidian-border overflow-hidden bg-obsidian-void aspect-video cursor-pointer"
                      onClick={() => setPreviewGalleryImage(url)}
                      title="Klik untuk inspeksi gambar"
                    >
                      <img
                        src={url}
                        alt={`Screenshot ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Maximize2 className="w-4 h-4 text-white" />
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveGalleryImage(idx);
                        }}
                        className="absolute top-1 right-1 p-1 rounded bg-black/80 text-rose-400 hover:text-white z-10"
                        title="Hapus Tangkapan Layar"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Publish Immediately Checkbox */}
            <div className="flex items-center gap-2.5 pt-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={formData.isPublished}
                onChange={(e) =>
                  setFormData({ ...formData, isPublished: e.target.checked })
                }
                className="w-4 h-4 rounded border-obsidian-border bg-obsidian-void text-brand-emerald focus:ring-brand-emerald"
              />
              <label
                htmlFor="isPublished"
                className="text-xs text-obsidian-text select-none cursor-pointer"
              >
                Status Publikasi (Tampilkan di etalase portofolio publik)
              </label>
            </div>

            {/* Highlight Showcase Checkbox */}
            <div className="flex items-start gap-2.5 p-3 rounded-md border border-amber-500/20 bg-amber-500/5">
              <input
                type="checkbox"
                id="isFeatured"
                checked={formData.isFeatured}
                onChange={(e) =>
                  setFormData({ ...formData, isFeatured: e.target.checked })
                }
                className="w-4 h-4 mt-0.5 rounded border-amber-500/40 bg-obsidian-void text-amber-500 focus:ring-amber-500"
              />
              <label
                htmlFor="isFeatured"
                className="text-xs text-amber-200 select-none cursor-pointer space-y-0.5"
              >
                <span className="font-semibold flex items-center gap-1.5 text-amber-300">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  Highlight Project (Showcase Utama Terbesar)
                </span>
                <p className="text-[11px] text-obsidian-subtext font-normal">
                  Tampilkan proyek ini sebagai kartu unggulan paling besar di section Real-World Implementations portofolio publik.
                </p>
              </label>
            </div>

            {/* Form Actions */}
            <div className="pt-4 border-t border-obsidian-border flex flex-col sm:flex-row justify-end gap-3">
              <Link
                href="/admin/projects"
                className="w-full sm:w-auto text-center px-4 py-2.5 rounded-md border border-obsidian-border bg-obsidian-void hover:bg-obsidian-highlight text-obsidian-subtext text-xs font-semibold transition-all"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || isUploadingThumb}
                className="w-full sm:w-auto justify-center inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-obsidian-text hover:bg-white disabled:opacity-50 text-obsidian-void text-xs font-semibold transition-all shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan Perubahan...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Pembaruan Proyek</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Admin Gallery Inspect Lightbox */}
          {previewGalleryImage && (
            <div
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in"
              onClick={() => setPreviewGalleryImage(null)}
            >
              <button
                type="button"
                onClick={() => setPreviewGalleryImage(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-obsidian-card border border-obsidian-border text-white hover:bg-obsidian-highlight"
                title="Tutup Pratinjau"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={previewGalleryImage}
                alt="Gallery Full Preview"
                className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg border border-obsidian-border shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
