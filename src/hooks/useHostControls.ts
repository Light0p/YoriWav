/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import { useMemo, RefObject } from "react";
import { writeSyncState } from "../lib/firebase/syncHelpers";
import { TrackModel } from "../types";

// Standard typescript-safe debounce implementation to prevent drag/scrub write floods
function debounce<T extends (...args: any[]) => void>(
  func: T, 
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Controller hook providing audio management options for the room host.
 * Transmits playback states to all guests on play, pause, and scrub gestures.
 */
export function useHostControls() {
  
  // Debounced seek updater to limit scrub updates to 300ms chunks to conserve Firestore quotas
  const debouncedWriteSeek = useMemo(
    () => 
      debounce(
        (roomId: string, uid: string, track: TrackModel, seekTime: number) => {
          writeSyncState(roomId, uid, {
            trackId: track.videoId,
            trackTitle: track.title,
            trackArtist: track.artist,
            trackThumbnailUrl: track.thumbnailUrl,
            status: "PLAYING",
            hostSeekTime: seekTime
          }).catch(err => {
            console.error("Failed to commit debounced seek update:", err);
          });
        }, 
        300
      ),
    [] // Empty deps array is intentional: debounce timer references must stay stable
  );

  // Initiates track playback and publishes status update
  const play = async (
    audioRef: RefObject<HTMLAudioElement | null>,
    roomId: string,
    uid: string,
    currentTrack: TrackModel
  ): Promise<void> => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      await audio.play();
    } catch (err) {
      console.error("Local play action failed:", err);
    }

    // Publish active play state to sync channel
    await writeSyncState(roomId, uid, {
      trackId: currentTrack.videoId,
      trackTitle: currentTrack.title,
      trackArtist: currentTrack.artist,
      trackThumbnailUrl: currentTrack.thumbnailUrl,
      status: "PLAYING",
      hostSeekTime: audio.currentTime
    });
  };

  // Pauses track playback and publishes status update
  const pause = async (
    audioRef: RefObject<HTMLAudioElement | null>,
    roomId: string,
    uid: string,
    currentTrack: TrackModel
  ): Promise<void> => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();

    // Publish active paused state to sync channel
    await writeSyncState(roomId, uid, {
      trackId: currentTrack.videoId,
      trackTitle: currentTrack.title,
      trackArtist: currentTrack.artist,
      trackThumbnailUrl: currentTrack.thumbnailUrl,
      status: "PAUSED",
      hostSeekTime: audio.currentTime
    });
  };

  // Seeks playback to the target seconds value
  const seek = (
    secs: number,
    audioRef: RefObject<HTMLAudioElement | null>,
    roomId: string,
    uid: string,
    currentTrack: TrackModel
  ): void => {
    const audio = audioRef.current;
    if (!audio) return;

    // Apply immediate local time update
    audio.currentTime = secs;

    // Dispatch the debounced network update to avoid firing 60+ updates/sec during sliding
    debouncedWriteSeek(roomId, uid, currentTrack, secs);
  };

  return { play, pause, seek };
}

export default useHostControls;
