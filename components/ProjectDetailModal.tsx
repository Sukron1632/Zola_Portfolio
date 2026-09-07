"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  FileText,
  Download,
  Github,
  Calendar,
  Layers,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  Eye,
} from "lucide-react";
import TrackedLink from "@/components/TrackedLink";

export interface ProjectDetailData {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string | null;
  videoUrl?: string | null;
  techStack: string[];
  repoUrl?: string | null;
  gallery?: string[];
  documentUrl?: string | null;
  completedAt?: string | Date | null;
  createdAt?: string | Date;
}

interface ProjectDetailModalProps {
  project: ProjectDetailData | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectDetailModal({
  project,
  isOpen,
  onClose,
}: ProjectDetailModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset indices when modal opens or project changes
  useEffect(() => {
    if (isOpen) {
      setActiveImageIndex(0);
      setLightboxIndex(null);
    }
  }, [isOpen, project?.id]);

  // Consolidate unique list of all project visual assets
  const allImages: string[] = [];
  if (project?.thumbnail) {
    allImages.push(project.thumbnail);
  }
  if (Array.isArray(project?.gallery)) {
    for (const url of project.gallery) {
      if (url && typeof url === "string" && !allImages.includes(url)) {
        allImages.push(url);
      }
    }
  }

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Keyboard navigation for lightbox & Escape to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (lightboxIndex !== null) {
          setLightboxIndex(null);
        } else {
          onClose();
        }
      } else if (lightboxIndex !== null && allImages.length > 0) {
        if (e.key === "ArrowLeft") {
          setLightboxIndex((prev) =>
            prev !== null && prev > 0 ? prev - 1 : allImages.length - 1
          );
        } else if (e.key === "ArrowRight") {
          setLightboxIndex((prev) =>
            prev !== null && prev < allImages.length - 1 ? prev + 1 : 0
          );
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, lightboxIndex, allImages.length, onClose]);

  if (!isOpen || !project || !mounted) return null;

