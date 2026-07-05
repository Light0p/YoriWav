import React from "react";
import { 
  Home, 
  Heart, 
  Music, 
  Disc, 
  Sliders, 
  Tag, 
  Settings, 
  LogOut,
  LogIn
} from "lucide-react";
import { auth } from "../firebase";
import UserAvatar from "./UserAvatar";


interface SidebarProps {
  className?: string;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  user: any;
  onSignIn: () => void;
  onSignOut: () => void;
}

export default function Sidebar({
  currentTab,
  setCurrentTab,
  user,
  onSignIn,
  onSignOut,
  className
}: SidebarProps) {
  const tabs = [
    { id: "home", label: "Home", icon: <Home className="w-5 h-5 lg:w-4 lg:h-4" /> },
    { id: "library", label: "Library", icon: <Music className="w-5 h-5 lg:w-4 lg:h-4" /> },
    { id: "radio", label: "Radio", icon: <Disc className="w-5 h-5 lg:w-4 lg:h-4" /> },
    { id: "mixer", label: "Mixer", icon: <Sliders className="w-5 h-5 lg:w-4 lg:h-4" /> },
    { id: "tags", label: "Tags", icon: <Tag className="w-5 h-5 lg:w-4 lg:h-4" /> },
  ];

  return (
    <nav className={className || "hidden md:flex flex-col h-full w-20 lg:w-64 border-r-[1.5px] border-brand-fg bg-brand-surface flex-shrink-0 justify-between z-30 pt-8 pb-4 transition-all duration-300"}>
      <div>
        {/* Profile Info Header */}
        <div className="px-4 lg:px-6 mb-8 flex flex-col items-center lg:items-start lg:flex-row gap-3">
          <div 
            className="w-10 h-10 border-[1.5px] border-brand-fg bg-white cursor-pointer overflow-hidden jewel-case hover:scale-105 transition-transform shrink-0"
            onClick={() => setCurrentTab("profile")}
          >
            <UserAvatar 
              className="w-full h-full object-cover filter grayscale contrast-125"
              fallbackClassName="text-sm"
              guestFallback="E"
            />
          </div>
          <div className="hidden lg:block overflow-hidden">
            <h1 className="font-serif text-xl font-bold leading-none tracking-tight truncate">System</h1>
            <p className="font-mono text-[10px] text-brand-muted mt-1 truncate">v2.0.4-stable</p>
          </div>
        </div>

        {/* Tab Items */}
        <ul className="flex flex-col gap-1 px-2 font-mono text-xs uppercase font-bold">
          {tabs.map((tab) => (
            <li key={tab.id}>
              <button
                onClick={() => setCurrentTab(tab.id)}
                className={`w-full flex items-center justify-center lg:justify-start gap-3 p-2 lg:px-4 lg:py-2 border-[1.5px] transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-black hover:text-[#f4f4f0] active:scale-95 cursor-pointer ${
                  currentTab === tab.id
                    ? "bg-brand-fg text-brand-bg border-brand-fg"
                    : "text-brand-fg border-transparent hover:bg-brand-surface/80"
                }`}
                title={tab.label}
              >
                {tab.icon}
                <span className="hidden lg:inline">{tab.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="px-2 lg:px-4">
        <button 
          onClick={() => alert("PREMIUM SUBSCRIBER ACTIVATED. ZERO ADS GRANTED.")}
          className="w-full mb-4 border-[1.5px] border-brand-fg bg-brand-surface py-2 font-mono text-[10px] lg:text-[11px] font-bold uppercase tracking-widest text-brand-fg transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-black hover:text-[#f4f4f0] active:scale-95 cursor-pointer overflow-hidden"
          title="GO PREMIUM"
        >
          <span className="hidden lg:inline">GO PREMIUM</span>
          <span className="lg:hidden">PRO</span>
        </button>
        <ul className="flex flex-col gap-1 font-mono text-[11px] text-brand-muted uppercase">
          <li>
            <button 
              onClick={() => setCurrentTab("profile")}
              className="w-full flex justify-center lg:justify-start items-center gap-3 p-2 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-black hover:text-[#f4f4f0] active:scale-95 cursor-pointer"
              title="Profile Settings"
            >
              <Settings className="w-4 h-4 lg:w-3.5 lg:h-3.5 shrink-0" />
              <span className="hidden lg:inline truncate">Profile Settings</span>
            </button>
          </li>
          <li>
            {user ? (
              <button 
                onClick={onSignOut}
                className="w-full flex justify-center lg:justify-start items-center gap-3 p-2 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-black hover:text-[#f4f4f0] active:scale-95 cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4 lg:w-3.5 lg:h-3.5 shrink-0" />
                <span className="hidden lg:inline truncate">Eject (Logout)</span>
              </button>
            ) : (
              <button 
                onClick={onSignIn}
                className="w-full flex justify-center lg:justify-start items-center gap-3 p-2 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-black hover:text-[#f4f4f0] active:scale-95 cursor-pointer"
                title="Login"
              >
                <LogIn className="w-4 h-4 lg:w-3.5 lg:h-3.5 shrink-0" />
                <span className="hidden lg:inline truncate">Insert (Login)</span>
              </button>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}
