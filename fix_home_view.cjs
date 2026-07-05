const fs = require('fs');

const code = `import React, { useState, useEffect } from "react";
import { Play, Heart, Bell } from "lucide-react";
import { TrackModel } from "../types";
import { musicProvider } from "../lib/providers";

interface HomeViewProps {
  favorites?: string[];
  onToggleFavorite?: (id: string) => void;
  user: any;
  onPlayTrack: (track: TrackModel) => void;
  onJoinRoom: (roomId: string) => void;
  onCreateRoom: (track: TrackModel) => void;
  setCurrentTab: (tab: string) => void;
  activeRooms: any[];
}

export default function HomeView({
  user,
  onPlayTrack,
  onJoinRoom,
  onCreateRoom,
  setCurrentTab,
  activeRooms,
  favorites = [],
  onToggleFavorite = () => {}
}: HomeViewProps) {
  const [homeTracks, setHomeTracks] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    async function loadHomeData() {
      try {
        const results = await musicProvider.search("Top trending");
        setHomeTracks(results as any);
      } catch (err) {
        console.error("Failed to load home data", err);
      }
    }
    loadHomeData();
  }, []);

  const filters = ["All", "Music", "Podcasts", "Live Events"];
  const recents = homeTracks.slice(0, 6);
  const trending = homeTracks.slice(6, 16);

  return (
    <div className="w-full flex flex-col gap-8">
      
      {/* Top Bar - Header & Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="font-serif text-2xl md:text-3xl font-bold leading-none">
            {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'}
          </h2>
          <div className="flex items-center gap-3">
            <button className="w-8 h-8 flex items-center justify-center hover:bg-brand-surface border-[1.5px] border-transparent hover:border-brand-fg transition-colors rounded-full">
              <Bell className="w-4.5 h-4.5" />
            </button>
            <div className="w-8 h-8 border-[1.5px] border-brand-fg overflow-hidden rounded-full bg-white">
              {user ? (
                <img src={user.photoUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuD7YlCdtrBmuwOi73Fou1lgM2_B5_3y47mYlYc9n8IUKFbMHFSjtChgbhSjwqVO---m2sueCG0QMmDzmFGrNA5lLfXCXm0X-Qm-uGmhSYxDdTacvpGQaoGYHE-s4qv8jY--fNiXuzAu6iJcfnRoHKr3C2asO4pq3AsWlIhZr6kFhrUiWCFnUodd5LQzmZtvBDRPabkD2JSE-RFos6YBbPd9ZUbeGBEHTlzlfElddnLp_7YCgEonj88Etw"} alt="User" className="w-full h-full object-cover filter grayscale" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-mono text-xs font-bold">U</div>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {filters.map(filter => (
            <button 
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={\`px-4 py-1.5 rounded-full font-mono text-xs font-bold border-[1.5px] transition-colors whitespace-nowrap \${
                activeFilter === filter 
                  ? "bg-brand-fg text-brand-bg border-brand-fg" 
                  : "bg-brand-surface/40 text-brand-fg border-brand-fg/30 hover:border-brand-fg"
              }\`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Section 1: Recents (2 Column Grid, Horizontal Rectangles) */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {recents.map((track) => (
            <div 
              key={track.videoId}
              onClick={() => onPlayTrack(track)}
              className="flex items-center gap-3 bg-brand-surface/40 hover:bg-brand-surface border-[1.5px] border-brand-fg/20 hover:border-brand-fg transition-colors cursor-pointer pr-3 overflow-hidden group"
            >
              <div className="w-14 h-14 bg-white border-r-[1.5px] border-brand-fg/20 group-hover:border-brand-fg flex-shrink-0">
                <img 
                  src={track.thumbnailUrl || undefined} 
                  alt={track.title} 
                  className="w-full h-full object-cover filter grayscale"
                />
              </div>
              <div className="min-w-0 flex-1 py-1">
                <p className="font-serif text-[13px] font-bold leading-tight truncate">
                  {track.title}
                </p>
              </div>
              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button className="w-8 h-8 rounded-full bg-brand-fg text-brand-bg flex items-center justify-center hover:scale-105 transition-transform shadow-[2px_2px_0_0_#0D0D0D]">
                   <Play className="w-4 h-4 ml-0.5 fill-current" />
                 </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2: Trending (Horizontal Scroll, Large Squares) */}
      <section>
        <h3 className="font-serif text-xl font-bold mb-4 border-b-[1.5px] border-brand-fg pb-2">
          Made For You
        </h3>
        <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
          {trending.map((track) => (
            <div 
              key={track.videoId}
              onClick={() => onPlayTrack(track)}
              className="flex-shrink-0 w-36 md:w-44 flex flex-col gap-3 group cursor-pointer"
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
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
`
fs.writeFileSync('src/components/HomeView.tsx', code);
