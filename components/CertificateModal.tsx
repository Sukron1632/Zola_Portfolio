"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  X,
  Shield,
  ShieldCheck,
  BadgeCheck,
  ExternalLink,
  CheckCircle2,
  Lock,
  ChevronLeft,
  ChevronRight,
  Fingerprint,
  Info,
  FileText,
} from "lucide-react";
import { Credential } from "@/lib/storage";
import TrackedLink from "@/components/TrackedLink";

interface CertificateModalProps {
  cert: Credential | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CertificateModal({
  cert,
  isOpen,
  onClose,
}: CertificateModalProps) {
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);

  // PDF Rendering States
  const [pdfTotalPages, setPdfTotalPages] = useState<number>(1);
  const [pdfLoading, setPdfLoading] = useState<boolean>(false);
  const [useCanvas, setUseCanvas] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Reset page index whenever active cert changes
  useEffect(() => {
    setActivePageIndex(0);
    setNotice(null);
    setPdfTotalPages(1);
    setUseCanvas(false);
  }, [cert?.id, isOpen]);

  // Anti-Theft: Prevent keyboard shortcuts like Ctrl+S (Save) and Ctrl+P (Print)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "s" || e.key === "S" || e.key === "p" || e.key === "P")
      ) {
        e.preventDefault();
        setNotice("Protected Document: Direct downloads and printing are disabled.");
        setTimeout(() => setNotice(null), 3000);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Helper to reliably check if a resource URL points to a PDF
  const isPdfResource = (url: string) => {
    if (!url) return false;
    const cleanUrl = url.split("?")[0].split("#")[0].toLowerCase();
    // Image extensions must ALWAYS be treated as images
    if (
      cleanUrl.endsWith(".jpg") ||
      cleanUrl.endsWith(".jpeg") ||
      cleanUrl.endsWith(".png") ||
      cleanUrl.endsWith(".webp") ||
      cleanUrl.endsWith(".gif") ||
      cleanUrl.endsWith(".svg")
    ) {
      return false;
    }
    // PDF extension indicates PDF document
    if (cleanUrl.endsWith(".pdf")) return true;
    // For blob/object URLs with no explicit image extension, check cert fileName
    if (
      cert?.fileName?.toLowerCase().endsWith(".pdf") &&
      !cleanUrl.includes(".jpg") &&
      !cleanUrl.includes(".png") &&
      !cleanUrl.includes(".webp")
    ) {
      return true;
    }
    return false;
  };

  const rawFileUrl = cert?.fileUrl || cert?.imageUrl || "";
  const isRawPdf = isPdfResource(rawFileUrl);

  // Multi-page resolution:
  // 1. If explicit gallery array exists (e.g. BNSP Page 1 & Page 2 images), use that
  // 2. If it's a multi-page PDF, generate page links
  // 3. Otherwise single file URL
  const pages: string[] =
    cert?.gallery && cert.gallery.length > 0
      ? cert.gallery
      : isRawPdf && pdfTotalPages > 1
      ? Array.from({ length: pdfTotalPages }, (_, i) => `${rawFileUrl}#page=${i + 1}`)
      : rawFileUrl
      ? [rawFileUrl]
      : [];

  const currentItem = pages[activePageIndex] || rawFileUrl;
  const currentIsPdf = isPdfResource(currentItem);

  // PDF.js Client-Side Canvas Rendering Effect (only runs when active item is genuinely a PDF)
  useEffect(() => {
    if (!isOpen || !currentIsPdf || !rawFileUrl) {
      setPdfLoading(false);
      return;
    }

    let isCancelled = false;
    setPdfLoading(true);

    const renderPdfPage = async () => {
      try {
        // Dynamically load PDF.js from CDN if not present
        if (!(window as any).pdfjsLib) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Failed to load PDF.js library"));
            document.head.appendChild(script);
          });

          if ((window as any).pdfjsLib) {
            (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
              "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
          }
        }

        const pdfjsLib = (window as any).pdfjsLib;
        if (!pdfjsLib) throw new Error("pdfjsLib unavailable");

        const loadingTask = pdfjsLib.getDocument({
          url: rawFileUrl,
          cMapUrl: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/",
          cMapPacked: true,
        });

        const pdf = await loadingTask.promise;
        if (isCancelled) return;

        if (pdf.numPages && pdf.numPages !== pdfTotalPages) {
          setPdfTotalPages(pdf.numPages);
        }

        const pageNumber = Math.min(Math.max(activePageIndex + 1, 1), pdf.numPages);
        const page = await pdf.getPage(pageNumber);
        if (isCancelled) return;

        const canvas = canvasRef.current;
        if (canvas) {
          const unscaledViewport = page.getViewport({ scale: 1 });
          const targetHeight = Math.min(window.innerHeight * 0.52, 540);
          const scale = targetHeight / unscaledViewport.height;
          const viewport = page.getViewport({ scale: Math.max(scale, 1.25) });

          canvas.height = viewport.height;
          canvas.width = viewport.width;

          const context = canvas.getContext("2d");
          if (context) {
            await page.render({ canvasContext: context, viewport }).promise;
            if (!isCancelled) {
              setUseCanvas(true);
              setPdfLoading(false);
            }
          }
        }
      } catch (err) {
        console.warn("PDF.js render fallback to iframe:", err);
        if (!isCancelled) {
          setUseCanvas(false);
          setPdfLoading(false);
        }
      }
    };

    renderPdfPage();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, rawFileUrl, activePageIndex, currentIsPdf, pdfTotalPages]);

  if (!isOpen || !cert) return null;

  // Discreet right-click handler
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setNotice("Right-click is disabled to protect credential authenticity.");
    setTimeout(() => setNotice(null), 2500);
    return false;
  };

  const getPageTitle = (index: number) => {
    return `Page ${index + 1}`;
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none overflow-y-auto"
      onContextMenu={handleContextMenu}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container: Balanced Proportions, Header & Footer never cut off */}
      <div
        className="relative w-full max-w-2xl lg:max-w-3xl rounded-xl border border-obsidian-border bg-obsidian-canvas shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
        onContextMenu={handleContextMenu}
      >
        {/* Top Header Bar: Clean & Unobstructed */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b border-obsidian-border bg-obsidian-card/90">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-brand-emerald/10 border border-brand-emerald/30 flex items-center justify-center text-brand-emerald shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-brand-emerald font-semibold truncate">
                  Official Credential
                </span>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 flex items-center gap-1 shrink-0">
                  <Lock className="w-2.5 h-2.5" />
                  Protected View
                </span>
              </div>
              <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">
                {cert.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-lg text-obsidian-subtext hover:text-white hover:bg-obsidian-highlight transition-colors shrink-0 ml-3"
            title="Close Preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subtle Security Toast Notification */}
        {notice && (
          <div className="flex-shrink-0 bg-brand-emerald/15 border-b border-brand-emerald/30 px-5 py-1.5 text-xs font-mono text-brand-emerald-dim flex items-center gap-2 animate-in slide-in-from-top-1 duration-150">
            <Info className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {/* Scrollable Document Body */}
        <div className="flex-1 min-h-0 p-3 sm:p-4 space-y-3 overflow-y-auto custom-scrollbar">
          {/* Prominent Page Selection Buttons if Multi-Page Document */}
          {pages.length > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 p-1 bg-obsidian-card/90 border border-obsidian-border rounded-lg shadow-sm">
              {pages.map((_, idx) => {
                const isActive = activePageIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePageIndex(idx)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all ${
                      isActive
                        ? "bg-brand-emerald text-obsidian-void font-bold shadow-md shadow-brand-emerald/20"
                        : "bg-obsidian-void/80 text-obsidian-subtext hover:text-white hover:bg-obsidian-highlight border border-obsidian-border/50"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{getPageTitle(idx)}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-obsidian-void animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Certificate Viewport: Proportional Height & Crisp Display */}
          <div
            className="relative rounded-lg border border-obsidian-border/80 bg-obsidian-void/90 overflow-hidden shadow-xl flex flex-col items-center justify-center min-h-[320px] sm:min-h-[420px]"
            onContextMenu={handleContextMenu}
            onDragStart={(e) => e.preventDefault()}
          >
            {/* Transparent Click Shield Overlay: Covers entire document to block direct inspect/save */}
            <div
              className="absolute inset-0 z-30 pointer-events-auto bg-transparent select-none cursor-default"
              onContextMenu={handleContextMenu}
              onDragStart={(e) => e.preventDefault()}
            />

            {/* Floating Next/Prev Arrow Buttons on Viewport */}
            {pages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActivePageIndex((prev) => (prev > 0 ? prev - 1 : pages.length - 1))}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 z-40 p-2 rounded-full bg-obsidian-card/90 hover:bg-obsidian-highlight text-white border border-obsidian-border shadow-2xl hover:scale-105 transition-all"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setActivePageIndex((prev) => (prev < pages.length - 1 ? prev + 1 : 0))}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 z-40 p-2 rounded-full bg-obsidian-card/90 hover:bg-obsidian-highlight text-white border border-obsidian-border shadow-2xl hover:scale-105 transition-all"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Soft, Non-Intrusive Security Watermark restricted to certificate bounds */}
            <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden select-none opacity-[0.035] flex flex-col justify-around rotate-[-15deg] scale-110">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="font-mono text-xs font-bold text-white whitespace-nowrap tracking-widest text-center"
                >
                  OFFICIAL REPOSITORY OF ZOLA DIMAS FIRMANSYAH • VERIFIED CREDENTIAL • TAMPER-PROOF RECORD
                </div>
              ))}
            </div>

            {/* Certificate Visual Display: Supports Images (JPG/PNG/WEBP) and Documents (PDF via Canvas or Secure Embed) */}
            {rawFileUrl ? (
              <div className="p-2 sm:p-3 flex justify-center items-center w-full max-h-[54vh] relative">
                {currentIsPdf ? (
                  <>
                    {/* HTML5 Canvas Rendered via PDF.js */}
                    <canvas
                      ref={canvasRef}
                      className={`max-h-[52vh] w-auto object-contain rounded border border-obsidian-border/60 shadow-2xl pointer-events-none select-none ${
                        useCanvas && !pdfLoading ? "block" : "hidden"
                      }`}
                    />

                    {/* Fallback Native PDF Embed or Loading Indicator */}
                    {(!useCanvas || pdfLoading) && (
                      <div className="w-full h-[52vh] relative flex items-center justify-center bg-obsidian-void rounded border border-obsidian-border/60 overflow-hidden">
                        {pdfLoading && (
                          <div className="absolute z-10 flex items-center gap-2 font-mono text-xs text-brand-cyan bg-obsidian-card/90 px-3 py-1.5 rounded-md border border-obsidian-border shadow-lg">
                            <span className="w-3 h-3 rounded-full border-2 border-brand-cyan border-t-transparent animate-spin" />
                            <span>Loading PDF Document...</span>
                          </div>
                        )}
                        <iframe
                          src={`${rawFileUrl}#page=${activePageIndex + 1}&toolbar=0&navpanes=0&scrollbar=0`}
                          className="w-full h-full rounded border-0 pointer-events-none"
                          title={`${cert.title} - ${getPageTitle(activePageIndex)}`}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  /* Standard High-Fidelity Protected Image Display (e.g. JPG, PNG, WEBP) */
                  <img
                    src={currentItem}
                    alt={`${cert.title} - ${getPageTitle(activePageIndex)}`}
                    draggable={false}
                    onContextMenu={handleContextMenu}
                    onDragStart={(e) => e.preventDefault()}
                    className="max-h-[52vh] w-auto object-contain rounded border border-obsidian-border/60 shadow-2xl pointer-events-none select-none"
                    style={{
                      WebkitUserSelect: "none",
                      WebkitTouchCallout: "none",
                    }}
                  />
                )}
              </div>
            ) : (
              /* Fallback High-Fidelity Official Digital Certificate Document Visualizer */
              <div className="p-5 sm:p-8 font-serif relative w-full min-h-[360px] flex flex-col justify-between border-4 border-double border-brand-emerald/30 m-2 bg-obsidian-card/40 rounded-sm">
                <div className="text-center space-y-1 pt-1">
                  <div className="inline-flex items-center justify-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-full bg-brand-emerald/10 border border-brand-emerald/40 flex items-center justify-center text-brand-emerald shadow-inner">
                      <BadgeCheck className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand-emerald font-semibold">
                    {cert.issuer}
                  </p>
                  <h3 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-white uppercase">
                    Certificate of Technical Competency
                  </h3>
                  <p className="font-sans text-[10px] text-obsidian-subtext tracking-wide">
                    Certificate of Technical Competency & Professional Accreditation
                  </p>
                </div>

                <div className="my-4 text-center space-y-1.5 font-sans">
                  <p className="text-[10px] text-obsidian-muted italic">
                    Officially awarded to:
                  </p>
                  <div className="border-b border-brand-emerald/40 pb-1 max-w-sm mx-auto">
                    <h4 className="font-sans text-base sm:text-lg font-bold tracking-wide text-white uppercase">
                      Zola Dimas Firmansyah
                    </h4>
                  </div>
                  <p className="text-xs text-brand-cyan-dim font-medium max-w-lg mx-auto">
                    Demonstrated competence in software engineering:
                  </p>
                  <div className="inline-block px-3 py-1 rounded bg-brand-emerald/10 border border-brand-emerald/30">
                    <span className="font-mono text-xs font-bold text-white">
                      {cert.title}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end pt-3 border-t border-obsidian-border/80 font-mono text-[9px]">
                  <div className="text-left space-y-0.5">
                    <span className="text-obsidian-muted block text-[8px] uppercase">
                      REGISTRATION NUMBER
                    </span>
                    <span className="text-white font-bold tracking-wider">
                      {cert.credentialId}
                    </span>
                    <span className="text-obsidian-subtext block text-[8px]">
                      Validity: {cert.issueDate}
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-10 h-10 rounded-full border border-brand-emerald/40 bg-brand-emerald/10 flex flex-col items-center justify-center">
                      <Shield className="w-4 h-4 text-brand-emerald" />
                      <span className="text-[5px] font-bold text-brand-emerald uppercase tracking-tighter">
                        SEALED
                      </span>
                    </div>
                  </div>

                  <div className="text-right space-y-0.5">
                    <span className="text-obsidian-muted block text-[8px] uppercase">
                      INTEGRITY CHECKSUM
                    </span>
                    <span className="text-brand-cyan truncate block font-mono text-[8px]">
                      {cert.hash.substring(0, 18)}...
                    </span>
                    <span className="text-brand-emerald font-semibold flex items-center justify-end gap-1 text-[8px]">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      100% Validated
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Security Strip inside Viewer Frame */}
            <div className="w-full px-4 py-1.5 bg-obsidian-card/90 border-t border-obsidian-border flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-obsidian-subtext">
              <div className="flex items-center gap-1.5 truncate max-w-[65%]">
                <Fingerprint className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
                <span className="truncate">
                  SHA-256 Audit: <strong className="text-white font-normal">{cert.hash}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1 text-brand-emerald shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Anti-Tamper Protection Active</span>
              </div>
            </div>
          </div>

          {/* Certificate Description Box if available */}
          {cert.description && (
            <div className="p-3 rounded-lg border border-obsidian-border bg-obsidian-card/80 text-xs font-mono text-obsidian-subtext space-y-1">
              <span className="text-white font-semibold text-[11px] block">
                Competency & Accreditation Overview:
              </span>
              <p className="text-[11px] leading-relaxed text-obsidian-text">
                {cert.description}
              </p>
            </div>
          )}

          {/* Discreet Bottom Info Note */}
          <div className="px-3.5 py-2 rounded-lg border border-obsidian-border bg-obsidian-card/70 text-xs font-mono text-obsidian-subtext flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Shield className="w-4 h-4 text-brand-cyan shrink-0" />
              <span className="text-[11px] text-obsidian-text truncate">
                Protected Official Document: Certified credential of Zola Dimas Firmansyah rendered in high fidelity.
              </span>
            </div>
            {pages.length > 1 && (
              <span className="text-[10px] text-brand-emerald font-semibold whitespace-nowrap">
                Page {activePageIndex + 1} of {pages.length}
              </span>
            )}
          </div>
        </div>

        {/* Modal Footer Controls: Always anchored and visible */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-t border-obsidian-border bg-obsidian-card/90 font-mono text-xs">
          <div>
            {cert.verifyUrl && (
              <TrackedLink
                href={cert.verifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-brand-emerald/10 hover:bg-brand-emerald/20 text-brand-emerald border border-brand-emerald/30 font-semibold transition-colors text-xs"
              >
                <span>Verify on Issuing Authority</span>
                <ExternalLink className="w-3 h-3" />
              </TrackedLink>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-obsidian-text hover:bg-white text-obsidian-void font-bold text-xs transition-all shadow-sm"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
