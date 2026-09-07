"use client";

import React, { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import ProjectDetailModal, { ProjectDetailData } from "./ProjectDetailModal";

interface ProjectDetailTriggerProps {
  project: ProjectDetailData;
  children?: React.ReactNode;
  className?: string;
}

export default function ProjectDetailTrigger({
  project,
  children,
  className,
}: ProjectDetailTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          className ||
          "inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-obsidian-text hover:bg-white text-obsidian-void font-semibold text-xs transition-all"
        }
      >
        {children || (
          <>
            <span>View Architecture Blueprint</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </>
        )}
      </button>

      <ProjectDetailModal
        project={project}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