  const formattedDate = project.completedAt
    ? new Date(project.completedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      })
    : null;

  const currentHeroImage = allImages[activeImageIndex] || project.thumbnail || null;

  return createPortal(
    <>
      {/* Main Project Detail Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
        <div
          className="fixed inset-0"
          onClick={onClose}
          aria-hidden="true"
        />

        <div className="relative w-full max-w-3xl rounded-xl border border-obsidian-border bg-obsidian-canvas shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 ease-out">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-obsidian-border bg-obsidian-card/60">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-brand-emerald uppercase tracking-wider">
                Architecture Blueprint & System Specifications
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {project.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-lg text-obsidian-subtext hover:text-white hover:bg-obsidian-highlight transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Scrollable Body */}
          <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
            {/* Interactive Hero Visual Showcase */}
            {currentHeroImage && (
              <div className="space-y-2">
                <div className="relative rounded-lg overflow-hidden border border-obsidian-border bg-obsidian-void group max-h-80 aspect-video">
                  <img
                    src={currentHeroImage}
                    alt={`${project.title} preview`}
                    className="w-full h-full object-cover select-none cursor-pointer transition-transform duration-300 group-hover:scale-[1.02]"
                    onClick={() => setLightboxIndex(activeImageIndex)}
                    onContextMenu={(e) => e.preventDefault()}
                    draggable={false}
                  />

                  {/* Gradient bottom overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian-void/80 via-transparent to-transparent pointer-events-none" />

                  {/* Top-left image counter pill */}
                  {allImages.length > 1 && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-obsidian-void/90 border border-obsidian-border/80 text-[10px] font-mono text-white flex items-center gap-1.5 shadow-lg">
                      <Eye className="w-3 h-3 text-brand-emerald" />
                      <span>
                        Asset {activeImageIndex + 1} of {allImages.length}
                      </span>
                    </div>
                  )}

                  {/* Hover Inspect CTA in center */}
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(activeImageIndex)}
                    className="absolute inset-0 m-auto w-fit h-fit px-4 py-2 rounded-lg bg-black/80 hover:bg-brand-emerald text-white hover:text-obsidian-void border border-obsidian-border text-xs font-mono font-semibold flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all shadow-xl backdrop-blur-sm"
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span>Inspect Fullscreen</span>
                  </button>

                  {/* Hero Left/Right Chevrons (if multiple images) */}
                  {allImages.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex((prev) =>
                            prev > 0 ? prev - 1 : allImages.length - 1
                          );
                        }}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-obsidian-card text-white/80 hover:text-white border border-obsidian-border/80 transition-all opacity-0 group-hover:opacity-100"
                        title="Previous Asset"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex((prev) =>
                            prev < allImages.length - 1 ? prev + 1 : 0
                          );
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-obsidian-card text-white/80 hover:text-white border border-obsidian-border/80 transition-all opacity-0 group-hover:opacity-100"
                        title="Next Asset"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Gallery Screenshots Grid (Click to Inspect) */}
            {allImages.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono text-obsidian-subtext uppercase tracking-wider">
                    Visual Blueprint & Gallery ({allImages.length} Images)
                  </h3>
                  <span className="text-[11px] font-mono text-obsidian-muted">
                    Click any thumbnail to inspect
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {allImages.map((imgUrl, idx) => {
                    const isSelected = idx === activeImageIndex;
                    const isCover = idx === 0 && Boolean(project.thumbnail);
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setActiveImageIndex(idx);
                          setLightboxIndex(idx);
                        }}
                        className={`relative aspect-video rounded-lg overflow-hidden border cursor-pointer transition-all group select-none ${
                          isSelected
                            ? "border-brand-emerald ring-2 ring-brand-emerald/40 bg-obsidian-void"
                            : "border-obsidian-border hover:border-brand-emerald/60 bg-obsidian-card"
                        }`}
                        title={`Click to inspect ${isCover ? "Cover" : `Screenshot ${idx}`}`}
                      >
                        <img
                          src={imgUrl}
                          alt={`${project.title} visual ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onContextMenu={(e) => e.preventDefault()}
                          draggable={false}
                        />

                        {/* Thumbnail Label Badge */}
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-mono text-obsidian-text border border-obsidian-border/60">
                          {isCover ? "Cover" : `View ${idx}`}
                        </div>

                        {/* Hover Overlay with Inspect Icon */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <div className="p-1.5 rounded-full bg-brand-emerald text-obsidian-void shadow-lg">
                            <Maximize2 className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Metadata Row */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-obsidian-subtext pb-3 border-b border-obsidian-border/60">
              {formattedDate && (
                <div className="flex items-center gap-1.5 text-obsidian-text">
                  <Calendar className="w-3.5 h-3.5 text-brand-emerald" />
                  <span>Completed {formattedDate}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-brand-cyan" />
                <span>{project.techStack.length} Technologies Deployed</span>
              </div>
            </div>

            {/* Description & Architecture Details */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono text-obsidian-subtext uppercase tracking-wider">
                System Architecture & Scope
              </h3>
              <p className="text-sm text-obsidian-text leading-relaxed whitespace-pre-line bg-obsidian-card/40 p-4 rounded-lg border border-obsidian-border/50">
                {project.description}
              </p>
            </div>

            {/* Tech Stack Chips */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono text-obsidian-subtext uppercase tracking-wider">
                Technology Stack
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-md bg-obsidian-card border border-obsidian-border text-xs font-mono text-white"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Attached Document / Specifications (SRS/PDF) if any */}
            {project.documentUrl && (
              <div className="p-4 rounded-lg border border-brand-emerald/30 bg-brand-emerald/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-emerald/10 border border-brand-emerald/30 flex items-center justify-center text-brand-emerald">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      Technical Specification & SRS Document
                    </h4>
                    <p className="text-xs text-obsidian-subtext font-mono">
                      Architectural schema, UML diagrams, & formal requirements
                    </p>
                  </div>
                </div>
                <TrackedLink
                  projectId={project.id}
                  href={project.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-brand-emerald hover:bg-emerald-400 text-obsidian-void text-xs font-bold font-mono transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Document</span>
                </TrackedLink>
              </div>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-obsidian-border bg-obsidian-card/70">
            <div className="flex items-center gap-3">
              {project.repoUrl && (
                <TrackedLink
                  projectId={project.id}
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-obsidian-border hover:border-obsidian-border-focus bg-obsidian-canvas hover:bg-obsidian-highlight text-obsidian-text hover:text-white text-xs font-mono transition-all"
                >
                  <Github className="w-4 h-4" />
                  <span>Source Repository</span>
                </TrackedLink>
              )}
            </div>
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2 rounded-md bg-obsidian-card hover:bg-obsidian-highlight text-obsidian-subtext hover:text-white text-xs font-mono border border-obsidian-border transition-colors"
            >
              Close Blueprint
            </button>
          </div>
        </div>
      </div>

      {/* Standalone Full-Screen Lightbox (z-[10000]) */}
      {lightboxIndex !== null && allImages[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[10000] flex flex-col justify-between bg-black/95 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200 select-none"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Top Bar: Title, Asset Counter & Close Button */}
          <div
            className="flex items-center justify-between w-full max-w-6xl mx-auto z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-brand-emerald uppercase tracking-wider font-semibold">
                  Visual Blueprint Inspector
                </span>
                <span className="px-2 py-0.5 rounded-full bg-obsidian-card border border-obsidian-border text-[10px] font-mono text-obsidian-text">
                  {lightboxIndex + 1} of {allImages.length}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate max-w-md sm:max-w-xl">
                {project.title}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              className="p-2 rounded-full bg-obsidian-card hover:bg-obsidian-highlight border border-obsidian-border text-obsidian-subtext hover:text-white transition-colors"
              title="Close Inspector (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Center Area: Navigation Chevrons & Active Image */}
          <div
            className="relative flex-1 flex items-center justify-center py-4 w-full max-w-6xl mx-auto"
            onClick={() => setLightboxIndex(null)}
          >
            {/* Previous Button */}
            {allImages.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) =>
                    prev !== null && prev > 0 ? prev - 1 : allImages.length - 1
                  );
                }}
                className="absolute left-2 sm:left-4 z-30 p-3 rounded-full bg-black/80 hover:bg-obsidian-card border border-obsidian-border text-white transition-all shadow-xl hover:scale-110"
                title="Previous Asset (Left Arrow)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Main Image */}
            <img
              src={allImages[lightboxIndex]}
              alt={`${project.title} screenshot ${lightboxIndex + 1}`}
              className="max-h-[72vh] max-w-[86vw] object-contain rounded-lg border border-obsidian-border shadow-2xl transition-all select-none animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
              onContextMenu={(e) => e.preventDefault()}
              draggable={false}
            />

            {/* Next Button */}
            {allImages.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) =>
                    prev !== null && prev < allImages.length - 1 ? prev + 1 : 0
                  );
                }}
                className="absolute right-2 sm:right-4 z-30 p-3 rounded-full bg-black/80 hover:bg-obsidian-card border border-obsidian-border text-white transition-all shadow-xl hover:scale-110"
                title="Next Asset (Right Arrow)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Bar: Filmstrip Thumbnail Ribbon & Shortcuts Hint */}
          <div
            className="w-full max-w-4xl mx-auto flex flex-col items-center gap-2 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            {allImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto p-1 max-w-full custom-scrollbar">
                {allImages.map((thumbUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setLightboxIndex(idx)}
                    className={`relative w-16 h-11 rounded-md overflow-hidden border transition-all shrink-0 ${
                      idx === lightboxIndex
                        ? "border-brand-emerald ring-2 ring-brand-emerald/50 scale-105"
                        : "border-obsidian-border/80 opacity-60 hover:opacity-100"
                    }`}
                    title={`Jump to image ${idx + 1}`}
                  >
                    <img
                      src={thumbUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onContextMenu={(e) => e.preventDefault()}
                      draggable={false}
                    />
                  </button>
                ))}
              </div>
            )}

            <p className="text-[11px] font-mono text-obsidian-muted text-center">
              Press <kbd className="px-1.5 py-0.5 rounded bg-obsidian-card border border-obsidian-border text-white">←</kbd> <kbd className="px-1.5 py-0.5 rounded bg-obsidian-card border border-obsidian-border text-white">→</kbd> to navigate • <kbd className="px-1.5 py-0.5 rounded bg-obsidian-card border border-obsidian-border text-white">Esc</kbd> to exit
            </p>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}
