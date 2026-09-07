"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
} from "lucide-react";

export default function CreateProjectPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    badge: "",
    description: "",
    techStack: "",
    repoUrl: "",
    videoUrl: "",
    completedAt: "",
    isFeatured: false,
    isPublished: true,
  });

  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");

  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewGalleryImage, setPreviewGalleryImage] = useState<string | null>(null);

  const dateInputRef = useRef<HTMLInputElement>(null);

  // Upload thumbnail
  const handleThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingThumb(true);
    setErrorMessage(null);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("folder", "projects");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload thumbnail.");
      }

      setThumbnailUrl(data.url);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to upload thumbnail image.");
    } finally {
      setIsUploadingThumb(false);
    }
  };

  // Upload Gallery Image
  const handleGalleryUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingGallery(true);
    setErrorMessage(null);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("folder", "gallery");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload gallery screenshot.");
      }

      setGallery((prev) => [...prev, data.url]);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to upload gallery image.");
    } finally {
      setIsUploadingGallery(false);
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
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          thumbnail: thumbnailUrl || null,
          gallery: gallery,
          completedAt: formData.completedAt || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to persist project in database.");
      }

      router.push("/admin/projects");
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create project.");
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
          <span>Back to Projects List</span>
        </Link>
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-brand-emerald" />
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Create New Architecture Blueprint Record
          </h1>
        </div>
        <p className="text-xs text-obsidian-subtext mt-1 font-mono">
          Enter project metadata, technical specifications, SRS documentation, and visual gallery blueprints.
        </p>
      </div>

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
                title="Remove image"
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
                  <span>Uploading to Supabase Storage...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-obsidian-subtext text-center">
                  <Upload className="w-5 h-5 text-brand-emerald" />
                  <span className="font-semibold text-white">
                    Upload Cover Image
                  </span>
                  <span className="text-[10px] text-obsidian-muted">
                    PNG, JPG, WEBP (Max 10MB)
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
              Project Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
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

        {/* Executive Summary & Architecture Description */}
        <div>
          <label className="block text-[11px] font-semibold text-obsidian-subtext uppercase tracking-wider mb-2">
            System Architecture & Technical Scope *
          </label>
          <textarea
            rows={4}
            required
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Detailed architectural summary: high-throughput microservices, database schemas, UML diagrams, ACID guarantees, and problem-solving mechanisms..."
            className="w-full px-3.5 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
          />
        </div>

        {/* Tech Stack & Completion Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-obsidian-subtext uppercase tracking-wider mb-2">
              Tech Stack Tags (Comma separated)
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
                Completion Date (Calendar Picker)
              </label>
              {formData.completedAt && (
                <span className="text-[10px] font-mono text-brand-emerald">
                  {new Date(formData.completedAt).toLocaleDateString("en-US", {
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
                    title="Clear Date"
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
                  title="Set to Today"
                >
                  Today
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
                  title="Open Calendar"
                >
                  <Calendar className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* GitHub Repo URL & Video Architecture URL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-obsidian-subtext uppercase tracking-wider mb-2">
              GitHub Repository URL
            </label>
            <input
              type="url"
              value={formData.repoUrl}
              onChange={(e) =>
                setFormData({ ...formData, repoUrl: e.target.value })
              }
              placeholder="https://github.com/username/project"
              className="w-full px-3.5 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-obsidian-subtext uppercase tracking-wider mb-2">
              Live Architecture Demo URL
            </label>
            <input
              type="url"
              value={formData.videoUrl}
              onChange={(e) =>
                setFormData({ ...formData, videoUrl: e.target.value })
              }
              placeholder="https://project-demo.domain.com"
              className="w-full px-3.5 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
            />
          </div>
        </div>

        {/* Visual Blueprint & Gallery Screenshots */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-xs font-semibold text-white">
                Visual Blueprint & Gallery ({gallery.length})
              </label>
              <p className="text-[11px] text-obsidian-muted font-mono">
                Upload architecture diagrams, database schemas, or production UI screenshots. Click any image to inspect.
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
              <span>Upload Screenshot</span>
            </label>
          </div>

          {gallery.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {gallery.map((url, idx) => (
                <div
                  key={idx}
                  className="relative group rounded-md border border-obsidian-border overflow-hidden bg-obsidian-void aspect-video cursor-pointer"
                  onClick={() => setPreviewGalleryImage(url)}
                  title="Click to inspect"
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
                    title="Remove Screenshot"
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
            Publish immediately to public portfolio showcase
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
        <div className="pt-4 border-t border-obsidian-border flex justify-end gap-3">
          <Link
            href="/admin/projects"
            className="px-4 py-2 rounded-md border border-obsidian-border bg-obsidian-void hover:bg-obsidian-highlight text-obsidian-subtext text-xs font-semibold transition-all"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || isUploadingThumb}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-md bg-obsidian-text hover:bg-white disabled:opacity-50 text-obsidian-void text-xs font-semibold transition-all shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Storing Record...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Publish Project</span>
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
            title="Close Preview"
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
  );
}
