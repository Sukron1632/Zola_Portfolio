"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  message?: string;
}

interface ObsidianToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export default function ObsidianToast({ toasts, onDismiss }: ObsidianToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border border-obsidian-border bg-obsidian-canvas/95 backdrop-blur-md shadow-2xl card-radial-glow text-xs font-mono animate-in slide-in-from-bottom-2 duration-200"
        >
          {t.type === "success" && (
            <CheckCircle2 className="w-4 h-4 text-brand-emerald shrink-0 mt-0.5" />
          )}
          {t.type === "error" && (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          )}
          {t.type === "info" && (
            <Info className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
          )}

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white">{t.title}</p>
            {t.message && (
              <p className="text-[11px] text-obsidian-subtext mt-0.5 leading-relaxed">
                {t.message}
              </p>
            )}
          </div>

          <button
            onClick={() => onDismiss(t.id)}
            className="text-obsidian-muted hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
