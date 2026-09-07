"use client";

import React, { useState, useEffect } from "react";
import {
  Milestone,
  Clock,
  CheckCircle2,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Plus,
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
  Upload,
  Calendar,
  Layers,
  Sparkles,
  Terminal,
} from "lucide-react";
import ObsidianModal from "@/components/ObsidianModal";
import ObsidianToast, { ToastMessage } from "@/components/ObsidianToast";

interface CareerRecord {
  id: string;
  role: string;
  organization: string;
  location: string;
  period: string;
  type: "Internship" | "Contract" | "Full-time" | "Gov/Community";
  status: "Completed" | "Current";
  impactMetric?: string;
  description: string;
  technologies: string[];
  proofFileName?: string;
  isPublished?: boolean;
}

const INITIAL_RECORDS: CareerRecord[] = [
  {
    id: "1",
    role: "Software Development Intern",
    organization: "Diskominfo DIY",
    location: "Yogyakarta",
    period: "Feb 2024 – Jun 2024",
    type: "Internship",
    status: "Completed",
    impactMetric: "42% Query Latency Cut",
    description:
      "Engineered regional e-Government microservices, executed structured schema migration for legacy databases, and resolved index scan bottlenecks to lower overall query response times.",
    technologies: ["PostgreSQL", "Query Optimization", "API Gateways", "Linux / Systemd"],
    proofFileName: "Letter_Of_Completion.pdf",
  },
  {
    id: "2",
    role: "Lead Web Development & Deployment",
    organization: "Desa Ambalkliwonan",
    location: "Central Java",
    period: "Jul 2023 – Sep 2023",
    type: "Gov/Community",
    status: "Completed",
    impactMetric: "100% Digital Administrative Transition",
    description:
      "Spearheaded full digital migration of rural administrative governance, built RBAC security layers for civilian registries, and configured zero-downtime containerized production hosting.",
    technologies: ["Next.js", "Docker", "RBAC Security", "Tailwind CSS"],
    proofFileName: "Program_Certificate_Ambalkliwonan.pdf",
  },
  {
    id: "3",
    role: "Independent Systems Analyst & Backend Consultant",
    organization: "Enterprise Client Engagements",
    location: "Remote / Client Site",
    period: "Oct 2023 – Present",
    type: "Contract",
    status: "Current",
    impactMetric: "Architectural Rigor & Domain Modeling",
    description:
      "Authored exhaustive Software Requirements Specifications (SRS) and Class/Sequence diagrams for commercial applications, decoupled monolithic codebases, and formalized microservice foundations.",
    technologies: ["UML Standards", "SRS Blueprints", "API Architecture", "Domain-Driven Design"],
    proofFileName: "SRS_Template_Sample.pdf",
  },
];

