"use client";

import { useEffect, useState, useRef } from "react";
import {
  Save,
  Loader2,
  CheckCircle2,
  UserCog,
  Terminal,
  Upload,
  Image as ImageIcon,
  FileText,
  Trash2,
  ExternalLink,
  MapPin,
  Sparkles,
} from "lucide-react";

export default function AdminProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "Zola Dimas Firmansyah",
    avatarUrl: "",
    location: "Yogyakarta, Indonesia",
    heroTitle: "Systems Architect & Backend Engineer",
    heroSubtitle: "Specializing in Distributed Systems, UML Modeling, and PostgreSQL Optimization",
    aboutText:
      "Information Systems specialist with deep focus on enterprise backend architectures, PostgreSQL query optimization (42% latency reduction during Diskominfo DIY tenure), UML system analysis, and reliable REST/gRPC API gateways.",
    emailContact: "zoladimas32@gmail.com",
    githubUrl: "https://github.com/zoladimas",
    linkedinUrl: "https://linkedin.com/in/zoladimas",
    resumeUrl: "/cv-zola-dimas.pdf",
  });

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setFormData({
            name: data.name || "Zola Dimas Firmansyah",
            avatarUrl: data.avatarUrl || "",
            location: data.location || "Yogyakarta, Indonesia",
            heroTitle: data.heroTitle || "Systems Architect & Backend Engineer",
            heroSubtitle: data.heroSubtitle || "Specializing in Distributed Systems, UML Modeling, and PostgreSQL Optimization",
            aboutText: data.aboutText || "",
            emailContact: data.emailContact || "zoladimas32@gmail.com",
            githubUrl: data.githubUrl || "https://github.com/zoladimas",
            linkedinUrl: data.linkedinUrl || "https://linkedin.com/in/zoladimas",
            resumeUrl: data.resumeUrl || "",
          });
        }
      })
      .catch((err) => {
        console.error("Gagal mengambil profile:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Upload Avatar Image to Supabase Storage
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setError(null);

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("folder", "avatars");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      const text = await res.text();
      let result: any = {};
      try {
        result = JSON.parse(text);
      } catch {
        throw new Error(`Respon server tidak valid (${res.status} ${res.statusText})`);
      }

      if (!res.ok) {
        throw new Error(result.error || `Gagal mengunggah foto avatar (${res.status}).`);
      }

      setFormData((prev) => ({ ...prev, avatarUrl: result.url }));
    } catch (err: any) {
      setError(err.message || "Gagal upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Upload Resume PDF Document to Supabase Storage
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingResume(true);
    setError(null);

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("folder", "documents");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      const text = await res.text();
      let result: any = {};
      try {
        result = JSON.parse(text);
      } catch {
        throw new Error(`Respon server tidak valid (${res.status} ${res.statusText})`);
      }

      if (!res.ok) {
        throw new Error(result.error || `Gagal mengunggah dokumen resume/CV (${res.status}).`);
      }

      setFormData((prev) => ({ ...prev, resumeUrl: result.url }));
    } catch (err: any) {
      setError(err.message || "Gagal upload resume");
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const text = await res.text();
      let resData: any = {};
      try {
        resData = JSON.parse(text);
      } catch {
        throw new Error(`Respon server tidak valid (${res.status} ${res.statusText}). Kemungkinan timeout database.`);
      }

      if (!res.ok) {
        throw new Error(resData.error || `Gagal memperbarui profil (Status: ${res.status})`);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat menyimpan profil");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 font-mono text-[11px] text-obsidian-subtext">
          <span>CMS</span>
          <span>/</span>
          <span className="text-white">SETTINGS</span>
          <span>/</span>
          <span className="text-brand-emerald">Biodata & Profile Registry</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-emerald/10 border border-brand-emerald/30 flex items-center justify-center text-brand-emerald">
            <UserCog className="w-4 h-4" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Profile & Biodata Management
          </h1>
        </div>
        <p className="text-xs text-obsidian-subtext font-mono">
          Kelola foto profil avatar, data diri, headline arsitektur, dan tautan dokumen resume terverifikasi.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-lg border border-brand-emerald/40 bg-brand-emerald/10 text-brand-emerald text-xs font-mono flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-brand-emerald" />
          <div>
            <p className="font-semibold">Konfigurasi Profil Berhasil Disimpan!</p>
            <p className="text-[11px] text-brand-emerald/80">
              Data biodata, foto avatar, dan dokumen resume telah tersinkronisasi langsung ke database PostgreSQL Supabase.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg border border-red-500/40 bg-red-500/10 text-red-400 text-xs font-mono">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ========================================================= */}
        {/* MEDIA UPLOAD SECTION (AVATAR & RESUME PDF) */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Avatar Photo Card */}
          <div className="p-5 rounded-xl border border-obsidian-border bg-obsidian-canvas card-radial-glow space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-white flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-brand-emerald" />
                <span>Foto Avatar Profil</span>
              </span>
              <span className="text-[10px] font-mono text-obsidian-muted">Supabase Storage</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-full border-2 border-brand-emerald/40 bg-obsidian-void overflow-hidden flex items-center justify-center shrink-0">
                {formData.avatarUrl ? (
                  <img
                    src={formData.avatarUrl}
                    alt={formData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-xl font-bold font-mono text-brand-emerald">
                    {formData.name.charAt(0)}
                  </div>
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-brand-emerald animate-spin" />
                  </div>
                )}
              </div>

              <div className="space-y-2 flex-1">
                <input
                  type="file"
                  ref={avatarInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-obsidian-border hover:border-brand-emerald bg-obsidian-card text-obsidian-text hover:text-white text-xs font-mono transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{formData.avatarUrl ? "Ganti Foto" : "Unggah Foto Profil"}</span>
                </button>
                {formData.avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, avatarUrl: "" }))}
                    className="block text-[10px] text-red-400 hover:text-red-300 font-mono"
                  >
                    Hapus Foto Avatar
                  </button>
                )}
                <p className="text-[10px] text-obsidian-muted leading-tight">
                  Format: JPG, PNG, WEBP. Ditampilkan di hero banner dan kartu admin.
                </p>
              </div>
            </div>
          </div>

          {/* Resume PDF Document Card */}
          <div className="p-5 rounded-xl border border-obsidian-border bg-obsidian-canvas card-radial-glow space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-white flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-brand-cyan" />
                <span>Dokumen CV / Resume (PDF)</span>
              </span>
              <span className="text-[10px] font-mono text-obsidian-muted">Public Asset</span>
            </div>

            <div className="space-y-3">
              {formData.resumeUrl ? (
                <div className="p-3 rounded-lg border border-brand-cyan/30 bg-brand-cyan/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <FileText className="w-4 h-4 text-brand-cyan shrink-0" />
                    <span className="font-mono text-xs text-white truncate">
                      {formData.resumeUrl.split("/").pop() || "Document.pdf"}
                    </span>
                  </div>
                  <a
                    href={formData.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-cyan hover:text-white p-1"
                    title="Buka Dokumen"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <div className="p-3 rounded-lg border border-dashed border-obsidian-border text-center text-xs text-obsidian-muted font-mono">
                  Belum ada dokumen resume PDF diunggah
                </div>
              )}

              <input
                type="file"
                ref={resumeInputRef}
                onChange={handleResumeUpload}
                accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => resumeInputRef.current?.click()}
                disabled={uploadingResume}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md border border-obsidian-border hover:border-brand-cyan bg-obsidian-card text-obsidian-text hover:text-white text-xs font-mono transition-all cursor-pointer"
              >
                {uploadingResume ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-cyan" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>{formData.resumeUrl ? "Unggah Dokumen Baru (Replace)" : "Unggah File CV / Resume (PDF)"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BIODATA & IDENTITY FIELDS */}
        {/* ========================================================= */}
        <div className="p-6 rounded-xl border border-obsidian-border bg-obsidian-canvas card-radial-glow space-y-6">
          <h2 className="text-sm font-semibold text-white tracking-tight uppercase font-mono border-b border-obsidian-border pb-3">
            Identitas & Detail Biodata
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-obsidian-subtext">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-obsidian-text focus:outline-none focus:border-brand-emerald text-sm transition-colors"
                placeholder="Zola Dimas Firmansyah"
              />
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-obsidian-subtext">
                Domisili / Lokasi
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3.5 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-obsidian-text focus:outline-none focus:border-brand-emerald text-sm transition-colors"
                placeholder="Yogyakarta, Indonesia"
              />
            </div>

            {/* Hero Headline */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-xs font-mono text-obsidian-subtext">
                Hero Headline Title
              </label>
              <input
                type="text"
                required
                value={formData.heroTitle}
                onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                className="w-full px-3.5 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-obsidian-text focus:outline-none focus:border-brand-emerald text-sm transition-colors"
                placeholder="Systems Architect & Backend Engineer"
              />
            </div>

            {/* Hero Subtitle */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-xs font-mono text-obsidian-subtext">
                Spesialisasi / Domain Focus
              </label>
              <input
                type="text"
                required
                value={formData.heroSubtitle}
                onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                className="w-full px-3.5 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-obsidian-text focus:outline-none focus:border-brand-emerald text-sm transition-colors"
                placeholder="Specializing in Distributed Systems, UML Modeling, and PostgreSQL Optimization"
              />
            </div>

            {/* About Text (Bio) */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-xs font-mono text-obsidian-subtext">
                Deskripsi Bio / Career Narrative (Tentang Saya)
              </label>
              <textarea
                rows={5}
                required
                value={formData.aboutText}
                onChange={(e) => setFormData({ ...formData, aboutText: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-md border border-obsidian-border bg-obsidian-void text-obsidian-text focus:outline-none focus:border-brand-emerald text-sm transition-colors leading-relaxed font-sans"
                placeholder="Deskripsi latar belakang, keahlian arsitektur, dan pencapaian..."
              />
            </div>

            {/* Email Contact */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-obsidian-subtext">
                Email Kontak Utama
              </label>
              <input
                type="email"
                required
                value={formData.emailContact}
                onChange={(e) => setFormData({ ...formData, emailContact: e.target.value })}
                className="w-full px-3.5 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-obsidian-text focus:outline-none focus:border-brand-emerald text-sm transition-colors font-mono"
                placeholder="zoladimas32@gmail.com"
              />
            </div>

            {/* GitHub URL */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-obsidian-subtext">
                Tautan Profil GitHub
              </label>
              <input
                type="url"
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                className="w-full px-3.5 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-obsidian-text focus:outline-none focus:border-brand-emerald text-sm transition-colors font-mono"
                placeholder="https://github.com/zoladimas"
              />
            </div>

            {/* LinkedIn URL */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-xs font-mono text-obsidian-subtext">
                Tautan Profil LinkedIn
              </label>
              <input
                type="url"
                value={formData.linkedinUrl}
                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                className="w-full px-3.5 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-obsidian-text focus:outline-none focus:border-brand-emerald text-sm transition-colors font-mono"
                placeholder="https://linkedin.com/in/zoladimas"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-obsidian-border flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto justify-center inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-white hover:bg-neutral-200 text-obsidian-void font-semibold text-xs tracking-tight transition-all shadow-md disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-obsidian-void" />
                  <span>Menyinkronkan ke Database...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-obsidian-void" />
                  <span>Save Profile Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
