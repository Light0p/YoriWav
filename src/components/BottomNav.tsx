import React from "react";
import { Home, Search, Users, Music, Sliders } from "lucide-react";

interface BottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export default function BottomNav({ currentTab, setCurrentTab }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 w-full h-[56px] bg-brand-surface border-t-2 border-brand-fg z-50 flex items-center justify-around px-2 pb-safe md:max-w-2xl md:left-1/2 md:-translate-x-1/2 md:border-2 md:border-black md:bottom-4 md:shadow-[4px_4px_0_0_#0D0D0D] md:bg-brand-surface">
      <button 
        onClick={() => setCurrentTab("home")}
        className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-black hover:text-[#f4f4f0] active:scale-95 cursor-pointer ${currentTab === "home" ? "text-brand-fg bg-black/5" : "text-brand-muted"}`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[9px] font-mono font-bold uppercase tracking-wide">Home</span>
      </button>
      <button 
        onClick={() => setCurrentTab("tags")}
        className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-black hover:text-[#f4f4f0] active:scale-95 cursor-pointer ${currentTab === "tags" ? "text-brand-fg bg-black/5" : "text-brand-muted"}`}
      >
        <Search className="w-5 h-5" />
        <span className="text-[9px] font-mono font-bold uppercase tracking-wide">Search</span>
      </button>
      <button 
        onClick={() => setCurrentTab("mixer")}
        className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-black hover:text-[#f4f4f0] active:scale-95 cursor-pointer ${currentTab === "mixer" ? "text-brand-fg bg-black/5" : "text-brand-muted"}`}
      >
        <Sliders className="w-5 h-5" />
        <span className="text-[9px] font-mono font-bold uppercase tracking-wide">Mixer</span>
      </button>
      <button 
        onClick={() => setCurrentTab("room")}
        className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-black hover:text-[#f4f4f0] active:scale-95 cursor-pointer ${currentTab === "room" ? "text-brand-fg bg-black/5" : "text-brand-muted"}`}
      >
        <Users className="w-5 h-5" />
        <span className="text-[9px] font-mono font-bold uppercase tracking-wide">Rooms</span>
      </button>
      <button 
        onClick={() => setCurrentTab("library")}
        className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-black hover:text-[#f4f4f0] active:scale-95 cursor-pointer ${currentTab === "library" ? "text-brand-fg bg-black/5" : "text-brand-muted"}`}
      >
        <Music className="w-5 h-5" />
        <span className="text-[9px] font-mono font-bold uppercase tracking-wide">Library</span>
      </button>
    </nav>
  );
}
