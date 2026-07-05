/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";

interface LazyViewportProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component to lazy-mount grids/lists when they enter the viewport.
 * Prevents redundant render passes and handles hydration safely.
 */
export default function LazyViewport({ children, fallback }: LazyViewportProps) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "200px" // Load 200px before coming into focus
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="w-full h-full min-h-[40px]">
      {isIntersecting ? children : fallback || (
        <div className="w-full h-12 bg-black/5 animate-pulse border-2 border-black/10 flex items-center justify-center font-mono text-[9px] text-brand-muted">
          MOUNT_AWAIT_VIEWPORT_DETECTION
        </div>
      )}
    </div>
  );
}
