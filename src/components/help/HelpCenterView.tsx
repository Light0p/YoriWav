import React, { useState } from "react";
import { Search, Mail, Phone, ChevronDown } from "lucide-react";

export default function HelpCenterView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "HOW IS DEVICE SYNCHRONIZATION CALCULATED?",
      a: "Device synchronization relies on serverTimestamp() records paired with NTP clock skew corrections. On join, guests query RTDB /.info/serverTimeOffset. When the host issues actions, guests compute target positions using current local offsets: target_pos = host_seek + (elapsed / 1000)."
    },
    {
      q: "WHAT TO DO IF THE AUDIO BUFFER ENCOUNTERS DRIFT?",
      a: "If audio drift between guest and host deviates beyond 2.0 seconds, the SyncEngine automatically forces a corrective seek action. If drift persists, ensure high-fidelity UDP packet throughput, disable browser hardware acceleration overrides, or click [ SYNC ] manual trigger."
    },
    {
      q: "HOW DOES MIXER ATTENUATION EFFECT STREAM QUALITY?",
      a: "The Mixer channels apply independent decibel attenuation natively via Web Audio node filters. High attenuation preserves dynamic headroom but may limit absolute signal gain. Keep master gain settings within stable safe levels to prevent waveform clipping."
    },
    {
      q: "ARE AUDIO STREAMS CACHED LOCALLY ON DISK?",
      a: "Yes. To prevent redundant API calls and optimize host bandwidth, the application employs a client-side localStorage caching layer with a 4-hour TTL (Time-to-Live). This acts cache-first before seeking external stream resolution."
    },
    {
      q: "HOW CAN I DEPLOY MY OWN CUSTOM ECHO ROOM?",
      a: "Custom rooms require an active Firestore record. Authenticate with Google auth, load any digital media into your cue deck, and click 'START_ROOM.EXE'. This allocates a stable room ID hash in the directory."
    }
  ];

  const filteredFaqs = faqs.filter(
    (faq) => 
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-2xl font-mono mx-auto text-black select-none px-4 md:px-margin-desktop py-6 space-y-8 relative">
      <div className="halftone-overlay absolute inset-0 opacity-5 pointer-events-none" />

      {/* Header (The EXE Title) */}
      <div className="pb-3 mb-6 relative z-10">
        <h1 className="text-3xl font-black uppercase font-mono tracking-widest text-black">
          TECHNICAL_MANUAL.EXE
        </h1>
        <p className="text-[10px] text-black mt-1 uppercase font-mono font-bold tracking-widest leading-relaxed">
          OPERATIVE TROUBLESHOOTING GUIDE AND REFERENCE DOCUMENTATION
        </p>
        <div className="border-b-4 border-black w-full mt-4" />
      </div>

      {/* Terminal Search */}
      <div className="mechanical-inset p-4 border-2 border-black bg-white flex items-center gap-3 mb-6 relative z-10">
        <div className="halftone-overlay absolute inset-0 opacity-10 pointer-events-none" />
        <Search className="w-5 h-5 text-black shrink-0 relative z-10" />
        <input 
          type="text"
          placeholder="QUERY DATABASE FOR SOLUTIONS..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent border-none uppercase text-xs font-mono font-bold text-black focus:outline-none relative z-10 placeholder-black/50"
        />
      </div>

      {/* FAQ Accordion (The Core) */}
      <div className="space-y-4 relative z-10">
        {filteredFaqs.length === 0 ? (
          <div className="mechanical-inset p-8 text-center text-xs font-bold uppercase border-2 border-black bg-white">
            NO CORRESPONDING RECORD FOUND IN THE LOCAL DIRECTORY
          </div>
        ) : (
          <div className="flex flex-col gap-y-4">
            {filteredFaqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div 
                  key={index} 
                  className="border-2 border-black bg-white select-none transition-all duration-150"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full p-4 flex items-center justify-between text-left font-mono font-bold text-xs uppercase cursor-pointer"
                  >
                    <span className="tracking-widest pr-4 leading-relaxed">{faq.q}</span>
                    <ChevronDown 
                      className={`w-4 h-4 shrink-0 transition-transform duration-300 text-black ${
                        isOpen ? "transform rotate-180" : ""
                      }`} 
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 border-t-2 border-black pt-4 bg-[#f4f4f0] text-sm font-sans text-black leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Comm-Link Telemetry (Bottom Panel) */}
      <div className="mechanical-outset border-2 border-black p-6 relative overflow-hidden bg-[#f4f4f0] jewel-case mt-8 z-10">
        <div className="halftone-overlay absolute inset-0 opacity-10 pointer-events-none" />
        
        {/* Stamp Box */}
        <div className="absolute top-4 right-4 w-12 h-16 border-2 border-dashed border-black flex items-center justify-center bg-white p-1">
          <div className="w-full h-full border border-black flex flex-col items-center justify-center font-bold text-[8px] tracking-tighter leading-none bg-[#f4f4f0] font-mono text-black">
            <span>ECHO</span>
            <span>POST</span>
          </div>
        </div>

        <div>
          <div className="pr-16">
            <h3 className="font-mono uppercase tracking-widest font-black text-lg text-black mb-1">
              COMMUNICATE PROTOCOL
            </h3>
            <p className="text-[10px] text-black font-mono uppercase font-bold tracking-wider leading-relaxed max-w-md">
              OFFICIAL CORRESPONDENCE AND DIRECT HARDWARE REPAIR TELEMETRY REPLICATOR
            </p>
          </div>

          {/* Horizontal Dot-Divider */}
          <div className="border-t-2 border-dotted border-black my-6" />

          <div className="flex flex-col sm:flex-row gap-6 font-mono text-xs text-black">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#2A4B9B] shrink-0" />
              <span className="font-bold">support@echo.system</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#2A4B9B] shrink-0" />
              <span className="font-bold">1-800-ECHO-MNL</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
