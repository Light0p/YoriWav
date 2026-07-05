/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Calculates guest playback position accounting for host seek time, network skews, and playback status.
 */
export function calculateGuestPosition(
  hostSeekTime: number,      // position in seconds where host was when they acted
  serverTimestampMs: number, // Firestore Timestamp converted to milliseconds
  clockSkewMs: number,       // Local client-to-server clock skew offset in milliseconds
  status: "PLAYING" | "PAUSED" | "IDLE"
): number {
  // If the stream is not actively playing, no time is accumulating.
  if (status !== "PLAYING") {
    return hostSeekTime;
  }

  // Estimate the elapsed time since the host recorded their seek position
  const correctedNow = Date.now() + clockSkewMs;
  const elapsedMs = correctedNow - serverTimestampMs;

  // Add the elapsed seconds to the recorded seek position
  return Math.max(0, hostSeekTime + (elapsedMs / 1000));
}

/**
 * Checks if the local player time drift exceeds the threshold for seeking.
 * Prevents minor stuttering by ignoring sub-threshold deviations.
 */
export function needsSeek(local: number, target: number, threshold = 1.5): boolean {
  // Drift threshold default is 1.5 seconds to balance drift with audibly noticeable seeking stutters
  return Math.abs(local - target) > threshold;
}

/**
 * Clamps player position to stay within the boundaries of the audio duration.
 * Prevents seeking errors beyond the end of the track under high-latency skew offsets.
 */
export function clampToTrack(positionSecs: number, durationSecs: number): number {
  return Math.min(Math.max(0, positionSecs), durationSecs);
}
