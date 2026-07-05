/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Timestamp } from "firebase/firestore";

// Status options for chat messages to represent loading state, success, or send failure
export type ChatStatus = "sent" | "optimistic" | "failed";

// Message structure as stored in Firestore database records
export interface FirestoreMessage {
  id?: string; // Optional document ID resolved from Firestore query snapshots
  uid: string; // User ID of the message sender
  displayName: string; // Display name of the sender
  text: string; // Raw text content of the message
  createdAt: Timestamp | null; // Firestore server timestamp when the record was saved
}

// Client-side representation of chat messages, incorporating optimistic states
export interface ChatMessage {
  id: string; // Unique identifier for tracking and list rendering keys
  uid: string; // User ID of the message sender
  displayName: string; // Display name of the sender
  text: string; // Content of the message
  timestampMs: number; // Milliseconds timestamp for accurate sorting and rendering checks
  status: ChatStatus; // Active status flag of the message (optimistic, sent, failed)
}
