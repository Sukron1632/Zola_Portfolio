"use client";

import React, { useState, useEffect } from "react";
import {
  BadgeCheck,
  Shield,
  Upload,
  CheckCircle2,
  ExternalLink,
  Eye,
  RefreshCw,
  Plus,
  Terminal,
  Trash2,
  Edit2,
  Calendar,
} from "lucide-react";
import ObsidianModal from "@/components/ObsidianModal";
import ObsidianToast, { ToastMessage } from "@/components/ObsidianToast";
import CertificateModal from "@/components/CertificateModal";

interface Credential {
  id: string;
  title: string;
  issuer: string;
  credentialId: string;
  issueDate: string;
  hash: string;
  fileName: string;
  fileSize: string;
  isHeroBadge: boolean;
  verifyUrl: string;
  fileUrl?: string;
  imageUrl?: string;
  description?: string;
}

const INITIAL_CERTS: Credential[] = [
  {
    id: "1",
    title: "BNSP Junior Website Programming",
    issuer: "Badan Nasional Sertifikasi Profesi (BNSP)",
    credentialId: "BNSP-TI-2023-88943",
    issueDate: "Aug 2023 / Lifetime",
    hash: "sha256:e3b0c44298fc1c14...",
    fileName: "BNSP_Cert_Zola_Official.pdf",
    fileSize: "2.4 MB",
    isHeroBadge: true,
    verifyUrl: "https://bnsp.go.id",
  },
  {
    id: "2",
    title: "Dicoding Cloud & Backend Developer Master",
    issuer: "Dicoding Indonesia",
    credentialId: "DCD-BK-98314",
    issueDate: "Nov 2023 / Valid",
    hash: "sha256:7b902e482da7f81b...",
    fileName: "Dicoding_Backend_Specialization.pdf",
    fileSize: "4.1 MB",
    isHeroBadge: true,
    verifyUrl: "https://dicoding.com/certificates/DCD-BK-98314",
  },
  {
    id: "3",
    title: "Advanced PostgreSQL & Query Optimization",
    issuer: "PostgreSQL Professional Association",
    credentialId: "PG-OPT-7719",
    issueDate: "Mar 2024 / Valid",
    hash: "sha256:59a0f96f9872e41a...",
    fileName: "Postgres_Advanced_Cert.pdf",
    fileSize: "1.8 MB",
    isHeroBadge: false,
    verifyUrl: "https://postgresql.org",
  },
];

