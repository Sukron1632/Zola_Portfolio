"use client";

import React, { useState } from "react";
import { Eye, ShieldCheck } from "lucide-react";
import { Credential } from "@/lib/storage";
import CertificateModal from "./CertificateModal";

interface CertificateViewTriggerProps {
  cert: Credential;
  children?: React.ReactNode;
  className?: string;
}

export default function CertificateViewTrigger({
  cert,
  children,
  className,
}: CertificateViewTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          className ||
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-obsidian-card hover:bg-obsidian-highlight text-white border border-obsidian-border hover:border-brand-emerald/50 text-xs font-mono font-medium transition-all group"
        }
        title={`View protected certificate for ${cert.title}`}
      >
        {children || (
          <>
            <Eye className="w-3.5 h-3.5 text-brand-emerald group-hover:scale-110 transition-transform" />
            <span>View Certificate</span>
          </>
        )}
      </button>

      <CertificateModal
        cert={cert}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
