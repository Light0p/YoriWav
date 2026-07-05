/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Copy, 
  UserPlus,
  Play,
  Pause,
  Music
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { RoomModel, RoomMember } from "../types";
import ChatPanel from "./room/chat/ChatPanel";

interface RoomViewProps {
  roomId: string; // Active room reference identifier
  roomState: RoomModel | null; // Unified metadata document state
  members: RoomMember[]; // Active presence users collection
  onLeaveRoom: () => void; // Triggered when leaving the session
  currentUser: any; // User profile descriptor
  isHost: boolean; // True if the current user is host
  onPlayPause: () => void; // Sync action trigger
  isPlaying: boolean; // Active playback status
  isTabFocused?: boolean; // Focus telemetry flag to regulate chat polling
}

/**
 * Main Room Deck interface.
 * Arranges structural controls and virtualized live chat side-by-side.
 */
export default function RoomView({
  roomId,
  roomState,
  members,
  onLeaveRoom,
  currentUser,
  isHost,
  onPlayPause,
  isPlaying,
  isTabFocused = true
}: RoomViewProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Copy URL link utility helper
  const copyRoomLink = () => {
    if (typeof window === "undefined") return;
    const shareUrl = `${window.location.origin}/rooms/${roomId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto pb-[120px] grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-black">
      
      {/* 1. Main Deck Controls Column (Left, 2/3 width) */}
      <div className="md:col-span-2 flex flex-col gap-6">
        
        {/* Header Block: Title & Listening metrics */}
        <div className="flex flex-col gap-4 border-b-2 border-black pb-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-serif text-3xl font-bold leading-none mb-2">Live Jam Session</h2>
              <p className="font-mono text-[10px] text-brand-muted uppercase tracking-wider">
                HOSTED BY {roomState?.hostName || "UNKNOWN_HOST"}
              </p>
            </div>
            <button 
              onClick={onLeaveRoom}
              className="border-2 border-black bg-[#EDE8DF] px-4 py-2 font-mono text-xs font-bold uppercase transition-transform hover:bg-[#0D0D0D] hover:text-white cursor-pointer active:translate-y-0.5 shadow-[2px_2px_0_0_#000]"
            >
              Leave Room
            </button>
          </div>

          {/* Listening PRESENCE status row */}
          <div className="flex items-center">
            <div className="flex -space-x-3">
              {members.slice(0, 5).map((member, i) => (
                <div 
                  key={member.uid} 
                  className="w-10 h-10 rounded-full border-2 border-black overflow-hidden bg-brand-surface relative grayscale contrast-125"
                  style={{ zIndex: 10 - i }}
                  title={member.displayName}
                >
                  <img 
                    src={member.photoUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuD7YlCdtrBmuwOi73Fou1lgM2_B5_3y47mYlYc9n8IUKFbMHFSjtChgbhSjwqVO---m2sueCG0QMmDzmFGrNA5lLfXCXm0X-Qm-uGmhSYxDdTacvpGQaoGYHE-s4qv8jY--fNiXuzAu6iJcfnRoHKr3C2asO4pq3AsWlIhZr6kFhrUiWCFnUodd5LQzmZtvBDRPabkD2JSE-RFos6YBbPd9ZUbeGBEHTlzlfElddnLp_7YCgEonj88Etw"} 
                    alt={member.displayName}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {members.length > 5 && (
                <div className="w-10 h-10 rounded-full border-2 border-black bg-brand-surface flex items-center justify-center font-mono text-xs font-bold z-0 relative">
                  +{members.length - 5}
                </div>
              )}
            </div>
            <div className="ml-4 flex items-center gap-2 font-mono text-xs font-bold bg-[#E5FFE5] text-green-800 px-2 py-1 border border-green-800">
              <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></div>
              {members.length} LISTENING
            </div>
          </div>
        </div>

        {/* Invite Generator Panel */}
        <div className="flex flex-col gap-2">
          <button 
            onClick={() => {
              copyRoomLink();
              setShowQR(true);
            }}
            className="w-full py-4 border-2 border-black bg-black text-white font-mono text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white hover:text-black transition-colors shadow-[4px_4px_0_0_#000] cursor-pointer active:translate-y-0.5 active:shadow-none"
          >
            <UserPlus className="w-5 h-5" />
            {copied ? "URL COPIED TO CLIPBOARD" : "INVITE CO-OPERATIVE"}
          </button>
          
          {showQR && (
            <div className="mt-2 p-6 border-2 border-black bg-white flex flex-col items-center justify-center gap-4 animate-in fade-in slide-in-from-top-2 shadow-[4px_4px_0_0_#000]">
              <div className="font-mono text-xs font-bold uppercase">ROOM LINK OVERVIEW</div>
              <div className="border-2 border-black p-2 bg-white">
                <QRCodeSVG value={typeof window !== "undefined" ? `${window.location.origin}/rooms/${roomId}` : roomId} size={160} bgColor="#FFFFFF" fgColor="#0D0D0D" level="L" />
              </div>
              <button 
                onClick={() => setShowQR(false)} 
                className="text-xs font-mono underline cursor-pointer hover:text-brand-muted uppercase"
              >
                [ Hide QR Engine ]
              </button>
            </div>
          )}
        </div>

        {/* Dynamic audio card panel */}
        <section className="flex flex-col gap-4">
          <h3 className="font-mono text-xs uppercase font-bold text-brand-muted border-b border-black/10 pb-2">
            AUDIO DECK OUTPUT
          </h3>
          
          {roomState?.trackId ? (
            <div className="flex items-center gap-4 p-4 border-2 border-black bg-white shadow-[4px_4px_0_0_#0D0D0D]">
              <div className="w-16 h-16 border-2 border-black bg-brand-surface shrink-0 relative group">
                <img 
                  src={roomState.trackThumbnailUrl} 
                  alt={roomState.trackTitle} 
                  className="w-full h-full object-cover filter grayscale" 
                />
                {isHost && (
                  <div 
                    onClick={onPlayPause}
                    className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                  >
                    {isPlaying ? <Pause className="w-6 h-6 text-white fill-current" /> : <Play className="w-6 h-6 text-white fill-current ml-1" />}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-serif text-lg font-bold truncate uppercase">{roomState.trackTitle}</h4>
                <p className="font-mono text-xs text-brand-muted truncate uppercase">{roomState.trackArtist}</p>
              </div>
              <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full border border-black/20">
                <Music className="w-5 h-5 text-brand-fg animate-pulse" />
              </div>
            </div>
          ) : (
            <div className="p-8 border-2 border-dashed border-black/40 text-center font-mono text-xs text-brand-muted bg-[#EDE8DF]/30">
              AWAITING DECK AUDIO SOURCE EMISSION...
            </div>
          )}
        </section>
      </div>

      {/* 2. Live Chat Sidebar Column (Right, 1/3 width) */}
      <div className="h-[450px] md:h-[600px] flex flex-col md:sticky md:top-4">
        <ChatPanel 
          roomId={roomId}
          currentUid={currentUser?.uid || "anonymous_user"}
          currentUserName={currentUser?.displayName || "ANONYMOUS"}
          memberCount={members.length}
          isTabFocused={isTabFocused}
        />
      </div>

    </div>
  );
}
