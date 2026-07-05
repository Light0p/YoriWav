/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ref, get } from "firebase/database";
import { rtdb } from "../firebase/config";

// Singleton states to store calculated client-server clock offset
let _skewMs = 0;
let _initialized = false;

/**
 * Initializes the clock skew offset by fetching from Firebase Realtime Database.
 * Runs once and caches the value in a singleton context to avoid redundant network passes.
 */
export async function initClockSkew(): Promise<void> {
  // Avoid duplicate initialization passes if already established
  if (_initialized) {
    return;
  }

  try {
    // Read the server offset reference. It resolves the delta between local clock and Firebase server clock
    const offsetRef = ref(rtdb, ".info/serverTimeOffset");
    const snapshot = await get(offsetRef);
    _skewMs = (snapshot.val() as number) || 0;
    _initialized = true;
    console.log(`[ClockSkew] Sync offset established: ${_skewMs}ms`);
  } catch (err) {
    console.error("Failed to initialize clock skew offset metrics:", err);
    // Silent fallback to 0ms offset in case database connection fails
    _skewMs = 0;
  }
}

/**
 * Returns the cached clock skew difference.
 */
export function getClockSkew(): number {
  return _skewMs;
}
