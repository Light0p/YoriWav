import React, { useState, useEffect, useRef } from "react";
import { 
  Send, 
  Users, 
  Copy, 
  Check, 
  UserPlus,
  Play,
  Pause,
  Music
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { RoomModel, RoomMessage, RoomMember } from "../types";

interface RoomViewProps {
  roomId: string;
  roomState: RoomModel | null;
  members: RoomMember[];
  messages: RoomMessage[];
  onSendMessage: (content: string) => void;
  onLeaveRoom: () => void;
  currentUser: any;
  isHost: boolean;
  onPlayPause: () => void;
  isPlaying: boolean;
}

export default function RoomView({
  roomId,
  roomState,
  members,
  messages,
  onSendMessage,
  onLeaveRoom,
  currentUser,
  isHost,
  onPlayPause,
  isPlaying
}: RoomViewProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full flex flex-col gap-8 max-w-4xl mx-auto pb-[120px]">
      
      {/* 1. Top Header: Title & Overlapping Avatars */}
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="font-serif text-3xl font-bold leading-none mb-2">Live Jam Session</h2>
            <p className="font-mono text-xs text-brand-muted uppercase">HOSTED BY {roomState?.hostName || "UNKNOWN"}</p>
          </div>
          <button 
            onClick={onLeaveRoom}
            className="border-[1.5px] border-brand-fg bg-brand-surface px-4 py-2 font-mono text-[10px] font-bold uppercase hover:bg-brand-fg hover:text-brand-bg transition-colors"
          >
            Leave Room
          </button>
        </div>

        {/* Avatars */}
        <div className="flex items-center">
          <div className="flex -space-x-3">
            {members.slice(0, 5).map((member, i) => (
              <div 
                key={member.uid} 
                className="w-10 h-10 rounded-full border-2 border-brand-bg overflow-hidden bg-brand-surface z-10 relative"
                style={{ zIndex: 10 - i }}
                title={member.displayName}
              >
                <img 
                  src={member.photoUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuD7YlCdtrBmuwOi73Fou1lgM2_B5_3y47mYlYc9n8IUKFbMHFSjtChgbhSjwqVO---m2sueCG0QMmDzmFGrNA5lLfXCXm0X-Qm-uGmhSYxDdTacvpGQaoGYHE-s4qv8jY--fNiXuzAu6iJcfnRoHKr3C2asO4pq3AsWlIhZr6kFhrUiWCFnUodd5LQzmZtvBDRPabkD2JSE-RFos6YBbPd9ZUbeGBEHTlzlfElddnLp_7YCgEonj88Etw"} 
                  alt={member.displayName}
                  className="w-full h-full object-cover filter grayscale"
                />
              </div>
            ))}
            {members.length > 5 && (
              <div className="w-10 h-10 rounded-full border-2 border-brand-bg bg-brand-surface flex items-center justify-center font-mono text-[10px] font-bold z-0 relative">
                +{members.length - 5}
              </div>
            )}
          </div>
          <div className="ml-4 flex items-center gap-2 font-mono text-xs font-bold bg-green-100 text-green-800 px-2 py-1 border border-green-800">
            <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></div>
            {members.length} LISTENING
          </div>
        </div>
      </div>

      {/* 2. Massive Invite Button */}
      <div className="flex flex-col gap-2">
        <button 
          onClick={() => {
            copyRoomId();
            setShowQR(true);
          }}
          className="w-full py-4 border-[2px] border-brand-fg bg-brand-fg text-brand-bg font-mono text-lg font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-brand-fg/90 transition-colors shadow-[4px_4px_0_0_#0D0D0D] active:translate-y-0.5 active:shadow-none"
        >
          <UserPlus className="w-6 h-6" />
          {copied ? "ID COPIED TO CLIPBOARD" : "INVITE TO ROOM"}
        </button>
        
        {showQR && (
           <div className="mt-4 p-6 border-[1.5px] border-brand-fg bg-white flex flex-col items-center justify-center gap-4 animate-in fade-in slide-in-from-top-2">
             <div className="font-mono text-sm font-bold">ROOM ID: {roomId}</div>
             <div className="border-[1.5px] border-brand-fg p-2 bg-transparent">
                <QRCodeSVG value={roomId} size={160} bgColor="transparent" fgColor="#0D0D0D" level="L" />
             </div>
             <button onClick={() => setShowQR(false)} className="text-xs font-mono underline">Hide Code</button>
           </div>
        )}
      </div>

      {/* 3. Currently Playing */}
      <section className="flex flex-col gap-4">
        <h3 className="font-mono text-xs uppercase font-bold text-brand-muted border-b border-brand-fg/20 pb-2">
          Currently Playing
        </h3>
        
        {roomState?.trackId ? (
          <div className="flex items-center gap-4 p-4 border-[1.5px] border-brand-fg bg-white shadow-[4px_4px_0_0_#0D0D0D]">
            <div className="w-16 h-16 border-[1.5px] border-brand-fg bg-brand-surface shrink-0 relative group">
              <img src={roomState.trackThumbnailUrl} alt={roomState.trackTitle} className="w-full h-full object-cover filter grayscale" />
              {isHost && (
                <div 
                  onClick={onPlayPause}
                  className="absolute inset-0 bg-brand-fg/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-6 h-6 text-brand-bg fill-current" /> : <Play className="w-6 h-6 text-brand-bg fill-current ml-1" />}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-serif text-lg font-bold truncate">{roomState.trackTitle}</h4>
              <p className="font-mono text-xs text-brand-muted truncate">{roomState.trackArtist}</p>
            </div>
            <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full border border-brand-fg/20">
               <Music className="w-5 h-5 text-brand-fg animate-pulse" />
            </div>
          </div>
        ) : (
          <div className="p-8 border-[1.5px] border-dashed border-brand-fg/40 text-center font-mono text-sm text-brand-muted bg-brand-surface/30">
            NO AUDIO SOURCE DETECTED.
          </div>
        )}
      </section>

      {/* 4. Shared Queue (Network Activity/Messages acting as queue log) */}
      <section className="flex flex-col gap-4 flex-1">
        <h3 className="font-mono text-xs uppercase font-bold text-brand-muted border-b border-brand-fg/20 pb-2">
          Shared Queue & Activity
        </h3>
        
        <div className="flex flex-col gap-3">
          {messages.length === 0 ? (
            <div className="py-8 text-center font-mono text-xs text-brand-muted">
              Queue is empty. Activity log pending...
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={msg.messageId || idx} className="flex items-start gap-3 p-3 border border-brand-fg/20 bg-brand-surface/40 hover:bg-brand-surface transition-colors">
                <div className="w-8 h-8 rounded-full border border-brand-fg overflow-hidden shrink-0 mt-0.5">
                  <img src={"https://lh3.googleusercontent.com/aida-public/AB6AXuD7YlCdtrBmuwOi73Fou1lgM2_B5_3y47mYlYc9n8IUKFbMHFSjtChgbhSjwqVO---m2sueCG0QMmDzmFGrNA5lLfXCXm0X-Qm-uGmhSYxDdTacvpGQaoGYHE-s4qv8jY--fNiXuzAu6iJcfnRoHKr3C2asO4pq3AsWlIhZr6kFhrUiWCFnUodd5LQzmZtvBDRPabkD2JSE-RFos6YBbPd9ZUbeGBEHTlzlfElddnLp_7YCgEonj88Etw"} alt={msg.displayName} className="w-full h-full object-cover filter grayscale" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold truncate">{msg.displayName}</span>
                    <span className="font-mono text-[9px] text-brand-muted">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="font-mono text-sm mt-1">{msg.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

    </div>
  );
}
