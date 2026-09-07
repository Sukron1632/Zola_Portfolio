import React from "react";
import Link from "next/link";
import {
  Plus,
  FolderGit2,
  MousePointerClick,
  Layers,
  Star,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import ProjectActionButtons from "@/components/ProjectActionButtons";

export const dynamic = "force-dynamic";

export default async function AdminProjectsListPage() {
  let projects: Array<{
    id: string;
    title: string;
    slug: string;
    badge?: string | null;
    thumbnail: string | null;
    isFeatured: boolean;
    isPublished: boolean;
    techStack: string[];
    _count?: { clickTracks: number };
  }> = [];

  try {
    projects = await prisma.project.findMany({
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      include: {
        _count: {
          select: { clickTracks: true },
        },
      },
    });
  } catch (error) {
    console.error("Error loading admin projects list:", error);
  }

  const publishedCount = projects.filter((p) => p.isPublished).length;
  const draftCount = projects.filter((p) => !p.isPublished).length;

  return (
    <div className="space-y-8">
      {/* Header & New Project CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-[11px] text-obsidian-subtext">
            <span>CMS</span>
            <span>/</span>
            <span className="text-white">PROJECTS</span>
            <span>/</span>
            <span className="text-brand-cyan">Repository Manager</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Projects Management
          </h1>
          <p className="text-xs text-obsidian-subtext">
            Manage production showcases, telemetry tracked link clicks, and repository integrations with instant synchronized updates.
          </p>
        </div>

        <Link
          href="/admin/projects/create"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-obsidian-text hover:bg-white text-obsidian-void font-semibold text-xs transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </Link>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <div className="p-4 rounded-lg border border-obsidian-border bg-obsidian-canvas card-radial-glow flex items-center justify-between">
          <div>
            <span className="text-[11px] text-obsidian-subtext uppercase">
              Total Repositories
            </span>
            <p className="text-2xl font-bold text-white mt-1">
              {projects.length}
            </p>
          </div>
          <FolderGit2 className="w-5 h-5 text-obsidian-muted" />
        </div>

        <div className="p-4 rounded-lg border border-obsidian-border bg-obsidian-canvas card-radial-glow flex items-center justify-between">
          <div>
            <span className="text-[11px] text-obsidian-subtext uppercase">
              Production Live
            </span>
            <p className="text-2xl font-bold text-brand-emerald mt-1">
              {publishedCount}
            </p>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-brand-emerald animate-pulse" />
        </div>

        <div className="p-4 rounded-lg border border-obsidian-border bg-obsidian-canvas card-radial-glow flex items-center justify-between">
          <div>
            <span className="text-[11px] text-obsidian-subtext uppercase">
              Staged Drafts
            </span>
            <p className="text-2xl font-bold text-obsidian-subtext mt-1">
              {draftCount}
            </p>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-obsidian-muted" />
        </div>
      </div>

      {/* Projects Datatable */}
      <div className="p-5 sm:p-6 rounded-lg border border-obsidian-border bg-obsidian-canvas card-radial-glow space-y-4">
        {projects.length === 0 ? (
          <div className="py-16 text-center space-y-4 font-mono">
            <div className="w-12 h-12 rounded-lg bg-obsidian-card border border-obsidian-border flex items-center justify-center text-obsidian-muted mx-auto">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-white">
                No Projects Stored in Database
              </h3>
              <p className="text-xs text-obsidian-subtext max-w-sm mx-auto">
                Begin registering your production architecture records with Supabase Storage thumbnail upload.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/admin/projects/create"
                className="inline-flex items-center gap-1.5 text-xs text-brand-emerald hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create first project record</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-obsidian-border text-obsidian-muted">
                  <th className="pb-3 font-medium">PROJECT & SLUG</th>
                  <th className="pb-3 font-medium">STATUS</th>
                  <th className="pb-3 font-medium">CLICKS</th>
                  <th className="pb-3 font-medium">TECH STACK</th>
                  <th className="pb-3 font-medium text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-obsidian-border/60">
                {projects.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-obsidian-highlight/50 transition-colors"
                  >
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        {p.thumbnail ? (
                          <img
                            src={p.thumbnail}
                            alt={p.title}
                            className="w-10 h-10 rounded object-cover border border-obsidian-border bg-obsidian-void shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded border border-obsidian-border bg-obsidian-card flex items-center justify-center text-obsidian-muted shrink-0">
                            <Layers className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-white text-sm">
                              {p.title}
                            </span>
                            {p.isFeatured && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-[9px] text-amber-400 font-mono inline-flex items-center gap-1 font-semibold">
                                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                Highlighted
                              </span>
                            )}
                            {p.badge && (
                              <span className="px-1.5 py-0.5 rounded bg-brand-cyan/10 border border-brand-cyan/30 text-[9px] text-brand-cyan font-mono">
                                {p.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-obsidian-muted">
                            /{p.slug}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4">
                      {p.isPublished ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-brand-emerald/10 text-brand-emerald-dim border border-brand-emerald/30 text-[10px]">
                          <span className="w-1 h-1 rounded-full bg-brand-emerald" />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-obsidian-card text-obsidian-subtext border border-obsidian-border text-[10px]">
                          Draft
                        </span>
                      )}
                    </td>

                    <td className="py-4 text-obsidian-text font-bold">
                      <div className="flex items-center gap-1.5">
                        <MousePointerClick className="w-3.5 h-3.5 text-brand-cyan" />
                        <span>{p._count?.clickTracks || 0}</span>
                      </div>
                    </td>

                    <td className="py-4 text-obsidian-subtext max-w-xs truncate">
                      <div className="flex flex-wrap gap-1">
                        {p.techStack.map((tech, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-obsidian-card border border-obsidian-border text-obsidian-subtext"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <ProjectActionButtons
                          id={p.id}
                          isPublished={p.isPublished}
                          isFeatured={p.isFeatured}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
