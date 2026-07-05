import React, { useState, useEffect } from "react";
import { Play, Heart, Bell } from "lucide-react";
import { TrackModel } from "../types";
import { musicApi } from "../lib/providers/saavnProvider";
import { motion } from "motion/react";
import UserAvatar from "./UserAvatar";


const listContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const listItemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  }
};

interface HomeViewProps {
  favorites?: TrackModel[];
  onToggleFavorite?: (track: TrackModel) => void;
  user: any;
  onPlayTrack: (track: TrackModel, contextQueue?: TrackModel[]) => void;
  onJoinRoom: (roomId: string) => void;
  onCreateRoom: (track: TrackModel) => void;
  setCurrentTab: (tab: string) => void;
  activeRooms: any[];
  onOpenSidebar?: () => void;
}

export default function HomeView({
  user,
  onPlayTrack,
  onJoinRoom,
  onCreateRoom,
  setCurrentTab,
  activeRooms,
  favorites = [],
  onToggleFavorite = () => {},
  onOpenSidebar
}: HomeViewProps) {
    const [homeTracks, setHomeTracks] = useState<any[]>([]);
  const [recentTracks, setRecentTracks] = useState<any[]>([]);

  const loadRecentTracks = () => {
    try {
      const stored = localStorage.getItem("echo_recent_tracks");
      if (stored) {
        setRecentTracks(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Failed to load recent tracks", err);
    }
  };

  useEffect(() => {
    loadRecentTracks();
    window.addEventListener("echo_recent_tracks_updated", loadRecentTracks);
    return () => window.removeEventListener("echo_recent_tracks_updated", loadRecentTracks);
  }, []);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const results = await musicApi.search("Top trending");
        setHomeTracks(results as any);
      } catch (err) {
        console.error("Failed to load home data", err);
      }
    }
    loadHomeData();
  }, []);

    const trending = homeTracks.slice(0, 10);
  const displayRecents = recentTracks.slice(0, 6);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full flex flex-col gap-8 pb-[120px]"
    >
      
      {/* Top Bar - Greeting */}
      <div className="flex flex-col gap-1">
        <h2 className="font-serif text-2xl md:text-3xl font-bold leading-none select-none text-black">
          {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'}
        </h2>
      </div>

            {/* Section 1: Recents (2 Column Grid, Horizontal Rectangles) */}
      <section>
        {displayRecents.length > 0 ? (
          <motion.div 
            variants={listContainerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2"
          >
            {displayRecents.map((track) => (
              <motion.div 
                key={track.videoId}
                variants={listItemVariants}
                onClick={() => onPlayTrack(track, displayRecents.includes(track) ? displayRecents : trending)}
                className="flex items-center gap-3 bg-brand-surface/40 border-[1.5px] border-brand-fg/20 hover:border-brand-fg transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-black hover:text-[#f4f4f0] active:scale-95 cursor-pointer pr-3 overflow-hidden group"
              >
                <div className="w-14 h-14 bg-white border-r-[1.5px] border-brand-fg/20 group-hover:border-brand-fg flex-shrink-0">
                  <img 
                    src={track.thumbnailUrl || undefined} 
                    alt={track.title} 
                    className="w-full h-full object-cover filter grayscale"
                  />
                </div>
                <div className="min-w-0 flex-1 py-1">
                  <p className="font-serif text-sm font-bold leading-tight line-clamp-2">
                    {track.title}
                  </p>
                </div>
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"> 
                   <button className="w-8 h-8 rounded-full bg-brand-fg text-brand-bg flex items-center justify-center hover:scale-105 transition-transform shadow-[2px_2px_0_0_#0D0D0D]">
                      <Play className="w-4 h-4 ml-0.5 fill-current" />
                   </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="w-full border-[1.5px] border-brand-fg bg-brand-surface/20 p-8 flex flex-col justify-center shadow-[4px_4px_0_0_#0D0D0D]">
            <h3 className="font-mono text-sm font-bold tracking-widest text-brand-muted uppercase mb-1">ACTIVITY_LOG</h3>
            <p className="font-serif text-xl font-bold">NO RECENT ACTIVITY.</p>
          </div>
        )}
      </section>

      {/* Section 2: Trending (Horizontal Scroll, Large Squares) */}
      <section>
        <h3 className="font-serif text-xl font-bold mb-4 border-b-[1.5px] border-brand-fg pb-2">
          Made For You
        </h3>
        <motion.div 
          variants={listContainerVariants}
          initial="hidden"
          animate="show"
          className="flex overflow-x-auto gap-4 pb-4 no-scrollbar"
        >
          {trending.map((track) => (
            <motion.div 
              key={track.videoId}
              variants={listItemVariants}
              onClick={() => onPlayTrack(track, displayRecents.includes(track) ? displayRecents : trending)}
              className="flex-shrink-0 w-36 md:w-44 flex flex-col gap-3 group transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] active:scale-95 cursor-pointer"
            >
              <div className="w-full aspect-square border-[1.5px] border-brand-fg bg-brand-surface p-1 relative shadow-[4px_4px_0_0_#0D0D0D] transition-transform group-hover:-translate-y-1 group-hover:shadow-[6px_6px_0_0_#0D0D0D]">
                <img 
                  src={track.thumbnailUrl || undefined} 
                  alt={track.title} 
                  className="w-full h-full object-cover filter grayscale"
                />
                {/* Play Button Overlay */}
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                  <button className="w-10 h-10 rounded-full bg-brand-fg text-brand-bg flex items-center justify-center shadow-[2px_2px_0_0_#0D0D0D]">
                    <Play className="w-4 h-4 ml-0.5 fill-current" />
                  </button>
                </div>
              </div>
              <div>
                <p className="font-serif text-[14px] font-bold leading-tight truncate">
                  {track.title}
                </p>
                <p className="font-mono text-[10px] text-brand-muted mt-1 truncate">
                  {track.artist}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

    </motion.div>
  );
}
