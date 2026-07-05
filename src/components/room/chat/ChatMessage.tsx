/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ChatMessage as ChatMessageType } from "../../../types/chat.types";

interface ChatMessageProps {
  message: ChatMessageType;
  isOwn: boolean;
  onRetry?: (id: string) => void;
}

/**
 * Renders a single chat message bubble within a room.
 * Implements relative timestamps, optimistic states, failed states, and a memoized rendering pattern.
 */
export const ChatMessage: React.FC<ChatMessageProps> = React.memo(({ 
  message, 
  isOwn, 
  onRetry 
}) => {
  // Helper to format timestamps to uppercase brutalist relative format
  const formatTime = (timestampMs: number): string => {
    if (typeof window === "undefined") return "";
    const diffSecs = Math.floor((Date.now() - timestampMs) / 1000);

    if (diffSecs < 60) {
      return "JUST NOW";
    }

    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) {
      return `${diffMins}M AGO`;
    }

    const date = new Date(timestampMs);
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const isOptimistic = message.status === "optimistic";
  const isFailed = message.status === "failed";

  // Bubble container styles using Tailwind theme custom variables
  const containerClasses = [
    "flex flex-col max-w-[80%] p-3 font-mono border-2 shadow-[2px_2px_0_0_#0D0D0D]",
    isOwn 
      ? "bg-[#0D0D0D] text-[#F5F0E8] border-black self-end" 
      : "bg-[#EDE8DF] text-black border-black self-start",
    isOptimistic 
      ? "border-dashed opacity-75 border-black/50" 
      : "border-solid border-black",
    isFailed 
      ? "border-[#CC0000]! bg-[#F5F0E8] text-[#CC0000]" 
      : ""
  ].join(" ");

  return (
    <div className={`flex w-full my-2.5 px-3 flex-col ${isOwn ? "items-end" : "items-start"}`}>
      {/* Sender Profile Header */}
      {!isOwn && (
        <span className="text-[10px] font-bold tracking-tight text-brand-muted uppercase mb-1">
          {message.displayName}
        </span>
      )}

      {/* Bubble text */}
      <div className={containerClasses}>
        <p className="text-xs break-all leading-normal whitespace-pre-wrap uppercase font-bold">
          {message.text}
        </p>

        <div className="flex items-center justify-between gap-4 mt-2 border-t border-black/10 pt-1 text-[9px] font-bold">
          {/* Relative capitalized timestamp */}
          <span className={isOwn ? "text-white/60" : "text-black/55"}>
            {formatTime(message.timestampMs)}
          </span>

          {/* Failed State action */}
          {isFailed && (
            <button
              onClick={() => onRetry && onRetry(message.id)}
              className="px-2 py-0.5 border border-[#CC0000] bg-white text-[#CC0000] hover:bg-[#CC0000] hover:text-white transition-colors cursor-pointer text-[8px] uppercase tracking-wider"
            >
              [ RETRY ]
            </button>
          )}

          {/* Optimistic indicator */}
          {isOptimistic && (
            <span className="animate-pulse tracking-widest text-[8px]">
              SENDING...
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

// Display name set for debugging React DevTools instances
ChatMessage.displayName = "ChatMessage";
export default ChatMessage;
