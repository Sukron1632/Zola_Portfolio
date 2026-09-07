"use client";

import React from "react";

interface TrackedLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  projectId?: string;
  children: React.ReactNode;
}

/**
 * An outbound anchor link that silently tracks clicks to /api/track-click
 * using navigator.sendBeacon or keepalive fetch before navigating.
 */
export default function TrackedLink({
  projectId,
  href,
  children,
  onClick,
  ...props
}: TrackedLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (projectId) {
      try {
        const payload = JSON.stringify({ projectId });
        if (typeof navigator !== "undefined" && navigator.sendBeacon) {
          navigator.sendBeacon(
            "/api/track-click",
            new Blob([payload], { type: "application/json" })
          );
        } else {
          fetch("/api/track-click", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payload,
            keepalive: true,
          }).catch(() => {});
        }
      } catch {
        // Silently ignore telemetry failure so user navigation is uninterrupted
      }
    }

    if (onClick) {
      onClick(e);
    }
  };

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