export default function ManageExperiencePage() {
  const [records, setRecords] = useState<CareerRecord[]>(INITIAL_RECORDS);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CareerRecord | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    role: "",
    organization: "",
    location: "",
    startMonth: "",
    endMonth: "",
    period: "",
    type: "Internship" as "Internship" | "Contract" | "Full-time" | "Gov/Community",
    description: "",
    technologies: "",
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

  const handleDateChange = (start: string, end: string) => {
    const startText = formatMonthYear(start);
    const endText = formatMonthYear(end);
    let computed = "";
    if (startText && endText) {
      computed = `${startText} – ${endText}`;
    } else if (startText) {
      computed = startText;
    } else if (endText) {
      computed = endText;
    }
    setFormData((prev) => ({
      ...prev,
      startMonth: start,
      endMonth: end,
      period: computed,
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
      const cached = localStorage.getItem("portfolio_admin_experience");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const clean = parsed.map((item: CareerRecord) => ({
            ...item,
            status: "Completed" as const,
          }));
          setRecords(clean);
        }
      }
    } catch (e) {
      console.error("Local storage read error:", e);
    }

    fetch("/api/experience")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const clean = data.map((item: CareerRecord) => ({
            ...item,
            status: "Completed" as const,
          }));
          setRecords(clean);
          try {
            localStorage.setItem("portfolio_admin_experience", JSON.stringify(clean));
          } catch (e) {
            console.error(e);
          }
        }
      })
      .catch((err) => console.error("Error fetching /api/experience:", err));
  }, []);

  const persistRecords = (updatedList: CareerRecord[]) => {
    setRecords(updatedList);
    try {
      localStorage.setItem("portfolio_admin_experience", JSON.stringify(updatedList));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const updated = [...records];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    persistRecords(updated);
    addToast("info", "Linimasa Diatur Ulang", "Urutan posisi milestone berhasil digeser ke atas.");
    try {
      await fetch("/api/experience", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated[index - 1]),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === records.length - 1) return;
    const updated = [...records];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    persistRecords(updated);
    addToast("info", "Linimasa Diatur Ulang", "Urutan posisi milestone berhasil digeser ke bawah.");
    try {
      await fetch("/api/experience", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated[index + 1]),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleTogglePublish = async (record: CareerRecord) => {
    const updatedStatus = record.isPublished === false ? true : false;
    const updated = records.map((r) =>
      r.id === record.id ? { ...r, isPublished: updatedStatus } : r
    );
    persistRecords(updated);
    addToast(
      "info",
      updatedStatus ? "Milestone Ditampilkan" : "Milestone Disembunyikan",
      `${record.role} ${updatedStatus ? "aktif di beranda publik." : "disembunyikan dari beranda publik."}`
    );

    try {
      await fetch("/api/experience", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: record.id, isPublished: updatedStatus }),
      });
    } catch (err) {
      console.error("Failed to sync patch experience:", err);
    }
  };

  const handleDeleteRecord = async (id: string, role: string) => {
    const updated = records.filter((r) => r.id !== id);
    persistRecords(updated);
    addToast("error", "Milestone Removed", `${role} berhasil dihapus (Tersimpan Otomatis).`);

    try {
      await fetch(`/api/experience?id=${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to sync delete experience:", err);
    }
  };

  const handleUpdateRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord || !editingRecord.role || !editingRecord.organization) return;

    const recordToSave: CareerRecord = { ...editingRecord, status: "Completed" };
    const updated = records.map((r) => (r.id === editingRecord.id ? recordToSave : r));
    persistRecords(updated);
    addToast(
      "success",
      "Milestone Updated (Auto-Saved)",
      `${editingRecord.role} at ${editingRecord.organization} diperbarui.`
    );

    setEditingRecord(null);

    try {
      await fetch("/api/experience", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recordToSave),
      });
    } catch (err) {
      console.error("Failed to sync update experience:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.role || !formData.organization) return;

    const startText = formatMonthYear(formData.startMonth);
    const endText = formatMonthYear(formData.endMonth);
    let fallbackPeriod = "2025";
    if (startText && endText) {
      fallbackPeriod = `${startText} – ${endText}`;
    } else if (startText) {
      fallbackPeriod = startText;
    } else if (endText) {
      fallbackPeriod = endText;
    }

    const computedPeriod = formData.period.trim() || fallbackPeriod;

    const newRecord: CareerRecord = {
      id: Date.now().toString(),
      role: formData.role,
      organization: formData.organization,
      location: formData.location || "Yogyakarta / Remote",
      period: computedPeriod,
      type: formData.type,
      status: "Completed",
      impactMetric: "",
      description:
        formData.description ||
        "Architectural evaluation and deployment across mission-critical nodes.",
      technologies: formData.technologies
        ? formData.technologies.split(",").map((t) => t.trim()).filter(Boolean)
        : ["PostgreSQL", "Next.js", "Docker"],
      proofFileName: "Verified_Milestone_Proof.pdf",
      isPublished: true,
    };

    const updated = [newRecord, ...records];
    persistRecords(updated);

    setFormData({
      role: "",
      organization: "",
      location: "",
      startMonth: "",
      endMonth: "",
      period: "",
      type: "Internship",
      description: "",
      technologies: "",
    });

    addToast(
      "success",
      "Career Milestone Committed!",
      `${newRecord.role} at ${newRecord.organization} tersimpan otomatis.`
    );

    try {
      await fetch("/api/experience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecord),
      });
    } catch (err) {
      console.error("Failed to sync add experience:", err);
    }
  };

  return (
    <div className="space-y-8">
      <ObsidianToast toasts={toasts} onDismiss={removeToast} />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-[11px] text-obsidian-subtext">
            <span>PORTFOLIO TELEMETRY</span>
            <span>/</span>
            <span className="text-white">RECORDS ENGINE</span>
            <span>/</span>
            <span className="text-brand-emerald">Chronological Milestones</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Work Experience & Engagements
          </h1>
          <p className="text-xs text-obsidian-subtext font-mono">
            Manage chronological career records, milestones, quantifiable production impacts, and verified credential proofs.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto font-mono text-xs">
          <button
            onClick={() => setIsPreviewModalOpen(true)}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-obsidian-border bg-obsidian-card hover:bg-obsidian-highlight text-obsidian-text transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-brand-cyan" />
            <span>Preview Timeline View</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Timeline Feed (Left 7 cols) & Milestone Editor (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Timeline Feed */}
        <div className="lg:col-span-7 space-y-4 font-mono">
          <div className="flex items-center justify-between pb-2 border-b border-obsidian-border text-xs">
            <span className="text-white font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-emerald" />
              Timeline Feed ({records.length} Records)
            </span>
            <span className="text-[11px] text-obsidian-muted">
              Chronological (Desc)
            </span>
          </div>

          <div className="space-y-4">
            {records.map((item, index) => (
              <div
                key={item.id}
                className={`p-5 rounded-lg border bg-obsidian-canvas card-radial-glow space-y-3 transition-all text-xs ${
                  item.isPublished === false
                    ? "border-obsidian-border/50 opacity-60"
                    : "border-obsidian-border hover:border-obsidian-border-focus"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          item.isPublished === false
                            ? "bg-obsidian-muted"
                            : item.status === "Current"
                            ? "bg-brand-cyan"
                            : "bg-brand-emerald"
                        }`}
                      />
                      <h3 className="font-bold text-white text-sm">
                        {item.role}
                      </h3>
                      {item.isPublished === false && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-obsidian-card text-obsidian-muted border border-obsidian-border font-mono">
                          Hidden
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-obsidian-subtext">
                      <span className="text-brand-emerald">{item.organization}</span>{" "}
                      • {item.location} • {item.period}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] px-2 py-0.5 rounded font-mono font-semibold bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/30">
                      {item.type}
                    </span>

                    {/* Move Up / Down Reorder */}
                    <div className="flex items-center border border-obsidian-border rounded bg-obsidian-card">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveUp(index)}
                        className="p-1 text-obsidian-muted hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                        title="Geser milestone ke atas"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === records.length - 1}
                        onClick={() => handleMoveDown(index)}
                        className="p-1 text-obsidian-muted hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                        title="Geser milestone ke bawah"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Toggle Visibility */}
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(item)}
                      className={`p-1 rounded transition-colors ${
                        item.isPublished === false
                          ? "text-obsidian-muted hover:text-white"
                          : "text-brand-emerald hover:text-brand-emerald-dim"
                      }`}
                      title={item.isPublished === false ? "Tampilkan di beranda publik" : "Sembunyikan dari publik"}
                    >
                      {item.isPublished === false ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Edit Milestone */}
                    <button
                      type="button"
                      onClick={() => setEditingRecord(item)}
                      className="p-1 rounded text-obsidian-muted hover:text-brand-cyan transition-colors"
                      title="Edit milestone"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Milestone */}
                    <button
                      type="button"
                      onClick={() => handleDeleteRecord(item.id, item.role)}
                      className="p-1 rounded text-obsidian-muted hover:text-rose-400 transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Narrative / Description (Without Impact Metric banner) */}
                <div className="p-3 rounded-md bg-obsidian-void/70 border border-obsidian-border/70">
                  <p className="text-[11px] text-obsidian-subtext font-sans leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Tech Tags */}
                <div className="flex flex-wrap items-center gap-1 pt-1">
                  {item.technologies.map((tech, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded bg-obsidian-card border border-obsidian-border text-obsidian-text"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Milestone Editor Form */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-lg border border-obsidian-border bg-obsidian-canvas card-radial-glow space-y-4 sticky top-20 font-mono text-xs">
          <div className="space-y-1 pb-3 border-b border-obsidian-border">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-brand-emerald" />
                Milestone Editor
              </h3>
              <span className="text-[10px] text-brand-emerald bg-brand-emerald/10 px-2 py-0.5 rounded border border-brand-emerald/30">
                DRAFTING
              </span>
            </div>
            <p className="text-[11px] text-obsidian-subtext">
              Enter verifiable production metrics and system analysis track records.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] text-obsidian-subtext uppercase font-semibold mb-1">
                Job Title / Designation *
              </label>
              <input
                type="text"
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g. Lead Distributed Systems Engineer"
                className="w-full px-3 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] text-obsidian-subtext uppercase font-semibold mb-1">
                Organization / Institution *
              </label>
              <input
                type="text"
                required
                value={formData.organization}
                onChange={(e) =>
                  setFormData({ ...formData, organization: e.target.value })
                }
                placeholder="e.g. Diskominfo DIY / Enterprise Org"
                className="w-full px-3 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-obsidian-subtext uppercase font-semibold mb-1">
                  Engagement Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
                >
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract / Consultant</option>
                  <option value="Gov/Community">Gov / KKN Program</option>
                  <option value="Full-time">Full-time</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-obsidian-subtext uppercase font-semibold mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g. Yogyakarta / Remote"
                  className="w-full px-3 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] text-obsidian-subtext uppercase font-semibold">
                Engagement Duration (Calendar Selection) *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="block text-[10px] font-mono text-obsidian-muted mb-1">
                    Start Month
                  </span>
                  <div className="relative">
                    <input
                      type="month"
                      required
                      value={formData.startMonth}
                      onClick={(e) => {
                        try {
                          (e.target as any).showPicker?.();
                        } catch {}
                      }}
                      onChange={(e) =>
                        handleDateChange(e.target.value, formData.endMonth)
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
                    End Month
                  </span>
                  <div className="relative">
                    <input
                      type="month"
                      required
                      value={formData.endMonth}
                      onClick={(e) => {
                        try {
                          (e.target as any).showPicker?.();
                        } catch {}
                      }}
                      onChange={(e) =>
                        handleDateChange(formData.startMonth, e.target.value)
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
              </div>

              {/* Formatted Period Preview & Manual Overwrite */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-obsidian-subtext uppercase">
                    Tenure Period (Preview / Manual Edit)
                  </span>
                  {formData.period && (
                    <span className="text-[10px] font-mono text-brand-emerald truncate max-w-[180px]">
                      {formData.period}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={formData.period}
                  onChange={(e) =>
                    setFormData({ ...formData, period: e.target.value })
                  }
                  placeholder="e.g. Jan 2025 – Feb 2025"
                  className="w-full px-3 py-1.5 rounded-md border border-obsidian-border bg-obsidian-card text-white text-xs font-mono focus:outline-none focus:border-brand-emerald transition-colors"
                />
                <span className="block text-[10px] text-obsidian-muted mt-1">
                  Terisi otomatis dari kalender di atas, atau dapat diketik/diedit bebas secara fleksibel.
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-obsidian-subtext uppercase font-semibold mb-1">
                Key Responsibilities & Deliverables
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Engineered decoupled microservices, optimized legacy database schemas..."
                className="w-full px-3 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] text-obsidian-subtext uppercase font-semibold mb-1">
                Tech Stack (Comma delimited)
              </label>
              <input
                type="text"
                value={formData.technologies}
                onChange={(e) =>
                  setFormData({ ...formData, technologies: e.target.value })
                }
                placeholder="PostgreSQL, Next.js, Docker, UML"
                className="w-full px-3 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
              />
            </div>

            <div className="pt-3 border-t border-obsidian-border flex justify-end gap-2">
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    role: "",
                    organization: "",
                    location: "",
                    startMonth: "",
                    endMonth: "",
                    period: "",
                    type: "Internship",
                    description: "",
                    technologies: "",
                  })
                }
                className="px-3 py-2 rounded-md border border-obsidian-border bg-obsidian-void hover:bg-obsidian-highlight text-obsidian-subtext text-xs"
              >
                Discard
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-obsidian-text hover:bg-white text-obsidian-void font-bold text-xs transition-all shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Commit Record</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal: Preview Timeline View */}
      <ObsidianModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title="Public Timeline Preview"
        subtitle="Visual snapshot of chronological records as rendered on http://localhost:3000/#experience"
        maxWidth="xl"
      >
        <div className="space-y-6 font-mono text-xs">
          <div className="relative pl-6 border-l border-obsidian-border space-y-6">
            {records.map((rec) => (
              <div key={rec.id} className="relative">
                <span className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-obsidian-void border-2 border-brand-emerald ring-4 ring-obsidian-void" />
                <div className="p-4 rounded-md border border-obsidian-border bg-obsidian-card space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">
                      {rec.role} — {rec.organization}
                    </span>
                    <span className="text-[10px] text-brand-emerald bg-brand-emerald/10 px-2 py-0.5 rounded border border-brand-emerald/30">
                      {rec.period}
                    </span>
                  </div>
                  <p className="text-obsidian-subtext font-sans leading-relaxed text-xs">
                    {rec.description}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {rec.technologies.map((t, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-obsidian-void text-obsidian-subtext border border-obsidian-border"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-obsidian-border flex justify-end">
            <button
              onClick={() => setIsPreviewModalOpen(false)}
              type="button"
              className="px-4 py-2 rounded-md bg-obsidian-text text-obsidian-void font-bold text-xs"
            >
              Close Preview
            </button>
          </div>
        </div>
      </ObsidianModal>

      {/* Modal: Edit Milestone */}
      <ObsidianModal
        isOpen={Boolean(editingRecord)}
        onClose={() => setEditingRecord(null)}
        title="Edit Career Milestone"
        subtitle={`Update credentials & impact metrics for ${editingRecord?.role || ""}`}
        maxWidth="lg"
      >
        {editingRecord && (
          <form onSubmit={handleUpdateRecordSubmit} className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-obsidian-subtext uppercase font-semibold mb-1.5">
                  Designated Role / Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingRecord.role}
                  onChange={(e) => setEditingRecord({ ...editingRecord, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] text-obsidian-subtext uppercase font-semibold mb-1.5">
                  Host Organization *
                </label>
                <input
                  type="text"
                  required
                  value={editingRecord.organization}
                  onChange={(e) =>
                    setEditingRecord({ ...editingRecord, organization: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-obsidian-subtext uppercase font-semibold mb-1.5">
                  Location
                </label>
                <input
                  type="text"
                  value={editingRecord.location}
                  onChange={(e) =>
                    setEditingRecord({ ...editingRecord, location: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] text-obsidian-subtext uppercase font-semibold mb-1.5">
                  Tenure Period
                </label>
                <input
                  type="text"
                  value={editingRecord.period}
                  onChange={(e) =>
                    setEditingRecord({ ...editingRecord, period: e.target.value })
                  }
                  placeholder="e.g. Feb 2024 – Jun 2024"
                  className="w-full px-3 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] text-obsidian-subtext uppercase font-semibold mb-1.5">
                  Engagement Type
                </label>
                <select
                  value={editingRecord.type}
                  onChange={(e) =>
                    setEditingRecord({
                      ...editingRecord,
                      type: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
                >
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Gov/Community">Gov/Community</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-obsidian-subtext uppercase font-semibold mb-1.5">
                Portfolio Visibility
              </label>
              <select
                value={editingRecord.isPublished === false ? "hidden" : "published"}
                onChange={(e) =>
                  setEditingRecord({
                    ...editingRecord,
                    isPublished: e.target.value === "published",
                  })
                }
                className="w-full px-3 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
              >
                <option value="published">Published (Tampil di Beranda)</option>
                <option value="hidden">Hidden (Disembunyikan)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-obsidian-subtext uppercase font-semibold mb-1.5">
                Architectural Contribution & Narrative
              </label>
              <textarea
                rows={3}
                value={editingRecord.description}
                onChange={(e) =>
                  setEditingRecord({ ...editingRecord, description: e.target.value })
                }
                className="w-full px-3 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] text-obsidian-subtext uppercase font-semibold mb-1.5">
                Stack & Technologies (Comma-Separated)
              </label>
              <input
                type="text"
                value={editingRecord.technologies.join(", ")}
                onChange={(e) =>
                  setEditingRecord({
                    ...editingRecord,
                    technologies: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                  })
                }
                className="w-full px-3 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
              />
            </div>

            <div className="pt-4 border-t border-obsidian-border flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="px-4 py-2 rounded-md border border-obsidian-border bg-obsidian-card hover:bg-obsidian-highlight text-obsidian-text transition-colors text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-brand-cyan hover:bg-sky-400 text-obsidian-void font-bold text-xs transition-all shadow-sm"
              >
                Save Milestone Changes
              </button>
            </div>
          </form>
        )}
      </ObsidianModal>
    </div>
  );
}
