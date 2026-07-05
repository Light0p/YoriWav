/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, RefObject } from "react";
import { subscribeSyncState, SyncStateDoc } from "../lib/firebase/syncHelpers";
import { initClockSkew, getClockSkew } from "../lib/utils/clockSkew";
import { calculateGuestPosition, needsSeek, clampToTrack } from "../lib/utils/syncMath";
import { TrackModel } from "../types";

interface UseSyncEngineProps {
  roomId: string; // Active room id
  audioRef: RefObject<HTMLAudioElement | null>; // Ref to the HTML5 audio element
  isHost: boolean; // True if the current user is host
  isTabFocused: boolean; // Flag to regulate query subscription capping
  currentTrack: TrackModel | null; // Currently loaded track reference
  onTrackChange: (track: TrackModel) => void; // Dispatched to sync guest track models
  setIsPlaying: (playing: boolean) => void; // React state updater for play state
}

/**
 * Hook to execute host-guest audio synchronization.
 * Computes latency corrections using clock offset metrics and handles autoplay suspensions.
 */
export function useSyncEngine({
  roomId,
  audioRef,
  isHost,
  isTabFocused,
  currentTrack,
  onTrackChange,
  setIsPlaying
}: UseSyncEngineProps) {
  
  // 1. Initialize global singleton clock skew offset on mount
  useEffect(() => {
    initClockSkew().catch(err => {
      console.error("Failed to initialize skew calculations:", err);
    });
  }, []);

  // 2. Setup focus-suspending Firestore state subscription
  useEffect(() => {
    // Audit check: suspend listeners if tab is blurred/inactive to cap read operations
    if (!isTabFocused) {
      return;
    }

    const handleSyncUpdate = (state: SyncStateDoc) => {
      // Host ignores own updates: prevents feedback loops during seeks
      if (isHost) {
        return;
      }

      // Sync active track details if guest track differs
      if (state.trackId && currentTrack?.videoId !== state.trackId) {
        onTrackChange({
          videoId: state.trackId,
          title: state.trackTitle,
          artist: state.trackArtist,
          thumbnailUrl: state.trackThumbnailUrl,
          durationSeconds: 0,
          audioUrl: "" // Will resolve stream URL asynchronously in consumer layer
        });
      }

      const audio = audioRef.current;
      if (!audio) return;

      // Extract server time marker for offset correction
      const serverTimestampMs = state.serverTimestamp 
        ? state.serverTimestamp.toMillis() 
        : Date.now();

      // Calculate the drift-corrected playback target position
      const rawPos = calculateGuestPosition(
        state.hostSeekTime,
        serverTimestampMs,
        getClockSkew(),
        state.status
      );

      const targetPos = clampToTrack(rawPos, audio.duration || 180);
      const localPos = audio.currentTime;

      // Only seek if guest drift exceeds 1.5s threshold limit
      if (needsSeek(localPos, targetPos)) {
        audio.currentTime = targetPos;
      }

      // Sync playback states
      if (state.status === "PLAYING") {
        setIsPlaying(true);
        if (audio.paused) {
          audio.play().catch(err => {
            // NotAllowedError is expected under strict browser autoplay policies
            if (err.name !== "NotAllowedError") {
              console.error("Autoplay request failed:", err);
            }
          });
        }
      } else {
        setIsPlaying(false);
        if (!audio.paused) {
          audio.pause();
        }
      }
    };

    const unsubscribe = subscribeSyncState(
      roomId,
      handleSyncUpdate,
      (err) => console.error("Sync Engine Subscription failed:", err)
    );

    return () => unsubscribe();
  }, [roomId, isTabFocused, isHost, currentTrack, audioRef, onTrackChange, setIsPlaying]);
}

export default useSyncEngine;
