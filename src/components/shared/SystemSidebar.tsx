import React from "react";
import { 
  Home, 
  Heart, 
  Music, 
  Sliders, 
  User, 
  Shield, 
  Bell, 
  HelpCircle, 
  LogOut, 
  LogIn, 
  Menu, 
  X,
  Disc
} from "lucide-react";
import UserAvatar from "../UserAvatar";

interface SystemSidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  user: any;
  onSignIn: () => void;
  onSignOut: () => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
}

export default function SystemSidebar({
  currentTab,
  setCurrentTab,
  user,
  onSignIn,
  onSignOut,
  isMobileOpen = false,
  setIsMobileOpen
}: SystemSidebarProps) {
  
  const systemNav = [
    { id: "settings-account", label: "ACCOUNT", icon: <User className="w-4 h-4" /> },
    { id: "settings-privacy", label: "PRIVACY", icon: <Shield className="w-4 h-4" /> },
    { id: "settings-notifications", label: "NOTIFICATIONS", icon: <Bell className="w-4 h-4" /> },
    { id: "help", label: "HELP MANUAL", icon: <HelpCircle className="w-4 h-4" /> },
  ];

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    if (setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full justify-between p-4 font-mono select-none overflow-y-auto">
      <div>
        {/* ECHO Profile Block */}
        <div className="mechanical-inset p-3 mb-6 relative overflow-hidden jewel-case">
          <div className="halftone-overlay absolute inset-0" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 border-2 border-black bg-white shrink-0 overflow-hidden relative">
              <UserAvatar 
                className="w-full h-full object-cover filter grayscale contrast-125"
                fallbackClassName="text-sm"
                guestFallback="E"
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-[11px] font-bold tracking-tight uppercase truncate">
                {user ? user.displayName || "ECHO_USER" : "GUEST_USER"}
              </h2>
              <p className="text-[9px] text-[#2A4B9B] font-bold uppercase truncate">
                {user ? "ECHO_PRO_MEMBER" : "OFFLINE_MODE"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Categories */}
        <div className="space-y-6">
          {/* System Protocols Section */}
          <div>
            <div className="text-[9px] font-bold text-brand-muted tracking-widest uppercase mb-2 px-2">SYSTEM_PROTOCOLS</div>
            <ul className="space-y-1">
              {systemNav.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 border-2 text-left font-bold text-xs transition-colors duration-100 ${
                        isActive 
                          ? "bg-black text-white border-black" 
                          : "bg-transparent text-black border-transparent hover:bg-black hover:text-[#f4f4f0]"
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Block */}
      <div className="mt-8 space-y-3">
        <div className="mechanical-inset p-2 text-center text-[9px] font-bold text-brand-muted">
          ECHO_SYSTEM_v2.1.0
        </div>
        <div>
          {user ? (
            <button 
              onClick={() => {
                onSignOut();
                if (setIsMobileOpen) setIsMobileOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 border-2 border-black bg-[#CC0000] text-white p-2 font-bold text-xs hover:bg-black hover:text-[#CC0000]"
            >
              <LogOut className="w-4 h-4" />
              <span>EJECT_USER</span>
            </button>
          ) : (
            <button 
              onClick={() => {
                onSignIn();
                if (setIsMobileOpen) setIsMobileOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 border-2 border-black bg-black text-white p-2 font-bold text-xs hover:bg-[#F5F0E8] hover:text-black"
            >
              <LogIn className="w-4 h-4" />
              <span>INSERT_USER</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={() => setIsMobileOpen && setIsMobileOpen(false)} />
      {/* Drawer panel */}
      <aside className={`absolute top-0 left-0 w-64 h-full border-r-2 border-black mechanical-outset z-50 transition-transform duration-300 transform bg-[#F5F0E8] ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="halftone-overlay absolute inset-0 pointer-events-none" />
        <div className="absolute top-2 right-2 z-50">
          <button 
            onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
            className="p-1 border-2 border-black bg-white hover:bg-black hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <SidebarContent />
      </aside>
    </div>
  );
}
