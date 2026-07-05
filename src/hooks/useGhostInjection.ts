/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from "react";

/**
 * Hook to inject external third-party scripts conditionally on page mount.
 * Prevents SSR hydration mismatch and ensures zero leakage on static layers.
 */
export function useGhostInjection(src: string, id: string) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (document.getElementById(id)) return;

    const script = document.createElement("script");
    script.src = src;
    script.id = id;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      const el = document.getElementById(id);
      if (el) {
        el.remove();
      }
    };
  }, [src, id]);
}

export default useGhostInjection;
