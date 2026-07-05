/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from "react";
import { subscribeChatMessages, sendMessage as apiSendMessage } from "../lib/firebase/chatHelpers";
import { ChatMessage, ChatStatus } from "../types/chat.types";

/**
 * Hook to manage chat messages in a room.
 * Implements optimistic updates, send failure states, re-sending, and focus-suspended listening.
 */
export function useChatMessages(
  roomId: string, 
  currentUid: string, 
  currentUserName: string,
  isTabFocused: boolean
) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Safe unique ID generator to prevent duplicate keys without external package constraints
  const generateId = () => {
    if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }
    return "id_" + Math.random().toString(36).substring(2, 15);
  };

  // Subscribe to real-time chat updates from Firestore subcollection
  useEffect(() => {
    // Audit check: Only query when window tab is focused to conserve Firestore read quota
    if (!isTabFocused) {
      return;
    }

    setIsLoading(true);

    const unsubscribe = subscribeChatMessages(
      roomId,
      (firestoreMsgs) => {
        // Reverse descending order list resolved from query snapshot to ascending timeline order
        const asc = [...firestoreMsgs].reverse();

        setMessages((prev) => {
          // Map firestore fields to ChatMessage client instances
          const confirmed = asc.map((msg) => ({
            id: msg.id || generateId(),
            uid: msg.uid,
            displayName: msg.displayName,
            text: msg.text,
            timestampMs: msg.createdAt?.toMillis() || Date.now(),
            status: "sent" as const
          }));

          // Keep optimistic items that have not yet been written/synced in Firestore snapshot
          const pendingOptimistic = prev.filter(
            (m) =>
              m.status === "optimistic" &&
              !confirmed.some((c) => c.uid === m.uid && c.text === m.text)
          );

          // Return merged collection ordered by timeline timestamp
          return [...confirmed, ...pendingOptimistic].sort(
            (a, b) => a.timestampMs - b.timestampMs
          );
        });
        setIsLoading(false);
      },
      (err) => {
        console.error("Chat subscription failed:", err);
        setIsLoading(false);
      }
    );

    // Return cleanup: mandatory on unmount or tab blur to prevent leak connections
    return () => unsubscribe();
  }, [roomId, isTabFocused]); // Re-subscribes only when target room changes or tab focus toggles

  // Sends message with immediate optimistic insertion and failure handling
  const sendMessage = useCallback(
    async (text: string) => {
      const tempId = "opt_" + Date.now();
      const optimisticMessage: ChatMessage = {
        id: tempId,
        uid: currentUid,
        displayName: currentUserName,
        text,
        timestampMs: Date.now(),
        status: "optimistic"
      };

      // Add optimistic version to UI array immediately for fluid user response
      setMessages((prev) => [...prev, optimisticMessage]);

      try {
        await apiSendMessage(roomId, currentUid, currentUserName, text);
        // onSnapshot returns the confirmed version which replaces the optimistic one automatically
      } catch (err) {
        console.error("Failed to transmit chat message:", err);
        // Flag local item as failed to let user invoke retry
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, status: "failed" } : m))
        );
      }
    },
    [roomId, currentUid, currentUserName] // deps are stable, rebuilds only if user scope shifts
  );

  // Retries sending a previously failed message
  const retryMessage = useCallback(
    (tempId: string) => {
      const failed = messages.find((m) => m.id === tempId);
      if (!failed) return;

      // Clean the failed message record from current state, then re-trigger transmission
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      sendMessage(failed.text);
    },
    [messages, sendMessage] // Re-bound only if messages cache or send wrapper refreshes
  );

  return { messages, isLoading, sendMessage, retryMessage };
}

export default useChatMessages;
