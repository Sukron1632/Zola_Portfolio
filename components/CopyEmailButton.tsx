"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyEmailButtonProps {
  email: string;
}

export default function CopyEmailButton({ email }: CopyEmailButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  return (
    <div className="inline-flex items-center gap-2 p-1.5 pl-4 rounded-lg border border-obsidian-border bg-obsidian-card/90 backdrop-blur-md">
      <span className="font-mono text-xs text-obsidian-text selection:bg-brand-emerald selection:text-obsidian-void select-all">
        {email}
      </span>
      <button
        onClick={handleCopy}
        type="button"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-obsidian-highlight hover:bg-obsidian-border-focus text-obsidian-text text-xs font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
        title="Copy email to clipboard"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-brand-emerald" />
            <span className="text-brand-emerald">Copied</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-obsidian-subtext" />
            <span>Copy Email</span>
          </>
        )}
      </button>
    </div>
  );
}
