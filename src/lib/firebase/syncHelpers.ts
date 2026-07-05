/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  serverTimestamp, 
  Unsubscribe,
  Timestamp
} from "firebase/firestore";
import { db } from "./config";

// Type definitions for host-driven sync updates
export interface SyncStateDoc {
  trackId: string; // Video or stream unique ID reference
  trackTitle: string; // Title of the active song
  trackArtist: string; // Artist name of the active song
  trackThumbnailUrl: string; // Cover art URL
  status: "PLAYING" | "PAUSED" | "IDLE"; // Playback engine status flag
  hostSeekTime: number; // Playback position (seconds) on host device
  serverTimestamp: Timestamp; // Firestore server time marker
  hostUid: string; // Identifier of the active host
}

/**
 * Publishes sync states to Firestore.
 * Always overwrites the single "state" document to maintain atomicity of timestamp records.
 */
export async function writeSyncState(
  roomId: string, 
  hostUid: string, 
  payload: {
    trackId: string;
    trackTitle: string;
    trackArtist: string;
    trackThumbnailUrl: string;
    status: "PLAYING" | "PAUSED" | "IDLE";
    hostSeekTime: number;
  }
): Promise<void> {
  const syncStateRef = doc(db, "rooms", roomId, "sync", "state");

  // Perform full write overwrite (merge: false) to ensure serverTimestamp updates atomically
  await setDoc(syncStateRef, {
    trackId: payload.trackId,
    trackTitle: payload.trackTitle,
    trackArtist: payload.trackArtist,
    trackThumbnailUrl: payload.trackThumbnailUrl,
    status: payload.status,
    hostSeekTime: payload.hostSeekTime,
    serverTimestamp: serverTimestamp(),
    hostUid
  }, { merge: false });

  // Update room activity tracking to defer auto-archiving protocols
  const roomRef = doc(db, "rooms", roomId);
  await updateDoc(roomRef, {
    lastActiveAt: serverTimestamp()
  });
}

/**
 * Listens to the single state record of a room.
 * Fires callbacks on modifications.
 */
export function subscribeSyncState(
  roomId: string,
  cb: (state: SyncStateDoc) => void,
  onErr: (e: Error) => void
): Unsubscribe {
  const syncStateRef = doc(db, "rooms", roomId, "sync", "state");

  return onSnapshot(syncStateRef, (snapshot) => {
    // Return early if the document does not exist to prevent runtime failures
    if (!snapshot.exists()) {
      return;
    }

    const data = snapshot.data();
    cb({
      trackId: data.trackId || "",
      trackTitle: data.trackTitle || "",
      trackArtist: data.trackArtist || "",
      trackThumbnailUrl: data.trackThumbnailUrl || "",
      status: data.status || "IDLE",
      hostSeekTime: data.hostSeekTime || 0,
      serverTimestamp: data.serverTimestamp as Timestamp,
      hostUid: data.hostUid || ""
    });
  }, onErr);
}
