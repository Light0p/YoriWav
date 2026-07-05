/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Sync drift correction algorithms.
 * Below 1.5s, human perception cannot detect sync drift in music.
 * Above 1.5s, the chorus is noticeably offset — must correct.
 * Seeking too frequently causes audio stutters worse than the drift itself.
 */

export function calculateTargetTime(
  position: number,
  updatedAt: number,
  clockSkewMs: number
): number {
  // Estimate how many milliseconds have elapsed since host wrote the state
  const elapsedMs = Date.now() - updatedAt + clockSkewMs;
  // Add that elapsed time to the position the host was at when they wrote
  return position + elapsedMs / 1000.0;
}

export function shouldSeek(
  localPosition: number,
  targetPosition: number,
  threshold = 1.5
): boolean {
  // Only seek if drift is humanly perceptible (1.5s is the threshold)
  return Math.abs(localPosition - targetPosition) > threshold;
}

export function estimateNetworkLatencyMs(
  serverUpdatedAt: number,
  localClockSkewMs: number
): number {
  return Date.now() + localClockSkewMs - serverUpdatedAt;
}
