/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./config";

const INACTIVITY_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes in milliseconds

/**
 * Starts a room inactivity monitor interval for the host user.
 * Archives the room (retaining chat history/metadata subcollections) rather than deleting it.
 */
export function startInactivityMonitor(
  roomId: string, 
  isHost: boolean, 
  onInactive?: () => void
): () => void {
  // Guests do not coordinate archiving monitors: return a safe no-op cleanup hook
  if (!isHost) {
    return () => {};
  }

  // Check health and activity metrics every 5 minutes (conserve writes relative to continuous loops)
  const interval = setInterval(async () => {
    try {
      const roomRef = doc(db, "rooms", roomId);
      const roomSnap = await getDoc(roomRef);
      if (!roomSnap.exists()) return;

      const data = roomSnap.data();
      
      // Fall back to current time if lastActiveAt has not been set yet
      const lastActiveAt = data.lastActiveAt 
        ? data.lastActiveAt.toMillis() 
        : Date.now();

      const inactiveFor = Date.now() - lastActiveAt;

      // Archive the room if threshold duration exceeds 15 minutes
      if (inactiveFor > INACTIVITY_THRESHOLD_MS) {
        // Enforce soft archive (isActive: false) instead of deleteDoc to protect subcollections
        await updateDoc(roomRef, {
          isActive: false,
          archivedAt: serverTimestamp(),
          archivedReason: "inactivity"
        });

        // Trigger local notification callback to redirect or inform UI
        if (onInactive) {
          onInactive();
        }
      }
    } catch (err) {
      console.error("Error executing inactivity health check:", err);
    }
  }, 5 * 60 * 1000); // 5 minutes interval

  return () => {
    clearInterval(interval);
  };
}
