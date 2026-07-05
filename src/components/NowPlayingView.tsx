/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Play, 
  Pause, 
  Disc, 
  Tv, 
  Terminal, 
  ListMusic, 
  Plus, 
  ChevronRight, 
  Database,
  Heart,
  Shuffle,
  Repeat,
  SkipBack,
  SkipForward,
  ChevronDown
} from "lucide-react";
import { TrackModel } from "../types";
import { TRACKS } from "../tracks";

interface NowPlayingViewProps {
  currentTrack: TrackModel | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onPlayTrack: (track: TrackModel, queue?: TrackModel[]) => void;
  currentTime: number;
  queue: TrackModel[];
  currentTrackIndex: number;
  favorites: TrackModel[];
  onToggleFavorite: (track: TrackModel) => void;
  onSkipNext: () => void;
  onSkipPrevious: () => void;
  onClose?: () => void;
}

export default function NowPlayingView({
  currentTrack,
  isPlaying,
  onPlayPause,
  onPlayTrack,
  currentTime,
  queue,
  currentTrackIndex,
  favorites,
  onToggleFavorite,
  onSkipNext,
  onSkipPrevious,
  onClose
}: NowPlayingViewProps) {
  const [visualizerBars, setVisualizerBars] = useState<number[]>([]);
  const [activeQueueTab, setActiveQueueTab] = useState<"upcoming" | "history">("upcoming");

  // Animate mock waveform bars
  useEffect(() => {
    if (!isPlaying) {
      setVisualizerBars(Array(24).fill(4));
      return;
    }

    const interval = setInterval(() => {
      const bars = Array.from({ length: 24 }, () => Math.floor(Math.random() * 28) + 6);
      setVisualizerBars(bars);
    }, 120);

    return () => clearInterval(interval);
  }, [isPlaying]);

  if (!currentTrack) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] border-[1.5px] border-dashed border-brand-fg/50 p-8 text-center font-mono">
        <Disc className="w-12 h-12 text-brand-muted animate-spin mb-4" />
        <h3 className="font-serif text-xl font-bold mb-2">No audio loaded</h3>
        <p className="text-xs text-brand-muted max-w-sm">
          Please select a sound file or trigger a synced room from the Home dashboard to initialize the visualizer deck.
        </p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[100] bg-[#f4f4f0] h-[100dvh] flex flex-col p-4 md:relative md:inset-auto md:z-auto md:bg-transparent md:h-auto md:overflow-visible md:flex-row md:gap-8 md:p-0"
    >
      
      {/* Left Block: Visualizer Deck & Cassette */}
      <div className="w-full flex flex-col shrink-0 gap-4 md:w-2/3 md:shrink md:flex-1 md:min-h-0 md:gap-6">
        
        {/* Close/Pull Down Header on Mobile */}
        <div className="md:hidden flex justify-between items-center shrink-0">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 font-mono text-xs font-bold uppercase border-[1.5px] border-brand-fg bg-brand-surface px-3 py-1.5 shadow-[2px_2px_0_0_#0D0D0D] active:translate-y-px active:shadow-none transition-all cursor-pointer"
          >
            <ChevronDown className="w-4 h-4" />
            [ PULL DOWN / CLOSE ]
          </button>
          <span className="font-mono text-[9px] text-brand-muted font-bold tracking-wider">DECK_EXPANDED_PLAYER</span>
        </div>

        {/* Core Windows 98/Retro Style Outer Box */}
        <div className="border-[1.5px] border-brand-fg bg-brand-surface p-1 shadow-[4px_4px_0_0_#0D0D0D] flex flex-col h-[280px] shrink-0 w-full relative md:h-auto md:w-auto md:shrink md:flex-initial">
          
          {/* Header Titlebar */}
          <div className="bg-brand-fg text-brand-bg px-3 py-1 flex justify-between items-center font-mono text-[11px] font-bold shrink-0">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              DECK_VISUALIZER.EXE
            </span>
            <div className="flex gap-1">
              <div className="w-3.5 h-3.5 border border-brand-bg bg-brand-surface flex items-center justify-center text-[8px] text-brand-fg cursor-pointer">_</div>
              <div className="w-3.5 h-3.5 border border-brand-bg bg-brand-surface flex items-center justify-center text-[8px] text-brand-fg cursor-pointer">X</div>
            </div>
          </div>

          {/* Interactive Screen Display */}
          <div className="border-[1.5px] border-brand-fg bg-white p-4 md:p-10 flex flex-col items-center justify-center relative flex-1 min-h-0 md:min-h-[360px] overflow-hidden">
            
            {/* Spinning vinyl design */}
            <div className="relative w-36 h-36 sm:w-48 sm:h-48 md:w-60 md:h-60 mb-4 md:mb-6 flex-shrink-0">
              {/* Outer grooves shadow */}
              <div className="absolute inset-0 rounded-full border-[1.5px] border-brand-fg bg-[#1A1A1A] flex items-center justify-center">
                <div className="absolute inset-4 rounded-full border border-brand-surface/20"></div>
                <div className="absolute inset-8 rounded-full border border-brand-surface/10"></div>
                <div className="absolute inset-12 rounded-full border border-brand-surface/20"></div>
                <div className="absolute inset-16 rounded-full border border-brand-surface/10"></div>
              </div>

              {/* The Spinning Core */}
              <div 
                className={`absolute inset-0 rounded-full flex items-center justify-center overflow-hidden ${
                  isPlaying ? "record-spin-active" : "record-spin-paused"
                }`}
              >
                {/* Turntable Artwork overlay */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full border-[1.5px] border-brand-fg bg-white p-0.5 overflow-hidden flex items-center justify-center relative">
                  <img 
                    src={currentTrack.thumbnailUrl || undefined} 
                    alt={currentTrack.title}
                    className="w-full h-full object-cover rounded-full filter grayscale"
                  />
                  {/* Spindle peg cutout */}
                  <div className="absolute w-3 h-3 md:w-4 md:h-4 rounded-full bg-brand-bg border-[1.5px] border-brand-fg shadow-inner"></div>
                </div>
              </div>

              {/* Turntable Needle arm (fixed projection) */}
              <div className="absolute top-0 right-4 w-8 h-16 sm:w-10 sm:h-20 md:w-12 md:h-24 border-r-2 border-t-2 border-brand-fg pointer-events-none transform origin-top rotate-12 transition-transform duration-500">
                <div className="absolute bottom-0 right-0 w-2 h-4 sm:w-3 sm:h-6 bg-brand-fg rounded-sm"></div>
              </div>
            </div>

            {/* Simulated Live Dancing Waveform visualizer */}
            <div className="w-full max-w-md h-8 md:h-12 flex items-end justify-center gap-[3px] border-t-[1.5px] border-brand-fg/20 pt-2 md:pt-4">
              {visualizerBars.map((val, i) => (
                <div 
                  key={i}
                  className="w-1 md:w-1.5 bg-brand-fg transition-all duration-100"
                  style={{ height: `${val * 1.2}px` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* --- ADDED: Media Controls & Track Info --- */}
        <div className="border-[1.5px] border-brand-fg bg-brand-surface p-4 md:p-6 shadow-[4px_4px_0_0_#0D0D0D] flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
          {/* Track Info */}
          <div className="flex items-center gap-4 flex-1 w-full min-w-0">
             <div className="min-w-0 flex-1">
               <div className="flex items-center gap-3">
                 <h2 className="font-serif text-xl md:text-3xl font-bold truncate">{currentTrack.title}</h2>
                 {favorites && onToggleFavorite && (
                   <button 
                     onClick={() => onToggleFavorite(currentTrack)}
                     className="text-brand-fg hover:scale-110 transition-transform active:scale-95 shrink-0"
                   >
                     <Heart className={`w-6 h-6 ${favorites.some(f => f.videoId === currentTrack.videoId) ? 'fill-current' : ''}`} />
                   </button>
                 )}
                 <button
                   onClick={() => window.dispatchEvent(new CustomEvent('open_playlist_modal', { detail: currentTrack }))}
                   className="text-brand-fg hover:scale-110 transition-transform active:scale-95 shrink-0"
                 >
                   <Plus className="w-6 h-6" />
                 </button>
               </div>
               <p className="font-mono text-xs md:text-base text-brand-muted uppercase truncate mt-1">{currentTrack.artist}</p>
             </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center justify-center gap-6 w-full md:w-auto shrink-0">
             <button className="text-brand-muted hover:text-brand-fg transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-black hover:text-[#f4f4f0] active:scale-95 cursor-pointer p-1">
               <Shuffle className="w-5 h-5" />
             </button>
             
             <button 
               onClick={onSkipPrevious}
               className="text-brand-fg transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-black hover:text-[#f4f4f0] active:scale-95 cursor-pointer p-1"
             >
               <SkipBack className="w-7 h-7" />
             </button>
             
             <button 
               onClick={onPlayPause}
               className="w-16 h-16 border-[2px] border-brand-fg bg-brand-fg text-brand-bg flex items-center justify-center shadow-[4px_4px_0_0_#0D0D0D] transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-black hover:text-[#f4f4f0] active:scale-95 cursor-pointer shrink-0"
             >
               {isPlaying ? (
                 <Pause className="w-8 h-8 fill-current" />
               ) : (
                 <Play className="w-8 h-8 fill-current ml-1" />
               )}
             </button>
             
             <button 
               onClick={onSkipNext}
               className="text-brand-fg transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-black hover:text-[#f4f4f0] active:scale-95 cursor-pointer p-1"
             >
               <SkipForward className="w-7 h-7" />
             </button>
             
             <button className="text-brand-muted hover:text-brand-fg transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-black hover:text-[#f4f4f0] active:scale-95 cursor-pointer p-1">
               <Repeat className="w-5 h-5" />
             </button>
          </div>
        </div>
        {/* --- END ADDED --- */}

        {/* Digital read out panel */}
        <div className="hidden md:grid grid-cols-3 gap-4 font-mono text-[11px]">
          <div className="border-[1.5px] border-brand-fg p-3 bg-brand-surface flex flex-col justify-between">
            <span className="text-brand-muted uppercase">READ RATE:</span>
            <span className="font-bold text-xs mt-1">44.1 kHz / 16bit</span>
          </div>
          <div className="border-[1.5px] border-brand-fg p-3 bg-brand-surface flex flex-col justify-between">
            <span className="text-brand-muted uppercase">DRIVE REELS:</span>
            <span className="font-bold text-xs mt-1">3.18 IPS</span>
          </div>
          <div className="border-[1.5px] border-brand-fg p-3 bg-brand-surface flex flex-col justify-between">
            <span className="text-brand-muted uppercase">INTEGRITY:</span>
            <span className="font-bold text-xs mt-1 text-green-700">100% OK</span>
          </div>
        </div>

      </div>

      {/* Right Block: Live Play Queue & Tracks database */}
      <div className="flex-1 min-h-0 flex flex-col w-full md:w-1/3 md:gap-6">
        
        {/* Play queue card */}
        <div className="flex-1 w-full flex flex-col mt-2 min-h-[200px] overflow-hidden border-2 border-black bg-white md:mt-0 md:border-[1.5px] md:border-brand-fg md:shadow-[4px_4px_0_0_#0D0D0D]">
          
          <div className="flex flex-col flex-1 min-h-0">
            {/* Header selection tabs */}
            <div className="border-b-[1.5px] border-brand-fg bg-brand-surface flex font-mono text-[11px] font-bold uppercase shrink-0">
              <button 
                onClick={() => setActiveQueueTab("upcoming")}
                className={`flex-1 py-3 text-center border-r-[1.5px] border-brand-fg ${
                  activeQueueTab === "upcoming" ? "bg-white" : "hover:bg-white/50"
                }`}
              >
                UPCOMING QUEUE
              </button>
              <button 
                onClick={() => setActiveQueueTab("history")}
                className={`flex-1 py-3 text-center ${
                  activeQueueTab === "history" ? "bg-white" : "hover:bg-white/50"
                }`}
              >
                HISTORY_LOG
              </button>
            </div>

            {/* List of elements */}
            <div className="flex-1 overflow-y-auto p-2 pb-32 flex flex-col gap-2 md:max-h-[340px]">
              {activeQueueTab === "upcoming" ? (
                // Filter other tracks than current
                (queue || []).slice(currentTrackIndex + 1).map((track, i) => (
                  <div 
                    key={track.videoId}
                    onClick={() => onPlayTrack(track, queue)}
                    className="group flex items-center justify-between p-2 border-[1.5px] border-transparent hover:border-brand-fg hover:bg-brand-surface cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 border border-brand-fg bg-white overflow-hidden p-0.5">
                        <img 
                          src={track.thumbnailUrl || undefined} 
                          alt={track.title} 
                          className="w-full h-full object-cover filter grayscale"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-serif text-xs font-bold leading-tight group-hover:underline truncate">
                          {track.title}
                        </p>
                        <p className="font-mono text-[9px] text-brand-muted uppercase truncate mt-0.5">
                          {track.artist}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-brand-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))
              ) : (
                
                (queue || []).slice(0, currentTrackIndex).reverse().length > 0 ? (
                  (queue || []).slice(0, currentTrackIndex).reverse().map((track, i) => (
                    <div 
                      key={track.videoId + '-' + i}
                      onClick={() => onPlayTrack(track, queue)}
                      className="group flex items-center justify-between p-2 border-[1.5px] border-transparent hover:border-brand-fg hover:bg-brand-surface cursor-pointer transition-all opacity-70 hover:opacity-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 border border-brand-fg bg-white overflow-hidden p-0.5">
                          <img 
                            src={track.thumbnailUrl || undefined} 
                            alt={track.title} 
                            className="w-full h-full object-cover filter grayscale"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-serif text-xs font-bold leading-tight group-hover:underline truncate">
                            {track.title}
                          </p>
                          <p className="font-mono text-[9px] text-brand-muted uppercase truncate mt-0.5">
                            {track.artist}
                          </p>
                        </div>
                      </div>
                      <Play className="w-3 h-3 text-brand-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))
                ) : (
                  <div className="font-mono text-[10px] text-brand-muted text-center py-8">
                    NO RECENT SESSION LOGS PRESENT.
                  </div>
                )

              )}
            </div>
          </div>

          {/* Core drive statistics */}
          <div className="border-t-[1.5px] border-brand-fg bg-brand-surface p-4 font-mono text-[10px] text-brand-muted shrink-0 mt-4">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 font-bold">
                <Database className="w-3.5 h-3.5 text-brand-fg" />
                DISK_SPACE_USED:
              </span>
              <span>42.8 MB</span>
            </div>
          </div>

        </div>

      </div>
    </motion.div>
  );
}
