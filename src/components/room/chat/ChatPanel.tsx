/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import React, { useState, useRef, useCallback } from "react";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import useChatMessages from "../../../hooks/useChatMessages";
import ChatMessage from "./ChatMessage";
import { Send } from "lucide-react";

interface ChatPanelProps {
  roomId: string;
  currentUid: string;
  currentUserName: string;
  memberCount: number;
  isTabFocused: boolean;
}

/**
 * Live Chat Panel Sidebar component.
 * Incorporates virtuoso virtual list rendering and brutalist UI.
 */
export default function ChatPanel({
  roomId,
  currentUid,
  currentUserName,
  memberCount,
  isTabFocused
}: ChatPanelProps) {
  const { messages, sendMessage, retryMessage } = useChatMessages(
    roomId,
    currentUid,
    currentUserName,
    isTabFocused
  );

  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const virtuosoRef = useRef<VirtuosoHandle>(null);

  // Memoized input submission to prevent unnecessary re-render passes
  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isSending) return;

    if (text.length > 500) {
      alert("Message exceeds character limit!");
      return;
    }

    setIsSending(true);
    setInputText(""); // Clear input immediately for optimal UX latency representation

    try {
      await sendMessage(text);
    } catch (e) {
      console.error("Failed to post message:", e);
    } finally {
      setIsSending(false);
    }
  }, [inputText, isSending, sendMessage]);

  // Intercept keyboard controls to submit on Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Intercept default newline insertion
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full border-2 border-black bg-[#F5F0E8] select-none font-mono shadow-[4px_4px_0_0_#000] overflow-hidden">
      {/* 1. Header Area */}
      <div className="flex items-center justify-between border-b-2 border-black bg-[#EDE8DF] p-3">
        <div className="flex flex-col">
          <span className="text-xs font-black tracking-tight">LIVE CHAT</span>
          <span className="text-[9px] text-[#2A4B9B] font-bold uppercase">
            COMMUNICATION_RELAY.EXE
          </span>
        </div>
        <div className="border border-black bg-white px-2 py-0.5 text-[9px] font-bold uppercase text-black">
          {memberCount} ACTIVE
        </div>
      </div>

      {/* 2. Virtualized Message Viewport */}
      <div className="flex-1 min-h-0 bg-white border-b-2 border-black relative">
        <div className="halftone-overlay absolute inset-0 opacity-[0.02] pointer-events-none" />
        
        {messages.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 select-none">
            <span className="text-xs font-black uppercase text-brand-muted">
              CHAT_LOG_EMPTY
            </span>
            <span className="text-[9px] uppercase text-brand-muted/70 mt-1">
              SEND A MESSAGE TO INITIATE SYNCHRONIZED LOG
            </span>
          </div>
        ) : (
          <Virtuoso
            ref={virtuosoRef}
            data={messages}
            followOutput="smooth" // Smooth scrolling behavior as new messages arrive
            itemContent={(index, msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                isOwn={msg.uid === currentUid}
                onRetry={retryMessage}
              />
            )}
          />
        )}
      </div>

      {/* 3. Input Console */}
      <div className="p-3 bg-[#EDE8DF] flex flex-col gap-2 relative">
        {/* Character count overlay shown when text exceeds 400 characters */}
        {inputText.length > 400 && (
          <div className="absolute -top-6 right-3 bg-black text-white text-[9px] font-bold px-1.5 py-0.5 border border-black z-10">
            {inputText.length} / 500 CHARACTERS
          </div>
        )}

        <div className="flex gap-2">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value.substring(0, 500))} // Clamp input limit at 500
            onKeyDown={handleKeyDown}
            disabled={isSending}
            placeholder={isSending ? "TRANSMITTING..." : "TYPE MESSAGE..."}
            rows={1}
            className="flex-1 border-2 border-black bg-white p-2 font-mono text-xs focus:outline-none focus:bg-brand-surface/30 placeholder-black/50 uppercase resize-none min-h-[38px] max-h-[80px]"
          />

          <button
            onClick={handleSend}
            disabled={isSending || !inputText.trim()}
            className="border-2 border-black bg-black text-white px-4 py-2 font-mono text-xs font-bold uppercase transition-all hover:bg-white hover:text-black cursor-pointer shadow-[2px_2px_0_0_#000] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>SEND</span>
          </button>
        </div>
      </div>
    </div>
  );
}
