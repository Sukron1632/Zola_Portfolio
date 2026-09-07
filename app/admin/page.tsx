import Link from "next/link";
import {
  MousePointerClick,
  FolderGit2,
  Database,
  Activity,
  Plus,
  ArrowUpRight,
  Shield,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Measure genuine database latency
  const dbStartTime = Date.now();

  let totalClicks = 0;
  let publishedProjectsCount = 0;
  let totalProjectsCount = 0;
  let projectsWithClicks: Array<{
    id: string;
    title: string;
    slug: string;
    isPublished: boolean;
    techStack: string[];
    _count?: { clickTracks: number };
  }> = [];
  let recentClicks: Array<{
    id: string;
    clickedAt: Date;
    country: string | null;
    project: { title: string; slug: string } | null;
  }> = [];
  let profile: { name?: string | null; location?: string | null } | null = null;

  try {
    const results = await Promise.all([
      prisma.clickTracker.count(),
      prisma.project.count({ where: { isPublished: true } }),
      prisma.project.count(),
      prisma.project.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { clickTracks: true },
          },
        },
      }),
      prisma.clickTracker.findMany({
        take: 6,
        orderBy: { clickedAt: "desc" },
        include: {
          project: {
            select: { title: true, slug: true },
          },
        },
      }),
      prisma.profile.findFirst({ where: { id: 1 } }),
    ]);

    totalClicks = results[0];
    publishedProjectsCount = results[1];
    totalProjectsCount = results[2];
    projectsWithClicks = results[3];
    recentClicks = results[4];
    profile = results[5];
  } catch (error) {
    console.error("Error loading admin dashboard telemetry:", error);
  }

  const dbPingMs = Date.now() - dbStartTime;

  // Calculate project click percentages
  const maxProjectClicks = Math.max(
    ...projectsWithClicks.map((p) => p._count?.clickTracks || 0),
    1
  );

  return (
    <div className="space-y-8 font-mono">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 font-sans">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-[11px] text-obsidian-subtext">
            <span>DASHBOARD</span>
            <span>/</span>
            <span className="text-white">TELEMETRY</span>
            <span>/</span>
            <span className="text-brand-emerald">PostgreSQL Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            System & Analytics Overview
          </h1>
          <p className="text-xs text-obsidian-subtext font-mono">
            Direct telemetry telemetry from Supabase PostgreSQL, project lifecycles, and database health.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto font-mono">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-obsidian-border bg-obsidian-card text-xs text-obsidian-subtext">
            <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" />
            <span>Database: {dbPingMs}ms</span>
          </div>
          <Link
            href="/admin/projects/create"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-obsidian-text hover:bg-white text-obsidian-void font-semibold text-xs transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </Link>
        </div>
      </div>

      {/* ========================================================= */}
      {/* REAL ADMINISTRATIVE KPI CARDS */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Click Events */}
        <div className="p-4 rounded-lg border border-obsidian-border bg-obsidian-canvas card-radial-glow space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-obsidian-subtext">
              Telemetry Events
            </span>
            <MousePointerClick className="w-4 h-4 text-brand-emerald" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-white">
              {totalClicks}
            </span>
            <span className="text-[10px] text-brand-emerald bg-brand-emerald/10 px-1.5 py-0.5 rounded border border-brand-emerald/30">
              Live Tracker
            </span>
          </div>
          <div className="pt-2 border-t border-obsidian-border/80 flex items-center justify-between text-[10px] text-obsidian-muted">
            <span>SendBeacon / Async</span>
            <span className="text-obsidian-text">Verified clicks</span>
          </div>
        </div>

        {/* Card 2: Published Projects */}
        <div className="p-4 rounded-lg border border-obsidian-border bg-obsidian-canvas card-radial-glow space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-obsidian-subtext">
              Published Projects
            </span>
            <FolderGit2 className="w-4 h-4 text-brand-cyan" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-white">
              {publishedProjectsCount}
              <span className="text-sm font-normal text-obsidian-muted">
                /{totalProjectsCount}
              </span>
            </span>
            <span className="text-[10px] text-brand-cyan bg-brand-cyan/10 px-1.5 py-0.5 rounded border border-brand-cyan/30">
              {totalProjectsCount > 0
                ? `${Math.round((publishedProjectsCount / totalProjectsCount) * 100)}% active`
                : "0%"}
            </span>
          </div>
          <div className="pt-2 border-t border-obsidian-border/80 flex items-center justify-between text-[10px] text-obsidian-muted">
            <span>Showcase Repositories</span>
            <span className="text-brand-cyan">Public Grid</span>
          </div>
        </div>

        {/* Card 3: Supabase Health */}
        <div className="p-4 rounded-lg border border-obsidian-border bg-obsidian-canvas card-radial-glow space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-obsidian-subtext">
              Database Latency
            </span>
            <Database className="w-4 h-4 text-brand-emerald" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-brand-emerald">
              {dbPingMs}ms
            </span>
            <span className="text-[10px] text-brand-emerald bg-brand-emerald/10 px-1.5 py-0.5 rounded border border-brand-emerald/30">
              Optimal
            </span>
          </div>
          <div className="pt-2 border-t border-obsidian-border/80 flex items-center justify-between text-[10px] text-obsidian-muted">
            <span>Supabase Pooler</span>
            <span className="text-obsidian-text">Port 6543 / SSL</span>
          </div>
        </div>

        {/* Card 4: Administrator Status */}
        <div className="p-4 rounded-lg border border-obsidian-border bg-obsidian-canvas card-radial-glow space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-obsidian-subtext">
              Profile Singleton
            </span>
            <Shield className="w-4 h-4 text-brand-cyan" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-bold text-white truncate max-w-[150px]">
              {profile?.name || "Zola Dimas"}
            </span>
            <span className="text-[10px] text-brand-emerald bg-brand-emerald/10 px-1.5 py-0.5 rounded border border-brand-emerald/30">
              Synced
            </span>
          </div>
          <div className="pt-2 border-t border-obsidian-border/80 flex items-center justify-between text-[10px] text-obsidian-muted truncate">
            <span>{profile?.location || "Yogyakarta, ID"}</span>
            <span className="text-brand-cyan">ID: #1</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* REAL TELEMETRY BREAKDOWN & EVENT STREAM */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Real Project Click Engagement Distribution */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-lg border border-obsidian-border bg-obsidian-canvas card-radial-glow space-y-4">
          <div className="flex items-center justify-between border-b border-obsidian-border pb-3">
            <div>
              <h2 className="text-sm font-semibold text-white font-sans">
                Project Telemetry Distribution
              </h2>
              <p className="text-[11px] text-obsidian-subtext">
                Real outbound click track distribution per architecture showcase
              </p>
            </div>
            <span className="text-[10px] text-brand-emerald bg-brand-emerald/10 px-2 py-0.5 rounded border border-brand-emerald/30">
              {projectsWithClicks.length} Projects Tracked
            </span>
          </div>

          {projectsWithClicks.length > 0 ? (
            <div className="space-y-4 pt-1">
              {projectsWithClicks.map((project) => {
                const count = project._count?.clickTracks || 0;
                const percentage = Math.round((count / maxProjectClicks) * 100);

                return (
                  <div key={project.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white font-medium truncate max-w-[280px]">
                        {project.title}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-brand-emerald font-bold">
                          {count} clicks
                        </span>
                        <span className="text-[10px] text-obsidian-muted">
                          ({project.isPublished ? "Published" : "Draft"})
                        </span>
                      </div>
                    </div>

                    {/* Proportional Progress Bar */}
                    <div className="h-2 w-full rounded-full bg-obsidian-card overflow-hidden border border-obsidian-border/60">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-emerald to-brand-cyan transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-obsidian-muted text-xs space-y-2">
              <FolderGit2 className="w-8 h-8 mx-auto text-obsidian-subtext opacity-50" />
              <p>No project repositories recorded in database yet.</p>
              <Link
                href="/admin/projects/create"
                className="text-brand-emerald hover:underline inline-block pt-1"
              >
                + Create First Project
              </Link>
            </div>
          )}

          <div className="pt-3 border-t border-obsidian-border flex items-center justify-between text-[11px] text-obsidian-subtext">
            <span>Pipeline: /api/track-click</span>
            <span className="text-brand-emerald">Atomic Counter Active</span>
          </div>
        </div>

        {/* Right Column: Live Telemetry Event Stream */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-lg border border-obsidian-border bg-obsidian-canvas card-radial-glow space-y-4">
          <div className="flex items-center justify-between border-b border-obsidian-border pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" />
              <h2 className="text-sm font-semibold text-white font-sans">
                Live Click Logs
              </h2>
            </div>
            <span className="text-[10px] text-obsidian-muted">
              Latest {recentClicks.length} Events
            </span>
          </div>

          <div className="space-y-3 divide-y divide-obsidian-border/50 text-xs">
            {recentClicks.length > 0 ? (
              recentClicks.map((click) => (
                <div key={click.id} className="pt-2.5 first:pt-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium truncate max-w-[200px]">
                      {click.project?.title || "Outbound Target"}
                    </span>
                    <span className="text-[10px] text-obsidian-muted">
                      {new Date(click.clickedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-obsidian-subtext">
                    <span className="text-brand-cyan">CLICK EVENT</span>
                    <span className="text-obsidian-text">
                      {click.country || "Verified Origin"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-obsidian-muted space-y-1.5">
                <Activity className="w-6 h-6 mx-auto text-obsidian-subtext opacity-50" />
                <p>Telemetry stream active.</p>
                <p className="text-[10px] text-obsidian-muted">
                  Clicks will appear here in real-time as visitors explore projects.
                </p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-obsidian-border flex items-center justify-between text-[10px] text-obsidian-muted">
            <span>SendBeacon Event Dispatch</span>
            <span className="text-brand-emerald">Zero-Locking Heuristic</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* QUICK REPOSITORY TABLE */}
      {/* ========================================================= */}
      <div className="p-5 sm:p-6 rounded-lg border border-obsidian-border bg-obsidian-canvas card-radial-glow space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-obsidian-border pb-3">
          <div>
            <h2 className="text-sm font-semibold text-white font-sans">
              Repository Registry
            </h2>
            <p className="text-[11px] text-obsidian-subtext">
              Direct overview of projects in Supabase PostgreSQL
            </p>
          </div>
          <Link
            href="/admin/projects"
            className="inline-flex items-center gap-1 text-xs text-brand-emerald hover:text-white transition-colors"
          >
            <span>Open Projects Manager</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-obsidian-border text-obsidian-muted">
                <th className="pb-3 font-medium">PROJECT TITLE</th>
                <th className="pb-3 font-medium">STATUS</th>
                <th className="pb-3 font-medium">CLICKS</th>
                <th className="pb-3 font-medium">TECH STACK</th>
                <th className="pb-3 font-medium text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-border/60">
              {projectsWithClicks.map((proj) => (
                <tr
                  key={proj.id}
                  className="hover:bg-obsidian-highlight/50 transition-colors"
                >
                  <td className="py-3 text-white font-medium">
                    <div>{proj.title}</div>
                    <div className="text-[10px] text-obsidian-muted">
                      /{proj.slug}
                    </div>
                  </td>
                  <td className="py-3">
                    {proj.isPublished ? (
                      <span className="px-2 py-0.5 rounded bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/30 text-[10px]">
                        Published
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-obsidian-card text-obsidian-subtext border border-obsidian-border text-[10px]">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-brand-emerald font-bold">
                    {proj._count?.clickTracks || 0}
                  </td>
                  <td className="py-3 text-obsidian-subtext">
                    {proj.techStack?.slice(0, 3).join(", ") || "Stack"}
                  </td>
                  <td className="py-3 text-right">
                    <Link
                      href={`/admin/projects/${proj.id}/edit`}
                      className="text-brand-cyan hover:underline"
                    >
                      Edit Blueprint
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