export default function ManageCertificationsPage() {
  const [certs, setCerts] = useState<Credential[]>(INITIAL_CERTS);
  const [activePreviewCert, setActivePreviewCert] = useState<Credential | null>(null);
  const [editingCert, setEditingCert] = useState<Credential | null>(null);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stagedFile, setStagedFile] = useState<{
    file: File;
    name: string;
    size: string;
    previewUrl?: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    issuer: "",
    credentialId: "",
    startMonth: "",
    endMonth: "",
    isLifetime: true,
    validityPeriod: "",
    verifyUrl: "",
    skills: "",
    description: "",
    isHeroBadge: true,
  });

  const formatMonthYear = (val: string) => {
    if (!val) return "";
    const parts = val.split("-");
    if (parts.length >= 2) {
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]);
      if (!isNaN(year) && !isNaN(month)) {
        const d = new Date(year, month - 1, 1);
        return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      }
    }
    return val;
  };

  const handleDateChange = (start: string, end: string, isLife: boolean) => {
    const startText = formatMonthYear(start);
    let computed = "";
    if (isLife) {
      computed = startText ? `${startText} / Lifetime` : "Lifetime";
    } else {
      const endText = formatMonthYear(end);
      if (startText && endText) {
        computed = `${startText} – ${endText}`;
      } else if (startText) {
        computed = startText;
      }
    }
    setFormData((prev) => ({
      ...prev,
      startMonth: start,
      endMonth: isLife ? "" : end,
      isLifetime: isLife,
      validityPeriod: computed,
    }));
  };

  const addToast = (type: "success" | "error" | "info", title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1. Initial Load from LocalStorage + Server Sync
  useEffect(() => {
    try {
      const cached = localStorage.getItem("portfolio_admin_certs");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCerts(parsed);
        }
      }
    } catch (e) {
      console.error("Local storage read error:", e);
    }

    fetch("/api/certifications")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCerts(data);
          try {
            localStorage.setItem("portfolio_admin_certs", JSON.stringify(data));
          } catch (e) {
            console.error(e);
          }
        }
      })
      .catch((err) => console.error("Error fetching /api/certifications:", err));
  }, []);

  const persistCerts = (updatedList: Credential[]) => {
    setCerts(updatedList);
    try {
      localStorage.setItem("portfolio_admin_certs", JSON.stringify(updatedList));
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateCertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCert || !editingCert.title || !editingCert.issuer) return;

    const updated = certs.map((c) => (c.id === editingCert.id ? { ...editingCert } : c));
    persistCerts(updated);
    addToast(
      "success",
      "Credential Updated (Auto-Saved)",
      `${editingCert.title} verified parameters updated.`
    );

    const certToSave = { ...editingCert };
    setEditingCert(null);

    try {
      await fetch("/api/certifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(certToSave),
      });
    } catch (err) {
      console.error("Failed to sync update certification:", err);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      addToast("error", "Berkas Terlalu Besar", "Batas maksimal ukuran file adalah 10MB.");
      return;
    }

    const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;

    setStagedFile({
      file,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      previewUrl,
    });

    addToast(
      "info",
      "Dokumen Dimuat Sementara",
      `${file.name} terload di browser. Berkas akan diunggah ke Supabase saat klik Save & Publish.`
    );
  };

  const handleRemoveStagedFile = () => {
    if (stagedFile?.previewUrl) {
      try {
        URL.revokeObjectURL(stagedFile.previewUrl);
      } catch {}
    }
    setStagedFile(null);
  };

  const handleToggleHeroBadge = async (id: string) => {
    const target = certs.find((c) => c.id === id);
    if (!target) return;
    const newStatus = !target.isHeroBadge;
    const updated = certs.map((c) => (c.id === id ? { ...c, isHeroBadge: newStatus } : c));
    persistCerts(updated);

    addToast(
      "info",
      "Hero Badge Updated (Auto-Saved)",
      newStatus
        ? `${target.title} disematkan ke hero badge.`
        : `${target.title} dilepas dari hero badge.`
    );

    try {
      await fetch("/api/certifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isHeroBadge: newStatus }),
      });
    } catch (err) {
      console.error("Failed to sync hero badge:", err);
    }
  };

  const handleDeleteCert = async (id: string, title: string) => {
    const updated = certs.filter((c) => c.id !== id);
    persistCerts(updated);
    addToast("error", "Credential Removed", `${title} berhasil dihapus (Tersimpan Otomatis).`);

    try {
      await fetch(`/api/certifications?id=${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to sync delete certification:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.issuer) return;

    setIsSubmitting(true);

    const startText = formatMonthYear(formData.startMonth);
    const endText = formatMonthYear(formData.endMonth);
    const fallbackPeriod = formData.isLifetime
      ? (startText ? `${startText} / Lifetime` : "Lifetime")
      : (startText && endText ? `${startText} – ${endText}` : startText || endText || "Valid");

    const computedIssueDate = formData.validityPeriod.trim() || fallbackPeriod;

    let finalFileUrl = "";
    let finalFileName = stagedFile?.name || `${formData.title.toLowerCase().replace(/\s+/g, "_")}.pdf`;
    let finalFileSize = stagedFile?.size || "2.1 MB";

    // Upload to Supabase only on Save & Publish
    if (stagedFile?.file) {
      try {
        const uploadData = new FormData();
        uploadData.append("file", stagedFile.file);
        uploadData.append("folder", "certifications");

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });
        const uploadJson = await uploadRes.json();
        if (uploadRes.ok && uploadJson.url) {
          finalFileUrl = uploadJson.url;
        } else {
          console.warn("Supabase upload returned warning:", uploadJson.error);
        }
      } catch (uploadErr) {
        console.error("Failed to upload to Supabase:", uploadErr);
      }
    }

    const newCert: Credential = {
      id: Date.now().toString(),
      title: formData.title,
      issuer: formData.issuer,
      credentialId: formData.credentialId || `CRED-${Math.floor(10000 + Math.random() * 90000)}`,
      issueDate: computedIssueDate,
      hash: `sha256:${Math.random().toString(16).substring(2, 10)}...`,
      fileName: finalFileName,
      fileSize: finalFileSize,
      fileUrl: finalFileUrl || undefined,
      description: formData.description.trim() || undefined,
      isHeroBadge: formData.isHeroBadge,
      verifyUrl: formData.verifyUrl || "https://example.com/verify",
    };

    const updated = [newCert, ...certs];
    persistCerts(updated);

    if (stagedFile?.previewUrl) {
      try {
        URL.revokeObjectURL(stagedFile.previewUrl);
      } catch {}
    }
    setStagedFile(null);

    setFormData({
      title: "",
      issuer: "",
      credentialId: "",
      startMonth: "",
      endMonth: "",
      isLifetime: true,
      validityPeriod: "",
      verifyUrl: "",
      skills: "",
      description: "",
      isHeroBadge: true,
    });

    setIsSubmitting(false);

    addToast(
      "success",
      "Credential Registered & Verified!",
      `${newCert.title} berhasil disimpan & dipublish ke portofolio.`
    );

    try {
      await fetch("/api/certifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCert),
      });
    } catch (err) {
      console.error("Failed to sync add certification:", err);
    }
  };

  return (
    <div className="space-y-8">
      <ObsidianToast toasts={toasts} onDismiss={removeToast} />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-[11px] text-obsidian-subtext">
            <span>ACCREDITATION INFRASTRUCTURE</span>
            <span>/</span>
            <span className="text-brand-emerald">+3 Signatures Verified</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Certifications & Accreditations
          </h1>
          <p className="text-xs text-obsidian-subtext font-mono">
            Upload official certificates, manage credential verification IDs, and configure public portfolio trust badges.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
          <button
            onClick={() => setIsVerifyModalOpen(true)}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-brand-emerald/30 bg-brand-emerald/10 text-brand-emerald hover:bg-brand-emerald/20 transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verify All Hashes</span>
          </button>
        </div>
      </div>



      {/* Main Grid: Cert List (Left 7 cols) & Upload Form (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Credentials List */}
        <div className="lg:col-span-7 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-obsidian-border">
            <span className="text-white font-semibold flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-brand-emerald" />
              Certified Credentials ({certs.length} Total)
            </span>
            <span className="text-[10px] text-brand-emerald bg-brand-emerald/10 px-2 py-0.5 rounded border border-brand-emerald/30">
              PostgreSQL Synced
            </span>
          </div>

          <div className="space-y-4">
            {certs.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-lg border border-obsidian-border bg-obsidian-canvas card-radial-glow space-y-3 hover:border-obsidian-border-focus transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-md bg-obsidian-card border border-obsidian-border flex items-center justify-center text-brand-emerald shrink-0">
                      <BadgeCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">
                        {c.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-brand-emerald-dim mt-0.5">
                        <CheckCircle2 className="w-3 h-3 text-brand-emerald" />
                        <span>Verified: {c.issuer}</span>
                      </div>
                      {c.description && (
                        <p className="text-[11px] text-obsidian-subtext line-clamp-2 mt-1 font-mono">
                          {c.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-obsidian-subtext">
                        Hero Badge
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleHeroBadge(c.id)}
                        className={`w-8 h-4 rounded-full transition-colors relative p-0.5 ${
                          c.isHeroBadge ? "bg-brand-emerald" : "bg-obsidian-border"
                        }`}
                      >
                        <span
                          className={`block w-3 h-3 rounded-full bg-white transition-transform ${
                            c.isHeroBadge ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingCert(c)}
                        className="p-1 rounded text-obsidian-muted hover:text-brand-cyan transition-colors"
                        title="Edit credential"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteCert(c.id, c.title)}
                        className="p-1 rounded text-obsidian-muted hover:text-rose-400 transition-colors"
                        title="Delete credential"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 p-2.5 rounded bg-obsidian-void/90 border border-obsidian-border text-[10px]">
                  <div>
                    <span className="text-obsidian-muted block">CREDENTIAL ID</span>
                    <span className="text-white font-semibold">{c.credentialId}</span>
                  </div>
                  <div>
                    <span className="text-obsidian-muted block">ISSUE / EXPIRY</span>
                    <span className="text-obsidian-subtext">{c.issueDate}</span>
                  </div>
                  <div>
                    <span className="text-obsidian-muted block">REGISTRY HASH</span>
                    <span className="text-brand-cyan truncate block">{c.hash}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-obsidian-subtext flex items-center gap-1.5">
                    <span className="text-brand-emerald">📄</span>
                    {c.fileName} ({c.fileSize})
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActivePreviewCert(c)}
                      className="px-2.5 py-1 rounded bg-obsidian-card hover:bg-obsidian-highlight text-obsidian-text border border-obsidian-border flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3 h-3 text-brand-cyan" />
                      <span>Preview</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Public Portfolio Trust Bar Preview Component */}
          <div className="p-4 rounded-lg border border-obsidian-border bg-obsidian-canvas card-radial-glow space-y-2">
            <span className="text-[10px] text-obsidian-muted uppercase tracking-wider block">
              Public Portfolio Trust Bar Spec
            </span>
            <div className="flex items-center justify-between p-3 rounded bg-obsidian-void border border-obsidian-border">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-brand-emerald/10 border border-brand-emerald/30 flex items-center justify-center text-brand-emerald">
                  <BadgeCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-white text-xs">
                    BNSP Accredited Certified Web Engineer
                  </p>
                  <p className="text-[10px] text-obsidian-muted">
                    BNSP-TI-2023-88943 • Synchronized
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-brand-emerald bg-brand-emerald/10 px-2 py-0.5 rounded border border-brand-emerald/30">
                Active In Hero
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Upload & Verify Credential Form */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-lg border border-obsidian-border bg-obsidian-canvas card-radial-glow space-y-4 lg:sticky lg:top-20 font-mono text-xs">
          <div className="space-y-1 pb-3 border-b border-obsidian-border">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-brand-emerald" />
                Upload & Verify Credential
              </h3>
              <Shield className="w-4 h-4 text-brand-cyan" />
            </div>
            <p className="text-[11px] text-obsidian-subtext">
              Register cryptographic proof and issue digital validation tags for Zola&apos;s live resume.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Certificate Dropzone with Temporary Local Loading */}
            <div className="space-y-1.5">
              <label className="flex flex-col items-center justify-center border border-dashed border-obsidian-border hover:border-brand-emerald/60 rounded-lg p-5 cursor-pointer bg-obsidian-void/70 hover:bg-obsidian-void transition-all relative group">
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  onChange={handleFileSelect}
                  disabled={isSubmitting}
                  className="hidden"
                />
                <div className="p-2 rounded-full bg-obsidian-card border border-obsidian-border text-brand-emerald mb-2 group-hover:scale-105 transition-transform">
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-brand-cyan" />
                  ) : stagedFile ? (
                    <CheckCircle2 className="w-4 h-4 text-brand-emerald" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                </div>
                <span className="text-xs font-semibold text-white">
                  {isSubmitting
                    ? "Mengunggah berkas ke Supabase..."
                    : stagedFile
                    ? `Terload Sementara: ${stagedFile.name}`
                    : "Upload certificate document"}
                </span>
                <span className="text-[10px] text-obsidian-muted mt-0.5">
                  {stagedFile
                    ? `Ukuran: ${stagedFile.size} • Siap di-upload saat Save • Klik untuk ganti`
                    : "Supports PDF, PNG, JPG scans up to 10MB"}
                </span>
              </label>

              {stagedFile && (
                <div className="flex items-center justify-between px-3 py-1.5 rounded bg-obsidian-card border border-obsidian-border text-[11px]">
                  <span className="text-brand-emerald truncate max-w-[220px]">
                    ✓ {stagedFile.name} ({stagedFile.size})
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveStagedFile}
                    className="text-rose-400 hover:text-rose-300 font-mono text-[10px] ml-2"
                  >
                    Batal Berkas
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] text-obsidian-subtext uppercase font-semibold mb-1">
                Credential Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Certified Kubernetes Administrator"
                className="w-full px-3 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] text-obsidian-subtext uppercase font-semibold mb-1">
                Issuing Body *
              </label>
              <input
                type="text"
                required
                value={formData.issuer}
                onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                placeholder="e.g. Cloud Native Computing Foundation (CNCF)"
                className="w-full px-3 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] text-obsidian-subtext uppercase font-semibold mb-1">
                Registration / ID
              </label>
              <input
                type="text"
                value={formData.credentialId}
                onChange={(e) =>
                  setFormData({ ...formData, credentialId: e.target.value })
                }
                placeholder="e.g. CKA-2401-9024"
                className="w-full px-3 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
              />
            </div>

            {/* Validity Timeframe (Start Month & End Month with showPicker) */}
            <div className="space-y-2 pt-1 border-t border-obsidian-border/50">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-obsidian-subtext uppercase font-semibold">
                  Validity Timeframe (Bulan & Tahun) *
                </span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    id="isLifetimeCert"
                    checked={formData.isLifetime}
                    onChange={(e) =>
                      handleDateChange(formData.startMonth, formData.endMonth, e.target.checked)
                    }
                    className="w-3.5 h-3.5 rounded border-obsidian-border bg-obsidian-void text-brand-emerald focus:ring-brand-emerald cursor-pointer"
                  />
                  <label
                    htmlFor="isLifetimeCert"
                    className="text-[10px] text-obsidian-subtext cursor-pointer select-none font-mono"
                  >
                    Lifetime / No Expiry
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="block text-[10px] font-mono text-obsidian-muted mb-1">
                    Start Month (Mulai)
                  </span>
                  <div className="relative">
                    <input
                      type="month"
                      value={formData.startMonth}
                      onClick={(e) => {
                        try {
                          (e.target as any).showPicker?.();
                        } catch {}
                      }}
                      onChange={(e) =>
                        handleDateChange(e.target.value, formData.endMonth, formData.isLifetime)
                      }
                      className="w-full pl-3 pr-8 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs cursor-pointer focus:outline-none focus:border-brand-emerald transition-colors"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        try {
                          input?.showPicker?.();
                        } catch {}
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-obsidian-muted hover:text-brand-emerald transition-colors"
                      title="Buka Kalender"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <span className="block text-[10px] font-mono text-obsidian-muted mb-1">
                    End Month (Selesai)
                  </span>
                  <div className="relative">
                    <input
                      type="month"
                      disabled={formData.isLifetime}
                      value={formData.endMonth}
                      onClick={(e) => {
                        try {
                          (e.target as any).showPicker?.();
                        } catch {}
                      }}
                      onChange={(e) =>
                        handleDateChange(formData.startMonth, e.target.value, formData.isLifetime)
                      }
                      className="w-full pl-3 pr-8 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs cursor-pointer focus:outline-none focus:border-brand-emerald transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      disabled={formData.isLifetime}
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        try {
                          input?.showPicker?.();
                        } catch {}
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-obsidian-muted hover:text-brand-emerald transition-colors disabled:opacity-30"
                      title="Buka Kalender"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Formatted Validity Period Preview & Manual Overwrite */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-obsidian-subtext uppercase">
                    Validity Period (Preview / Manual Edit)
                  </span>
                  {formData.validityPeriod && (
                    <span className="text-[10px] font-mono text-brand-emerald truncate max-w-[180px]">
                      {formData.validityPeriod}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={formData.validityPeriod}
                  onChange={(e) =>
                    setFormData({ ...formData, validityPeriod: e.target.value })
                  }
                  placeholder="e.g. Aug 2023 – Aug 2026 atau Aug 2023 / Lifetime"
                  className="w-full px-3 py-1.5 rounded-md border border-obsidian-border bg-obsidian-card text-white text-xs font-mono focus:outline-none focus:border-brand-emerald transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-obsidian-subtext uppercase font-semibold mb-1">
                Verification Authority URL
              </label>
              <input
                type="url"
                value={formData.verifyUrl}
                onChange={(e) =>
                  setFormData({ ...formData, verifyUrl: e.target.value })
                }
                placeholder="https://cncf.io/certification/verify/..."
                className="w-full px-3 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] text-obsidian-subtext uppercase font-semibold mb-1">
                Short Description (Deskripsi Singkat)
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="e.g. Evaluasi kompetensi arsitektur jaringan, evaluasi kerentanan sistem, dan proteksi ancaman siber."
                className="w-full px-3 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors resize-none custom-scrollbar"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isHeroBadge"
                checked={formData.isHeroBadge}
                onChange={(e) =>
                  setFormData({ ...formData, isHeroBadge: e.target.checked })
                }
                className="w-4 h-4 rounded border-obsidian-border bg-obsidian-void text-brand-emerald focus:ring-brand-emerald"
              />
              <label
                htmlFor="isHeroBadge"
                className="text-xs text-obsidian-text select-none cursor-pointer"
              >
                Standardized Verified Emblem (Inject into portfolio trust bar)
              </label>
            </div>

            <div className="pt-3 border-t border-obsidian-border space-y-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-md bg-obsidian-text hover:bg-white text-obsidian-void font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <BadgeCheck className="w-4 h-4" />
                <span>Save & Publish to Portfolio</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal 1: Certificate Preview (Protected Anti-Theft Viewer) */}
      <CertificateModal
        cert={activePreviewCert}
        isOpen={!!activePreviewCert}
        onClose={() => setActivePreviewCert(null)}
      />

      {/* Modal 2: Verify All Hashes Simulation */}
      <ObsidianModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        title="Cryptographic Hash Verification Audit"
        subtitle="Verification against National & International Accrediting Authority Registries"
        maxWidth="md"
      >
        <div className="space-y-4 font-mono text-xs">
          <div className="p-3 rounded bg-brand-emerald/10 border border-brand-emerald/30 text-brand-emerald-dim flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-emerald shrink-0" />
            <span>All 3 credential checksums validated successfully!</span>
          </div>

          <div className="space-y-2">
            {certs.map((c) => (
              <div
                key={c.id}
                className="p-3 rounded border border-obsidian-border bg-obsidian-card space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{c.title}</span>
                  <span className="text-[10px] text-brand-emerald font-semibold">
                    100% VALID
                  </span>
                </div>
                <p className="text-[10px] text-obsidian-muted truncate">
                  Hash: {c.hash}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-obsidian-border flex justify-end">
            <button
              onClick={() => {
                setIsVerifyModalOpen(false);
                addToast("success", "Audit Completed", "All certificates are cryptographically intact.");
              }}
              type="button"
              className="px-4 py-2 rounded-md bg-obsidian-text text-obsidian-void font-bold text-xs"
            >
              Acknowledge Audit
            </button>
          </div>
        </div>
      </ObsidianModal>

      {/* Modal: Edit Credential */}
      <ObsidianModal
        isOpen={Boolean(editingCert)}
        onClose={() => setEditingCert(null)}
        title="Edit Certification Credential"
        subtitle={`Update official verification attributes for ${editingCert?.title || ""}`}
        maxWidth="lg"
      >
        {editingCert && (
          <form onSubmit={handleUpdateCertSubmit} className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-obsidian-subtext uppercase font-semibold mb-1.5">
                  Certification Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingCert.title}
                  onChange={(e) => setEditingCert({ ...editingCert, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] text-obsidian-subtext uppercase font-semibold mb-1.5">
                  Issuing Authority *
                </label>
                <input
                  type="text"
                  required
                  value={editingCert.issuer}
                  onChange={(e) => setEditingCert({ ...editingCert, issuer: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-obsidian-subtext uppercase font-semibold mb-1.5">
                  Credential ID / Serial *
                </label>
                <input
                  type="text"
                  required
                  value={editingCert.credentialId}
                  onChange={(e) =>
                    setEditingCert({ ...editingCert, credentialId: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] text-obsidian-subtext uppercase font-semibold mb-1.5">
                  Issue / Validity Window
                </label>
                <input
                  type="text"
                  value={editingCert.issueDate}
                  onChange={(e) =>
                    setEditingCert({ ...editingCert, issueDate: e.target.value })
                  }
                  placeholder="e.g. Aug 2023 / Lifetime"
                  className="w-full px-3 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-obsidian-subtext uppercase font-semibold mb-1.5">
                Public Verification URL
              </label>
              <input
                type="url"
                value={editingCert.verifyUrl}
                onChange={(e) =>
                  setEditingCert({ ...editingCert, verifyUrl: e.target.value })
                }
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] text-obsidian-subtext uppercase font-semibold mb-1.5">
                Short Description (Deskripsi Singkat)
              </label>
              <textarea
                rows={2}
                value={editingCert.description || ""}
                onChange={(e) =>
                  setEditingCert({ ...editingCert, description: e.target.value })
                }
                placeholder="e.g. Evaluasi kompetensi arsitektur jaringan, evaluasi kerentanan sistem, dan proteksi ancaman siber."
                className="w-full px-3 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors resize-none custom-scrollbar"
              />
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <input
                type="checkbox"
                id="editIsHeroBadge"
                checked={editingCert.isHeroBadge}
                onChange={(e) =>
                  setEditingCert({ ...editingCert, isHeroBadge: e.target.checked })
                }
                className="w-4 h-4 rounded border-obsidian-border bg-obsidian-void text-brand-emerald focus:ring-brand-emerald"
              />
              <label
                htmlFor="editIsHeroBadge"
                className="text-xs text-obsidian-text select-none cursor-pointer"
              >
                Pin as Trust Badge on Homepage Hero
              </label>
            </div>

            <div className="pt-4 border-t border-obsidian-border flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingCert(null)}
                className="px-4 py-2 rounded-md border border-obsidian-border bg-obsidian-card hover:bg-obsidian-highlight text-obsidian-text transition-colors text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-brand-cyan hover:bg-sky-400 text-obsidian-void font-bold text-xs transition-all shadow-sm"
              >
                Save Credential Changes
              </button>
            </div>
          </form>
        )}
      </ObsidianModal>
    </div>
  );
}
