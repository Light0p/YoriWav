/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import { useEffect } from "react";
import { startInactivityMonitor } from "../lib/firebase/inactivityMonitor";

interface UseInactivityMonitorProps {
  roomId: string; // Active room id reference
  isHost: boolean; // Telemetry check flag for host user
  onInactive: () => void; // Dispatched when idle limits are crossed
}

/**
 * Hook to manage room inactivity status check intervals.
 * Automatically clears interval checks on component unmount lifecycle boundaries.
 */
export function useInactivityMonitor({
  roomId,
  isHost,
  onInactive
}: UseInactivityMonitorProps) {
  useEffect(() => {
    // Initiate inactivity checks and get cleanup hook
    const cleanup = startInactivityMonitor(roomId, isHost, onInactive);
    
    // Clear intervals to avoid duplicate memory leakage channels
    return cleanup;
  }, [roomId, isHost, onInactive]);
}

export default useInactivityMonitor;
