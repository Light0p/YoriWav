/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TrackModel {
  videoId: string; // Used as id
  title: string;
  artist: string;
  thumbnailUrl: string;
  durationSeconds: number;
  isLive?: boolean;
  audioUrl: string; // The physical stream URL
}

export interface RoomModel {
  roomId: string;
  hostId: string;
  hostName: string;
  trackId: string;
  trackTitle: string;
  trackArtist: string;
  trackThumbnailUrl: string;
  isPlaying: boolean;
  position: number; // Exact seconds when state last changed
  updatedAt: number; // TIMESTAMP in milliseconds
}

export interface RoomMember {
  uid: string;
  displayName: string;
  photoUrl: string;
  joinedAt: number;
}

export interface RoomMessage {
  messageId?: string;
  uid: string;
  displayName: string;
  content: string;
  timestamp: number;
}

export enum PlaybackStatus {
  idle = "idle",
  loading = "loading",
  playing = "playing",
  paused = "paused",
  error = "error"
}

export interface EchoPlaybackState {
  currentTrack: TrackModel | null;
  status: PlaybackStatus;
  errorMessage: string | null;
  position: number; // in seconds
  bufferedPosition: number; // in seconds
  duration: number; // in seconds
}
