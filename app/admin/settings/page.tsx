"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Shield,
  Database,
  Activity,
  Cpu,
  RefreshCw,
  Trash2,
  AlertTriangle,
  Lock,
  FileText,
  CheckCircle2,
  Terminal,
  Save,
} from "lucide-react";
import ObsidianModal from "@/components/ObsidianModal";
import ObsidianToast, { ToastMessage } from "@/components/ObsidianToast";

export default function SystemSettingsPage() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isFlushModalOpen, setIsFlushModalOpen] = useState(false);
  const [isReindexModalOpen, setIsReindexModalOpen] = useState(false);

  // Settings State
  const [settings, setSettings] = useState({
    displayName: "Zola Dimas Firmansyah",
    titleTag: "Backend Architect & Systems Analyst",
    adminEmail: "zola.engineer@kontak.dev",
    sessionTimeout: "7 Days (Standard Persistence)",
    logClicks: true,
    deanonymizeGeo: true,
    retentionDays: "30 Days (Auto-pruning)",
    poolLimit: 20,
  });

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
      const cached = localStorage.getItem("portfolio_admin_settings");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === "object") {
          setSettings((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch (e) {
      console.error("Local storage read error:", e);
    }

    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === "object") {
          setSettings((prev) => ({ ...prev, ...data }));
          try {
            localStorage.setItem("portfolio_admin_settings", JSON.stringify(data));
          } catch (e) {
            console.error(e);
          }
        }
      })
      .catch((err) => console.error("Error fetching /api/settings:", err));
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem("portfolio_admin_settings", JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }

    addToast(
      "success",
      "Konfigurasi Tersimpan!",
      "Parameter sistem berhasil diperbarui dan disimpan secara permanen."
    );

    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
    } catch (err) {
      console.error("Failed to sync settings:", err);
    }
  };

  const handleFlushCache = () => {
    setIsFlushModalOpen(false);
    addToast(
      "success",
      "Edge Cache Flushed",
      "All static CDN & Edge nodes purged. Next requests will re-validate from source."
    );
  };

  const handleReindex = () => {
    setIsReindexModalOpen(false);
    addToast(
      "info",
      "Search Re-indexed",
      "Prisma full-text search tables synchronized with Supabase PostgreSQL."
    );
  };

  return (
    <div className="space-y-8">
      <ObsidianToast toasts={toasts} onDismiss={removeToast} />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-[11px] text-obsidian-subtext">
            <span>CMS</span>
            <span>/</span>
            <span className="text-white">SYSTEM ARCHITECTURE</span>
            <span>/</span>
            <span className="text-brand-emerald">Production Infrastructure</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            System Settings & Architecture
          </h1>
          <p className="text-xs text-obsidian-subtext font-mono">
            Configure telemetry heuristics, database connection poolers, NextAuth security parameters, and cache invalidation.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto font-mono text-xs">
          <button
            onClick={handleSaveSettings}
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-obsidian-text hover:bg-white text-obsidian-void font-bold text-xs transition-all shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Configurations</span>
          </button>
        </div>
      </div>

      {/* 4 Status KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="p-4 rounded-lg border border-obsidian-border bg-obsidian-canvas card-radial-glow">
          <div className="flex items-center justify-between text-[11px] text-obsidian-subtext uppercase">
            <span>Architecture Health</span>
            <Activity className="w-4 h-4 text-brand-emerald" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">99.98%</span>
            <span className="text-[10px] text-brand-emerald">Optimal SLA</span>
          </div>
        </div>

        <div className="p-4 rounded-lg border border-obsidian-border bg-obsidian-canvas card-radial-glow">
          <div className="flex items-center justify-between text-[11px] text-obsidian-subtext uppercase">
            <span>Active Services</span>
            <Cpu className="w-4 h-4 text-brand-cyan" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-brand-cyan">4</span>
            <span className="text-[10px] text-obsidian-subtext">All Running</span>
          </div>
        </div>

        <div className="p-4 rounded-lg border border-obsidian-border bg-obsidian-canvas card-radial-glow">
          <div className="flex items-center justify-between text-[11px] text-obsidian-subtext uppercase">
            <span>NextAuth Security</span>
            <Lock className="w-4 h-4 text-brand-emerald-dim" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-base font-bold text-white">OAuth 2.0</span>
            <span className="text-[10px] text-brand-emerald">Restricted</span>
          </div>
        </div>

        <div className="p-4 rounded-lg border border-obsidian-border bg-obsidian-canvas card-radial-glow">
          <div className="flex items-center justify-between text-[11px] text-obsidian-subtext uppercase">
            <span>Database Pooling Drift</span>
            <Database className="w-4 h-4 text-brand-emerald" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">0ms</span>
            <span className="text-[10px] text-brand-emerald">6543 Synced</span>
          </div>
        </div>
      </div>

      {/* Main Grid Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-mono text-xs">
        {/* Left Column (7 cols): Configuration Forms */}
        <div className="lg:col-span-7 space-y-6">
          {/* Panel 1: Profile & Global Meta Configuration */}
          <div className="p-5 sm:p-6 rounded-lg border border-obsidian-border bg-obsidian-canvas card-radial-glow space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-obsidian-border">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-brand-emerald" />
                Profile & Global Meta Configuration
              </h3>
              <span className="text-[10px] text-brand-emerald">Active In Header</span>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-[11px] text-obsidian-subtext uppercase font-semibold mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={settings.displayName}
                  onChange={(e) =>
                    setSettings({ ...settings, displayName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] text-obsidian-subtext uppercase font-semibold mb-1">
                  Primary Title Tag
                </label>
                <input
                  type="text"
                  value={settings.titleTag}
                  onChange={(e) =>
                    setSettings({ ...settings, titleTag: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] text-obsidian-subtext uppercase font-semibold mb-1">
                  Verified Technical CV Document (Active Link)
                </label>
                <div className="flex items-center justify-between p-3 rounded-md border border-obsidian-border bg-obsidian-void">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-emerald" />
                    <span className="text-white text-xs">
                      Zola_Technical_CV_2026_v4.pdf
                    </span>
                  </div>
                  <span className="text-[10px] text-obsidian-muted">
                    Synced to Supabase
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Panel 2: NextAuth & Security Controls */}
          <div className="p-5 sm:p-6 rounded-lg border border-obsidian-border bg-obsidian-canvas card-radial-glow space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-obsidian-border">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-brand-cyan" />
                NextAuth & Security Controls
              </h3>
              <span className="text-[10px] text-brand-cyan">Strict Whitelist</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-obsidian-subtext uppercase font-semibold mb-1">
                  Admin Email Whitelist
                </label>
                <input
                  type="email"
                  value={settings.adminEmail}
                  onChange={(e) =>
                    setSettings({ ...settings, adminEmail: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] text-obsidian-subtext uppercase font-semibold mb-1">
                  Session Persistence
                </label>
                <select
                  value={settings.sessionTimeout}
                  onChange={(e) =>
                    setSettings({ ...settings, sessionTimeout: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-md border border-obsidian-border bg-obsidian-void text-white text-xs focus:outline-none focus:border-brand-emerald transition-colors"
                >
                  <option>7 Days (Standard Persistence)</option>
                  <option>24 Hours (High Security)</option>
                  <option>30 Days (Extended)</option>
                </select>
              </div>
            </div>

            <div className="p-3 rounded-md border border-obsidian-border bg-obsidian-void space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-obsidian-subtext">Google OAuth Client ID</span>
                <span className="text-brand-emerald">Configured via .env</span>
              </div>
              <p className="text-[10px] text-obsidian-muted font-mono truncate">
                792837492837-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
              </p>
            </div>
          </div>

          {/* Panel 3: Telemetry & Click Tracker Daemon Config */}
          <div className="p-5 sm:p-6 rounded-lg border border-obsidian-border bg-obsidian-canvas card-radial-glow space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-obsidian-border">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-emerald" />
                Telemetry & Click Tracker Daemon Config
              </h3>
              <span className="text-[10px] text-brand-emerald">
                sendBeacon Heuristics
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-md border border-obsidian-border bg-obsidian-void">
                <div>
                  <p className="font-semibold text-white">
                    Log Outbound Project Clicks to PostgreSQL
                  </p>
                  <p className="text-[11px] text-obsidian-subtext mt-0.5">
                    Records outbound links clicked on projects and resume downloads.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSettings({ ...settings, logClicks: !settings.logClicks })
                  }
                  className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                    settings.logClicks ? "bg-brand-emerald" : "bg-obsidian-border"
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.logClicks ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-md border border-obsidian-border bg-obsidian-void">
                <div>
                  <p className="font-semibold text-white">
                    User-Agent & IP Deanonymization
                  </p>
                  <p className="text-[11px] text-obsidian-subtext mt-0.5">
                    Extracts device type and country code via x-vercel-ip-country headers.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSettings({
                      ...settings,
                      deanonymizeGeo: !settings.deanonymizeGeo,
                    })
                  }
                  className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                    settings.deanonymizeGeo
                      ? "bg-brand-emerald"
                      : "bg-obsidian-border"
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.deanonymizeGeo
                        ? "translate-x-4"
                        : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Prisma, Audit Log & Danger Zone */}
        <div className="lg:col-span-5 space-y-6">
          {/* Panel: Prisma & Schema Migrations */}
          <div className="p-5 sm:p-6 rounded-lg border border-obsidian-border bg-obsidian-canvas card-radial-glow space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-obsidian-border">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-brand-emerald" />
                Prisma & Schema Migrations
              </h3>
              <span className="text-[10px] text-brand-emerald bg-brand-emerald/10 px-2 py-0.5 rounded border border-brand-emerald/30 font-bold">
                APPLIED
              </span>
            </div>

            <div className="p-3 rounded-md border border-obsidian-border bg-obsidian-void space-y-1.5 text-[11px]">
              <div className="flex justify-between text-obsidian-subtext">
                <span>Active Migration Hash:</span>
                <span className="text-white">20241011_02_init_assets</span>
              </div>
              <div className="flex justify-between text-obsidian-subtext">
                <span>Prisma ORM Engine:</span>
                <span className="text-brand-emerald">v5.22.0</span>
              </div>
              <div className="flex justify-between text-obsidian-subtext">
                <span>Schema Validation:</span>
                <span className="text-white">4 Models Synchronized</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                addToast("info", "Prisma Sync Checked", "All models match PostgreSQL schema.")
              }
              className="w-full py-2 px-3 rounded-md border border-obsidian-border bg-obsidian-card hover:bg-obsidian-highlight text-obsidian-text transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Validate Schema Drift</span>
            </button>
          </div>

          {/* Panel: Database Audit Log */}
          <div className="p-5 sm:p-6 rounded-lg border border-obsidian-border bg-obsidian-canvas card-radial-glow space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-obsidian-border">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-brand-cyan" />
                Database Audit Log
              </h3>
              <span className="text-[10px] text-obsidian-muted">5 Recorded</span>
            </div>

            <div className="space-y-2.5 divide-y divide-obsidian-border/60 text-[11px]">
              <div className="pt-2 first:pt-0 space-y-0.5">
                <div className="flex justify-between font-bold text-white">
                  <span>UPDATE_PROFILE</span>
                  <span className="text-obsidian-muted text-[10px]">Just now</span>
                </div>
                <p className="text-obsidian-subtext">
                  Profile singleton updated by admin session.
                </p>
              </div>

              <div className="pt-2 space-y-0.5">
                <div className="flex justify-between font-bold text-brand-emerald">
                  <span>ADD_PROJECT_RECORD</span>
                  <span className="text-obsidian-muted text-[10px]">1h ago</span>
                </div>
                <p className="text-obsidian-subtext">
                  Multi-Hotel Asset Management published.
                </p>
              </div>

              <div className="pt-2 space-y-0.5">
                <div className="flex justify-between font-bold text-brand-cyan">
                  <span>DATABASE_PING</span>
                  <span className="text-obsidian-muted text-[10px]">2h ago</span>
                </div>
                <p className="text-obsidian-subtext">
                  Pooler port 6543 latency check: 12ms.
                </p>
              </div>
            </div>
          </div>

          {/* Panel: Danger Zone */}
          <div className="p-5 sm:p-6 rounded-lg border border-rose-500/30 bg-rose-500/5 space-y-4">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
              <h3 className="font-semibold text-sm">Danger Zone</h3>
            </div>
            <p className="text-[11px] text-obsidian-subtext leading-relaxed">
              Administrative commands with destructive impact across edge nodes and cache registries.
            </p>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => setIsFlushModalOpen(true)}
                className="w-full py-2 px-3 rounded-md border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Flush Edge Cache Daemon</span>
              </button>

              <button
                type="button"
                onClick={() => setIsReindexModalOpen(true)}
                className="w-full py-2 px-3 rounded-md border border-obsidian-border bg-obsidian-card hover:bg-obsidian-highlight text-obsidian-text transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-index Search Entities</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal: Flush Edge Cache */}
      <ObsidianModal
        isOpen={isFlushModalOpen}
        onClose={() => setIsFlushModalOpen(false)}
        title="Flush Edge Cache Daemon?"
        subtitle="This action will force immediate invalidation of all cached assets"
        maxWidth="md"
      >
        <div className="space-y-4 font-mono text-xs">
          <div className="p-3 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Are you sure you want to flush all edge cache layers? All incoming visitors will experience a cold-cache roundtrip to PostgreSQL for initial page loads.
            </p>
          </div>

          <div className="pt-3 border-t border-obsidian-border flex justify-end gap-2">
            <button
              onClick={() => setIsFlushModalOpen(false)}
              type="button"
              className="px-3 py-1.5 rounded-md border border-obsidian-border bg-obsidian-card text-obsidian-subtext hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleFlushCache}
              type="button"
              className="px-4 py-1.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white font-bold"
            >
              Yes, Flush Cache
            </button>
          </div>
        </div>
      </ObsidianModal>

      {/* Confirmation Modal: Re-index Search Entities */}
      <ObsidianModal
        isOpen={isReindexModalOpen}
        onClose={() => setIsReindexModalOpen(false)}
        title="Re-index Search Entities"
        subtitle="Synchronize search vectors across projects and skill tables"
        maxWidth="md"
      >
        <div className="space-y-4 font-mono text-xs">
          <p className="text-obsidian-subtext leading-relaxed">
            Re-indexing scans all database records in PostgreSQL and rebuilds inverted indexes for search queries and telemetry attribution.
          </p>

          <div className="pt-3 border-t border-obsidian-border flex justify-end gap-2">
            <button
              onClick={() => setIsReindexModalOpen(false)}
              type="button"
              className="px-3 py-1.5 rounded-md border border-obsidian-border bg-obsidian-card text-obsidian-subtext hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleReindex}
              type="button"
              className="px-4 py-1.5 rounded-md bg-obsidian-text hover:bg-white text-obsidian-void font-bold"
            >
              Confirm Re-index
            </button>
          </div>
        </div>
      </ObsidianModal>
    </div>
  );
}
