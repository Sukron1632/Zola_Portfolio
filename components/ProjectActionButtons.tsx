"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Eye, EyeOff, Loader2, Edit2, Star } from "lucide-react";

interface ProjectActionButtonsProps {
  projectId?: string;
  id?: string;
  isPublished: boolean;
  isFeatured?: boolean;
}

export default function ProjectActionButtons({
  projectId,
  id,
  isPublished,
  isFeatured = false,
}: ProjectActionButtonsProps) {
  const targetId = projectId || id || "";
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [published, setPublished] = useState(isPublished);
  const [featured, setFeatured] = useState(isFeatured);

  useEffect(() => {
    setPublished(isPublished);
  }, [isPublished]);

  useEffect(() => {
    setFeatured(isFeatured);
  }, [isFeatured]);

  const toggleHighlight = async () => {
    if (!targetId) return;
    setLoading(true);
    try {
      const nextFeatured = !featured;
      const res = await fetch(`/api/projects/${targetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: nextFeatured }),
      });
      if (res.ok) {
        setFeatured(nextFeatured);
        router.refresh();
      } else {
        alert("Gagal memperbarui status highlight proyek");
      }
    } catch {
      alert("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async () => {
    if (!targetId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${targetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !published }),
      });
      if (res.ok) {
        setPublished(!published);
        router.refresh();
      }
    } catch {
      alert("Gagal memperbarui status publikasi");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!targetId) return;
    if (!confirm("Apakah Anda yakin ingin menghapus proyek ini?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${targetId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Gagal menghapus proyek");
      }
    } catch {
      alert("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      {/* Highlight/Featured Toggle Button */}
      <button
        type="button"
        onClick={toggleHighlight}
        disabled={loading}
        title={
          featured
            ? "Proyek ini sedang di-highlight (Showcase Utama Terbesar). Klik untuk menonaktifkan."
            : "Jadikan proyek ini sebagai Highlight (Showcase Utama Terbesar di Portofolio)"
        }
        className={`p-1.5 rounded border transition-colors ${
          featured
            ? "border-amber-500/40 bg-amber-500/10 text-amber-400 hover:border-amber-500/70 shadow-sm"
            : "border-obsidian-border bg-obsidian-card/80 text-obsidian-subtext hover:text-amber-400 hover:border-amber-500/30"
        }`}
      >
        <Star
          className={`w-3.5 h-3.5 ${
            featured ? "fill-amber-400 text-amber-400" : ""
          }`}
        />
      </button>

      {/* Publish/Draft Toggle */}
      <button
        type="button"
        onClick={togglePublish}
        disabled={loading}
        title={published ? "Ubah ke Draft" : "Publikasikan"}
        className="p-1.5 rounded border border-obsidian-border hover:border-obsidian-border-focus text-obsidian-subtext hover:text-white bg-obsidian-card/80 transition-colors"
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : published ? (
          <EyeOff className="w-3.5 h-3.5 text-obsidian-subtext" />
        ) : (
          <Eye className="w-3.5 h-3.5 text-brand-emerald" />
        )}
      </button>

      {/* Edit Link */}
      <Link
        href={`/admin/projects/${targetId}/edit`}
        title="Edit blueprint proyek"
        className="p-1.5 rounded border border-obsidian-border hover:border-obsidian-border-focus text-obsidian-subtext hover:text-white bg-obsidian-card/80 transition-colors"
      >
        <Edit2 className="w-3.5 h-3.5 text-brand-cyan" />
      </Link>

      {/* Delete Button */}
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        title="Hapus proyek"
        className="p-1.5 rounded border border-obsidian-border hover:border-rose-500/50 text-obsidian-subtext hover:text-rose-400 bg-obsidian-card/80 transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
