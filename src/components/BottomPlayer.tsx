import React, { useState } from "react";
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  Heart,
  Shuffle,
  Repeat
} from "lucide-react";
import { TrackModel } from "../types";

interface BottomPlayerProps {
  favorites?: import("../types").TrackModel[];
  onToggleFavorite?: (track: import("../types").TrackModel) => void;
  currentTrack: TrackModel | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onSkipNext: () => void;
  onSkipPrevious: () => void;
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  isHost: boolean;
  activeRoomId: string | null;
  onNavigateToPlayer: () => void;
}

export default function BottomPlayer({
  currentTrack,
  isPlaying,
  onPlayPause,
  onSkipNext,
  onSkipPrevious,
  currentTime,
  duration,
  onSeek,
  volume,
  onVolumeChange,
  isHost,
  activeRoomId,
  onNavigateToPlayer,
  favorites = [],
  onToggleFavorite
}: BottomPlayerProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(1);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleVolumeToggle = () => {
    if (isMuted) {
      setIsMuted(false);
      onVolumeChange(prevVolume);
    } else {
      setPrevVolume(volume);
      setIsMuted(true);
      onVolumeChange(0);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeRoomId && !isHost) {
      // Guest cannot seek in synchronous listening room
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const clickPercentage = clickX / width;
    const seekTime = clickPercentage * duration;
    onSeek(seekTime);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (!currentTrack) return null;

  return (
    <footer className="fixed bottom-[56px] md:bottom-0 left-0 w-full z-50 flex flex-col justify-center px-2 md:px-4 lg:px-8 bg-brand-surface border-t-2 md:border-t-4 border-solid md:border-double border-brand-fg h-16 md:h-20 lg:h-24">
      
      {/* 
        ==============================
        MOBILE LAYOUT (< 768px)
        ==============================
      */}
      <div className="flex md:hidden items-center justify-between w-full h-full">
        {/* Track Info */}
        <div 
          onClick={onNavigateToPlayer}
          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
        >
          <div className="w-10 h-10 border border-brand-fg bg-white p-0.5 shrink-0">
            <img 
              src={currentTrack.thumbnailUrl || undefined} 
              alt={currentTrack.title} 
              className="w-full h-full object-cover filter grayscale contrast-125"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-serif text-[13px] font-bold leading-tight truncate">
              {currentTrack.title}
            </p>
            <p className="font-mono text-[9px] text-brand-muted uppercase truncate">
              {currentTrack.artist}
            </p>
          </div>
        </div>
        
        {/* Playback Controls */}
        <div className="flex items-center gap-4 shrink-0 pl-2">
          {favorites && onToggleFavorite && (
            <button 
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(currentTrack); }}
              className="w-8 h-8 flex items-center justify-center text-brand-fg transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-black hover:text-[#f4f4f0] active:scale-95 cursor-pointer"
            >
              <Heart className={`w-4 h-4 ${favorites.some(f => f.videoId === currentTrack.videoId) ? 'fill-current' : ''}`} />
            </button>
          )}
          <button 
            aria-label="Previous" 
            onClick={(e) => { e.stopPropagation(); onSkipPrevious(); }}
            className="w-8 h-8 flex items-center justify-center text-brand-fg transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-black hover:text-[#f4f4f0] active:scale-95 cursor-pointer"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button 
            aria-label={isPlaying ? "Pause" : "Play"} 
            onClick={(e) => { e.stopPropagation(); onPlayPause(); }}
            className="w-8 h-8 border-[1.5px] border-brand-fg flex items-center justify-center bg-brand-surface hover:bg-brand-fg hover:text-brand-bg transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-black hover:text-[#f4f4f0] active:scale-95 cursor-pointer shadow-[2px_2px_0_0_#0D0D0D]"
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            )}
          </button>
          <button 
            aria-label="Next" 
            onClick={(e) => { e.stopPropagation(); onSkipNext(); }}
            className="w-8 h-8 flex items-center justify-center text-brand-fg transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-black hover:text-[#f4f4f0] active:scale-95 cursor-pointer"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar (Mobile) - Very thin bar at the absolute bottom */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-brand-fg/10 md:hidden pointer-events-none">
         <div 
           className="h-full bg-brand-fg transition-all duration-300 linear"
           style={{ width: `${progressPercent}%` }}
         />
      </div>


      {/* 
        ==============================
        TABLET & DESKTOP LAYOUT (>= 768px)
        ==============================
      */}
      <div className="hidden md:flex items-center justify-between w-full h-full">
        {/* Track Info (Left) */}
        <div className="flex items-center gap-3 lg:gap-4 w-1/4 min-w-0 pr-4">
          <div 
            onClick={onNavigateToPlayer}
            className="w-10 h-10 lg:w-12 lg:h-12 border-[1.5px] border-brand-fg bg-white p-0.5 cursor-pointer jewel-case hover:scale-105 transition-transform shrink-0"
          >
            <img 
              src={currentTrack.thumbnailUrl || undefined} 
              alt={currentTrack.title} 
              className="w-full h-full object-cover filter grayscale contrast-125"
            />
          </div>
          <div className="min-w-0">
            <p 
              onClick={onNavigateToPlayer}
              className="font-serif text-[12px] lg:text-[14px] font-bold leading-tight lg:leading-none truncate hover:underline cursor-pointer"
            >
              {currentTrack.title}
            </p>
            <p className="font-mono text-[9px] lg:text-[10px] text-brand-muted uppercase mt-1 truncate">
              {currentTrack.artist}
            </p>
          </div>
          <button 
            onClick={() => onToggleFavorite && onToggleFavorite(currentTrack)}
            className="hidden lg:block ml-2 text-brand-fg p-1 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-black hover:text-[#f4f4f0] active:scale-95 cursor-pointer"
          >
            <Heart className="w-4 h-4" fill={favorites.some(f => f.videoId === currentTrack.videoId) ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Playback Controls & Progress (Center) */}
        <div className="flex flex-col items-center justify-center w-2/4 px-2">
          {/* Action Button Row */}
          <div className="flex items-center gap-2 lg:gap-4 font-mono text-xs font-bold mb-1.5 lg:mb-2">
            <button 
              aria-label="Shuffle" 
              onClick={() => alert("RANDOM PLAYBACK SELECTION ENGAGED.")}
              className="hidden lg:block text-brand-muted p-1 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-black hover:text-[#f4f4f0] active:scale-95 cursor-pointer"
            >
              <Shuffle className="w-4 h-4" />
            </button>
            
            <button 
              aria-label="Back" 
              onClick={onSkipPrevious}
              className="text-brand-fg p-1 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-black hover:text-[#f4f4f0] active:scale-95 cursor-pointer"
            >
              <SkipBack className="w-4 lg:w-4.5 h-4 lg:h-4.5" />
            </button>
            
            {/* Core play/pause knob */}
            <button 
              aria-label={isPlaying ? "Pause" : "Play"} 
              onClick={onPlayPause}
              className="btn-brutalist w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center bg-brand-fg text-brand-bg transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-black hover:text-[#f4f4f0] active:scale-95 cursor-pointer shrink-0"
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 lg:w-4 lg:h-4 fill-current" />
              ) : (
                <Play className="w-3.5 h-3.5 lg:w-4 lg:h-4 fill-current ml-0.5" />
              )}
            </button>
            
            <button 
              aria-label="Next" 
              onClick={onSkipNext}
              className="text-brand-fg p-1 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-black hover:text-[#f4f4f0] active:scale-95 cursor-pointer"
            >
              <SkipForward className="w-4 lg:w-4.5 h-4 lg:h-4.5" />
            </button>

            <button 
              aria-label="Repeat" 
              onClick={() => alert("STATIONARY ROTATION REPEAT RE-ENGAGED.")}
              className="hidden lg:block text-brand-muted p-1 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-black hover:text-[#f4f4f0] active:scale-95 cursor-pointer"
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Scrub Bar */}
          <div className="flex items-center gap-2 lg:gap-3 w-full max-w-md">
            <span className="font-mono text-[9px] lg:text-[10px] text-brand-fg w-6 lg:w-8 text-right">
              {formatTime(currentTime)}
            </span>
            
            <div 
              onClick={handleProgressClick}
              className={`flex-1 h-4 lg:h-6 border border-brand-fg bg-brand-surface/30 relative flex items-center px-1 lg:px-2 overflow-hidden ${
                activeRoomId && !isHost ? "cursor-not-allowed opacity-80" : "cursor-pointer"
              }`}
            >
              {/* Filled Progress Area */}
              <div 
                className="absolute left-0 top-0 bottom-0 bg-brand-fg/20 pointer-events-none transition-all duration-300 linear"
                style={{ width: `${progressPercent}%` }}
              />
              {/* Sharp Brutalist Playhead Indicator */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-brand-fg pointer-events-none transition-all duration-300 linear"
                style={{ left: `${progressPercent}%` }}
              />
            </div>
            <span className="font-mono text-[9px] lg:text-[10px] text-brand-muted w-6 lg:w-8 text-left">
              {formatTime(duration || currentTrack.durationSeconds)}
            </span>
          </div>
        </div>

        {/* Volume & Details actions (Right block - Hidden on md, visible on lg) */}
        <div className="w-1/4 flex justify-end pl-4">
          <div className="hidden lg:flex items-center gap-4">
            <button 
              onClick={handleVolumeToggle}
              className="text-brand-muted hover:text-brand-fg"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4.5 h-4.5" /> : <Volume2 className="w-4.5 h-4.5" />}
            </button>
            
            {/* Custom volume sliding bar */}
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const nv = parseFloat(e.target.value);
                onVolumeChange(nv);
                if (nv > 0) setIsMuted(false);
              }}
              className="w-20 accent-brand-fg cursor-pointer h-1 border-[1.5px] border-brand-fg bg-brand-surface"
            />
            {activeRoomId && (
              <div className="ml-2 px-2 py-0.5 bg-brand-fg text-brand-bg text-[9px] font-mono font-bold uppercase tracking-wider whitespace-nowrap">
                ROOM LINKED
              </div>
            )}
          </div>
          
          {/* Tablet mode Room Linked Indicator */}
          {activeRoomId && (
            <div className="hidden md:flex lg:hidden items-center justify-end w-full">
              <div className="px-1 py-0.5 bg-brand-fg text-brand-bg text-[8px] font-mono font-bold uppercase tracking-wider text-center">
                LINKED
              </div>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
