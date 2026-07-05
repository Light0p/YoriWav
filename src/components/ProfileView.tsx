/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  FolderHeart, 
  Share2, 
  UserCheck, 
  UserPlus, 
  Trophy, 
  Compass, 
  Disc,
  ArrowRight
} from "lucide-react";
import { TRACKS } from "../tracks";
import { TrackModel } from "../types";
import UserAvatar from "./UserAvatar";


interface ProfileViewProps {
  user: any;
  onPlayTrack: (track: TrackModel, contextQueue?: TrackModel[]) => void;
}

export default function ProfileView({
  user,
  onPlayTrack
}: ProfileViewProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(148);

  const toggleFollow = () => {
    if (isFollowing) {
      setIsFollowing(false);
      setFollowersCount(prev => prev - 1);
    } else {
      setIsFollowing(true);
      setFollowersCount(prev => prev + 1);
    }
  };

  const shareProfile = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("PROFILE LINK COPIED TO DEVICE CLIPBOARD.");
  };

  const vaultTracks = [
    { ...TRACKS[1], catId: "CAT-904" },
    { ...TRACKS[2], catId: "CAT-112" },
    { ...TRACKS[4], catId: "CAT-045" },
    { ...TRACKS[5], catId: "CAT-382" }
  ];

  return (
    <div className="w-full flex flex-col gap-10">
      
      {/* Profile Header & Bio */}
      <section className="border-[1.5px] border-brand-fg bg-[#F1ECE3] p-6 md:p-10 flex flex-col md:flex-row gap-8 relative">
        <div className="absolute top-4 right-4 w-3 h-3 bg-brand-fg"></div>
        
        {/* Grayscale Avatar Frame */}
        <div className="w-28 h-28 md:w-32 md:h-32 border-[1.5px] border-brand-fg bg-white p-1 flex-shrink-0 jewel-case">
          <UserAvatar 
            className="w-full h-full object-cover filter grayscale contrast-125"
            fallbackClassName="text-4xl"
            guestFallback="E"
          />
        </div>

        {/* Info Block */}
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="font-serif text-3xl font-bold leading-none">
                {user?.displayName || "Eren Yeager"}
              </h2>
              <p className="font-mono text-[10px] text-brand-muted uppercase mt-1">
                CONNECTED USER // REGISTERED_ID: {user?.uid ? user.uid.substring(0, 12).toUpperCase() : "ANONYMOUS"}
              </p>
            </div>

            {/* Action buttons with brutalist borders */}
            <div className="flex gap-2">
              <button 
                onClick={toggleFollow}
                className={`btn-brutalist px-4 py-2 font-mono text-[11px] font-bold flex items-center gap-1.5 ${
                  isFollowing ? "bg-brand-fg text-brand-bg" : "bg-white text-brand-fg"
                }`}
              >
                {isFollowing ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                {isFollowing ? "LINKED" : "LINK DECK"}
              </button>
              <button 
                onClick={shareProfile}
                className="btn-brutalist bg-white text-brand-fg px-3 py-2 font-mono text-[11px] font-bold flex items-center justify-center hover:bg-brand-surface"
                title="Share profile deck link"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="border-t border-brand-fg/20 pt-4 font-mono text-xs text-brand-fg max-w-2xl leading-relaxed">
            Curator of analogue static noise, industrial drone loops, and nostalgic physical mediums. Based in Berlin. Running Echo Music Deck v2.0.4. Listening to high-frequency synthwave tracks and lo-fi tapes in real-time synced rooms.
          </div>

          {/* Followers count row */}
          <div className="flex gap-6 mt-6 font-mono text-[11px] uppercase text-brand-muted border-b border-brand-fg/10 pb-4">
            <div>
              <span className="font-bold text-brand-fg text-sm mr-1">{followersCount}</span> 
              DECK_LINKS
            </div>
            <div>
              <span className="font-bold text-brand-fg text-sm mr-1">340</span> 
MONITORING
            </div>
          </div>
        </div>
      </section>

      {/* The Vault: Cassette Grid */}
      <section>
        <div className="flex justify-between items-end border-b-[1.5px] border-brand-fg pb-2 mb-6">
          <h3 className="font-serif text-2xl font-bold leading-none">The Vault (Cassette Inventory)</h3>
          <span className="font-mono text-[11px] text-brand-muted">SECURELY ARCHIVED</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {vaultTracks.map((track) => (
            <div 
              key={track.videoId}
              onClick={() => onPlayTrack(track, vaultTracks)}
              className="border-[1.5px] border-brand-fg bg-brand-surface p-3 relative group cursor-pointer shadow-[3px_3px_0_0_#0D0D0D] hover:shadow-[5px_5px_0_0_#0D0D0D] hover:-translate-y-0.5 transition-all"
            >
              {/* Tape Sticker Label visual */}
              <div className="border border-brand-fg/30 bg-[#DFD9CE] p-3 flex flex-col justify-between h-36 relative">
                
                {/* Spindles detail */}
                <div className="flex justify-between items-center opacity-30">
                  <div className="w-3.5 h-3.5 rounded-full border border-brand-fg bg-brand-bg"></div>
                  <div className="w-14 h-2 bg-brand-bg border border-brand-fg rounded-none"></div>
                  <div className="w-3.5 h-3.5 rounded-full border border-brand-fg bg-brand-bg"></div>
                </div>

                <div className="mt-2 text-center">
                  <p className="font-serif text-sm font-bold truncate px-1 group-hover:underline">
                    {track.title}
                  </p>
                  <p className="font-mono text-[10px] text-brand-muted truncate mt-0.5">
                    {track.artist}
                  </p>
                </div>

                {/* Tape catalog stamp */}
                <div className="flex justify-between items-end border-t border-brand-fg/20 pt-1 text-[8px] font-mono text-brand-muted uppercase">
                  <span>{track.catId}</span>
                  <span>RECORDED_LP</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Annual Report: Magazine Typography Layout */}
      <section className="border-[1.5px] border-brand-fg bg-white p-6 md:p-10 relative overflow-hidden">
        
        {/* Subtle geometric lines */}
        <div className="absolute top-0 bottom-0 left-1/3 w-px bg-brand-fg/5 pointer-events-none"></div>
        <div className="absolute top-0 bottom-0 left-2/3 w-px bg-brand-fg/5 pointer-events-none"></div>

        <div className="relative z-10">
          <span className="font-mono text-[10px] uppercase font-bold text-brand-error tracking-widest block mb-1">
            ANNUAL SYSTEM STATEMENT
          </span>
          <h3 className="font-serif text-4xl font-bold leading-none mb-8">
            Diagnostic & Usage Report
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border-l-2 border-brand-fg pl-4">
              <p className="font-mono text-[10px] text-brand-muted uppercase">
                TOTAL MINUTES PLAYED
              </p>
              <h4 className="font-serif text-4xl font-bold leading-none mt-2">
                4,129
              </h4>
              <p className="font-mono text-[10px] text-brand-muted mt-2">
                +14.2% DECK ACTIVITY
              </p>
            </div>

            <div className="border-l-2 border-brand-fg pl-4">
              <p className="font-mono text-[10px] text-brand-muted uppercase">
                DECK RELIABILITY RATE
              </p>
              <h4 className="font-serif text-4xl font-bold leading-none mt-2">
                99.8%
              </h4>
              <p className="font-mono text-[10px] text-brand-muted mt-2">
                0 DROP OUTS RECORDED
              </p>
            </div>

            <div className="border-l-2 border-brand-fg pl-4">
              <p className="font-mono text-[10px] text-brand-muted uppercase">
                DRIFT SYNC ACCURACY
              </p>
              <h4 className="font-serif text-4xl font-bold leading-none mt-2">
                0.12s
              </h4>
              <p className="font-mono text-[10px] text-brand-muted mt-2">
                WITHIN NOMINAL SPEC
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
