import React, { useState } from "react";
import { Terminal, BellRing, Cpu, Check } from "lucide-react";
import BrutalistModal from "../shared/BrutalistModal";

export default function NotificationSettingsView() {
  // Global Protocol States (Toggles)
  const [emailForwarding, setEmailForwarding] = useState(true);
  const [pushRelay, setPushRelay] = useState(false);
  const [hudAlerts, setHudAlerts] = useState(true);

  // Spatial Event Flag States (Checkboxes)
  const [memberJoin, setMemberJoin] = useState(true);
  const [playbackStart, setPlaybackStart] = useState(true);
  const [archiveUpdate, setArchiveUpdate] = useState(false);

  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  const handleReset = () => {
    setShowResetConfirmModal(true);
  };

  const confirmReset = () => {
    setShowResetConfirmModal(false);
    setEmailForwarding(true);
    setPushRelay(false);
    setHudAlerts(true);
    setMemberJoin(true);
    setPlaybackStart(true);
    setArchiveUpdate(false);
  };

  return (
    <div className="w-full max-w-2xl font-mono mx-auto text-black select-none px-4 md:px-margin-desktop py-6 space-y-8">
      
      {/* Header Panel */}
      <div className="border-b-2 border-black pb-1 mb-2">
        <span className="font-mono text-[10px] text-black uppercase tracking-widest font-bold">
          Config_Subsystem: 04-B
        </span>
      </div>
      <div className="border-b-4 border-black pb-3 mb-8">
        <h1 className="text-3xl font-black tracking-tighter uppercase font-mono">Notification Protocols</h1>
        <p className="text-xs text-black mt-1 uppercase font-bold tracking-widest">
          CONFIGURE COMMUNICATIONS RELAY AND TELEMETRY ALERTS
        </p>
      </div>

      <div className="space-y-8">
        {/* Section 1: Global Protocols (Toggles) */}
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-black flex items-center gap-2 mb-4">
            <Terminal className="w-4 h-4 shrink-0" />
            <span>[ SECTION 01 // GLOBAL PROTOCOLS ]</span>
          </h2>

          {/* Toggle Row 1 */}
          <div className="outset-border border-2 border-black p-4 bg-white flex justify-between items-center gap-4 shadow-[4px_4px_0_0_#0D0D0D]">
            <div className="flex flex-col gap-1">
              <span className="font-bold text-sm uppercase tracking-wide">EMAIL FORWARDING</span>
              <span className="text-[10px] text-black uppercase font-bold tracking-normal leading-normal">
                TRANSMITS WEEKLY ACTIVITY REPLICAS AND ACCOUNT SECURITY TRIGGERS
              </span>
            </div>
            <button 
              onClick={() => setEmailForwarding(!emailForwarding)}
              className={`inset-border border-2 border-black px-4 py-1.5 font-mono text-xs font-bold uppercase transition-colors shrink-0 whitespace-nowrap cursor-pointer ${
                emailForwarding 
                  ? "bg-[#2A4B9B] text-white" 
                  : "bg-[#F1ECE3] text-black"
              }`}
            >
              {emailForwarding ? "ON" : "OFF"}
            </button>
          </div>

          {/* Toggle Row 2 */}
          <div className="outset-border border-2 border-black p-4 bg-white flex justify-between items-center gap-4 shadow-[4px_4px_0_0_#0D0D0D]">
            <div className="flex flex-col gap-1">
              <span className="font-bold text-sm uppercase tracking-wide">PUSH RELAY</span>
              <span className="text-[10px] text-black uppercase font-bold tracking-normal leading-normal">
                DISPATCHES SYSTEM TELEMETRY TO OPERATIVE'S RUNNING DESKTOP ENVIRONMENT
              </span>
            </div>
            <button 
              onClick={() => setPushRelay(!pushRelay)}
              className={`inset-border border-2 border-black px-4 py-1.5 font-mono text-xs font-bold uppercase transition-colors shrink-0 whitespace-nowrap cursor-pointer ${
                pushRelay 
                  ? "bg-[#2A4B9B] text-white" 
                  : "bg-[#F1ECE3] text-black"
              }`}
            >
              {pushRelay ? "ON" : "OFF"}
            </button>
          </div>

          {/* Toggle Row 3 */}
          <div className="outset-border border-2 border-black p-4 bg-white flex justify-between items-center gap-4 shadow-[4px_4px_0_0_#0D0D0D]">
            <div className="flex flex-col gap-1">
              <span className="font-bold text-sm uppercase tracking-wide">HUD ALERTS</span>
              <span className="text-[10px] text-black uppercase font-bold tracking-normal leading-normal">
                ENABLES REAL-TIME INTERACTIVE OVERLAYS AND VIBRANT NOTIFIER FLOATS
              </span>
            </div>
            <button 
              onClick={() => setHudAlerts(!hudAlerts)}
              className={`inset-border border-2 border-black px-4 py-1.5 font-mono text-xs font-bold uppercase transition-colors shrink-0 whitespace-nowrap cursor-pointer ${
                hudAlerts 
                  ? "bg-[#2A4B9B] text-white" 
                  : "bg-[#F1ECE3] text-black"
              }`}
            >
              {hudAlerts ? "ON" : "OFF"}
            </button>
          </div>
        </div>

        {/* Section 2: Spatial Event Flags (Checkboxes) */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-black flex items-center gap-2 mb-4">
            <BellRing className="w-4 h-4 shrink-0" />
            <span>[ SECTION 02 // SPATIAL EVENT FLAGS ]</span>
          </h2>

          {/* List holding container */}
          <div className="inset-border border-2 border-black bg-white p-6 flex flex-col gap-4 shadow-[4px_4px_0_0_#0D0D0D] relative overflow-hidden">
            <div className="halftone-overlay absolute inset-0 opacity-10 pointer-events-none" />
            
            {/* Checkbox item 1 */}
            <div 
              onClick={() => setMemberJoin(!memberJoin)}
              className="flex items-start gap-4 cursor-pointer group relative z-10"
            >
              <div className={`w-5 h-5 border-2 border-black flex items-center justify-center shrink-0 transition-colors ${memberJoin ? "bg-[#2A4B9B]" : "bg-white"}`}>
                {memberJoin && <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold uppercase tracking-tight group-hover:underline">
                  Member_Join_Event
                </span>
                <span className="text-[10px] text-black uppercase font-bold tracking-normal leading-normal">
                  NOTIFICATION FIRES WHEN A GUEST JOINS YOUR SYNCHRONIZATION ROOM
                </span>
              </div>
            </div>

            {/* Checkbox item 2 */}
            <div 
              onClick={() => setPlaybackStart(!playbackStart)}
              className="flex items-start gap-4 cursor-pointer group relative z-10"
            >
              <div className={`w-5 h-5 border-2 border-black flex items-center justify-center shrink-0 transition-colors ${playbackStart ? "bg-[#2A4B9B]" : "bg-white"}`}>
                {playbackStart && <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold uppercase tracking-tight group-hover:underline">
                  Media_Playback_Start
                </span>
                <span className="text-[10px] text-black uppercase font-bold tracking-normal leading-normal">
                  NOTIFICATION FIRES WHEN YOUR CHOSEN STREAM BEGINS SYNCHRONIZING TO ACTIVE GUESTS
                </span>
              </div>
            </div>

            {/* Checkbox item 3 */}
            <div 
              onClick={() => setArchiveUpdate(!archiveUpdate)}
              className="flex items-start gap-4 cursor-pointer group relative z-10"
            >
              <div className={`w-5 h-5 border-2 border-black flex items-center justify-center shrink-0 transition-colors ${archiveUpdate ? "bg-[#2A4B9B]" : "bg-white"}`}>
                {archiveUpdate && <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold uppercase tracking-tight group-hover:underline">
                  Archive_Update_Event
                </span>
                <span className="text-[10px] text-black uppercase font-bold tracking-normal leading-normal">
                  NOTIFICATION FIRES ON DISK SHRED, PROTOCOL AUDIT, OR KEY ROTATION EVENTS
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Technical Metadata Bar */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-widest text-black flex items-center gap-2">
            <Cpu className="w-4 h-4 shrink-0" />
            <span>[ SECTION 03 // DIAGNOSTIC TELEMETRY ]</span>
          </h2>
          
          <div className="border-2 border-black p-4 bg-[#f4f4f0] mechanical-inset flex flex-col gap-2 font-mono">
            <div className="flex justify-between items-center text-[10px] font-bold text-black uppercase tracking-widest">
              <span>BUFFER_STATUS: 100%</span>
              <span>CRC32: 0xFD43A</span>
            </div>
            <div className="w-full h-6 border-2 border-black bg-white relative overflow-hidden flex">
              {/* Blocky fill */}
              {Array.from({ length: 20 }).map((_, index) => (
                <div 
                  key={index} 
                  className="h-full flex-1 border-r border-black bg-[#2A4B9B] last:border-r-0"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Factory Reset (Danger Zone) */}
        <div className="pt-4">
          <button 
            onClick={handleReset}
            className="w-full bg-[#cc0000] text-white border-2 border-black outset-border py-3 font-mono font-bold tracking-widest uppercase hover:bg-red-800 transition-colors active:translate-y-px cursor-pointer"
          >
            [ FACTORY_RESET ]
          </button>
        </div>

      </div>

      <BrutalistModal
        isOpen={showResetConfirmModal}
        onClose={() => setShowResetConfirmModal(false)}
        title="RESET FACTORY DEFAULTS?"
        footer={
          <div className="flex gap-3 w-full">
            <button
              onClick={() => setShowResetConfirmModal(false)}
              className="flex-1 py-2 border-2 border-black bg-white text-black font-bold uppercase hover:bg-black hover:text-white transition-colors cursor-pointer text-xs"
            >
              [ CANCEL ]
            </button>
            <button
              onClick={confirmReset}
              className="flex-1 py-2 border-2 border-[#CC0000] bg-[#CC0000] text-white font-bold uppercase hover:bg-white hover:text-[#CC0000] transition-colors cursor-pointer text-xs"
            >
              [ RESET ]
            </button>
          </div>
        }
      >
        <p className="font-mono text-xs text-black uppercase font-bold">
          WARNING: ALL CUSTOM PROTOCOLS WILL BE RESTORED TO SYSTEM DEFAULTS.
        </p>
      </BrutalistModal>
    </div>
  );
}
