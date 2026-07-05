import React, { useState, useEffect } from "react";
import { User, ShieldAlert, Award, Calendar, CreditCard } from "lucide-react";
import { auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";

interface AccountSettingsViewProps {
  user?: any;
}

export default function AccountSettingsView({ user: initialUser }: AccountSettingsViewProps) {
  const [localUser, setLocalUser] = useState<any>(initialUser || auth.currentUser);
  const [loading, setLoading] = useState(!initialUser && !auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLocalUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const systemIdValue = loading ? "AWAITING_AUTH..." : (localUser?.uid || "OFFLINE_GUEST_4243");
  const displayNameValue = loading ? "AWAITING_AUTH..." : (localUser?.displayName || "UNKNOWN_USER");
  const emailValue = loading ? "AWAITING_AUTH..." : (localUser?.email || "N/A@ECHO.SYSTEM");

  return (
    <div className="w-full max-w-2xl font-mono mx-auto text-black select-none px-4 md:px-margin-desktop py-6 space-y-8">
      {/* Header */}
      <div className="border-b-4 border-black pb-3 mb-8">
        <h1 className="text-3xl font-bold tracking-tighter uppercase font-mono">ACCOUNT_SETTINGS.EXE</h1>
        <p className="text-xs text-black mt-1 uppercase font-mono font-bold tracking-widest">
          MANAGE SYSTEM IDENTITY AND ACTIVE PROTOCOLS
        </p>
      </div>

      <div className="space-y-8">
        {/* Section 1: Identity Details */}
        <div className="mechanical-outset p-6 border-2 border-black relative overflow-hidden bg-[#f4f4f0] jewel-case flex flex-col">
          <div className="halftone-overlay absolute inset-0" />
          <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-black mb-4 flex items-center gap-2 relative z-10">
            <User className="w-4 h-4 shrink-0" />
            <span>[ SECTION 01 // IDENTITY DETAILS ]</span>
          </h2>

          <div className="space-y-4 relative z-10 flex flex-col">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-black">
                SYSTEM_ID
              </label>
              <div className="mechanical-inset p-3 border-2 border-black bg-white flex items-center">
                <input
                  type="text"
                  value={systemIdValue}
                  readOnly
                  className="w-full bg-transparent opacity-80 outline-none cursor-default text-xs font-bold text-black font-mono break-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-black">
                  DISPLAY_NAME
                </label>
                <div className="mechanical-inset p-3 border-2 border-black bg-white flex items-center">
                  <input
                    type="text"
                    value={displayNameValue}
                    readOnly
                    className="w-full bg-transparent opacity-80 outline-none cursor-default text-xs font-bold text-black font-mono"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-black">
                  EMAIL_ADDRESS
                </label>
                <div className="mechanical-inset p-3 border-2 border-black bg-white flex items-center">
                  <input
                    type="text"
                    value={emailValue}
                    readOnly
                    className="w-full bg-transparent opacity-80 outline-none cursor-default text-xs font-bold text-black font-mono truncate"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={() => alert("PHOTO_SYNCHRONIZATION_ENGAGED. SELECT NEW ARCHIVE PHOTO.")}
              className="border-2 border-black bg-black text-white px-3 py-2 text-xs font-mono font-bold hover:bg-white hover:text-black transition-colors self-end mt-4 w-full md:w-auto"
            >
              UPDATE_PHOTO.EXE
            </button>
          </div>
        </div>

        {/* Section 2: Membership Card */}
        <div className="mechanical-outset border-2 border-black relative overflow-hidden bg-[#f4f4f0] jewel-case p-6">
          <div className="halftone-overlay absolute inset-0" />
          <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-black mb-4 flex items-center gap-2 relative z-10">
            <Award className="w-4 h-4 shrink-0" />
            <span>[ SECTION 02 // MEMBERSHIP STATUS ]</span>
          </h2>

          {/* Outer Wrapper with mechanical-inset class and padding */}
          <div className="mechanical-inset p-4 border-2 border-black bg-white relative z-10">
            {/* The Inner Card - Stark Off-White */}
            <div className="border-2 border-black p-6 bg-[#f4f4f0] relative overflow-hidden">
              <div className="halftone-overlay absolute inset-0 opacity-10" />
              
              {/* Top Row (Protocol & Badge) */}
              <div className="flex justify-between items-start relative z-10">
                <div className="text-xs font-mono uppercase text-black font-bold tracking-widest">
                  ECHO SYSTEM PROTOCOL
                </div>
                <div className="border border-black px-2 py-0.5 text-[10px] font-mono tracking-widest text-black font-bold uppercase">
                  [ STABLE_SYS ]
                </div>
              </div>

              {/* Main Title */}
              <h3 className="text-2xl md:text-3xl font-black uppercase text-black font-mono my-4 relative z-10">
                ECHO PRO MEMBER
              </h3>

              {/* Bottom Row (Date & Credits) */}
              <div className="grid grid-cols-2 gap-4 mt-6 relative z-10 font-mono">
                <div className="flex flex-col gap-1">
                  <div className="text-[9px] font-mono font-bold uppercase tracking-widest text-black">
                    EXPIRATION_DATE
                  </div>
                  <div className="font-bold flex items-center gap-1.5 mt-1 text-black text-xs">
                    <Calendar className="w-3.5 h-3.5 text-black shrink-0" />
                    <span>31 DEC 2026</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-[9px] font-mono font-bold uppercase tracking-widest text-black">
                    MEMBERS_CREDITS
                  </div>
                  <div className="font-bold flex items-center gap-1.5 mt-1 text-black text-xs">
                    <CreditCard className="w-3.5 h-3.5 text-black shrink-0" />
                    <span>999.00 credits</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Security */}
        <div className="mechanical-outset p-6 border-2 border-black relative overflow-hidden bg-[#f4f4f0] jewel-case">
          <div className="halftone-overlay absolute inset-0" />
          <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-black mb-4 flex items-center gap-2 relative z-10">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>[ SECTION 03 // SECURITY PROTOCOLS ]</span>
          </h2>

          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between gap-4 p-4 border-2 border-black bg-white text-black">
              <div className="flex flex-col gap-1 min-w-0">
                <div className="text-xs font-mono font-bold uppercase tracking-widest truncate">MASTER PASSWORD</div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-black opacity-80 truncate">
                  PROTECTS LOCAL REPLICAS AND KEYS
                </div>
              </div>
              <button 
                onClick={() => alert("PASSWORD_RE-KEY_DECOUPLED_SUCCESSFULLY.")}
                className="border-2 border-black bg-[#F5F0E8] px-3 py-1.5 text-xs font-mono font-bold hover:bg-black hover:text-white text-black whitespace-nowrap shrink-0 transition-colors"
              >
                [ MANAGE ]
              </button>
            </div>

            <div className="flex items-center justify-between gap-4 p-4 border-2 border-black bg-white text-black">
              <div className="flex flex-col gap-1 min-w-0">
                <div className="text-xs font-mono font-bold uppercase tracking-widest truncate">TWO-FACTOR AUTHENTICATION (2FA)</div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-black opacity-80 truncate">
                  STATUS: ACTIVE // TOTP GENERATOR
                </div>
              </div>
              <button 
                onClick={() => alert("TOTP_RELAY_AUTHENTICATED.")}
                className="border-2 border-black bg-[#F5F0E8] px-3 py-1.5 text-xs font-mono font-bold hover:bg-black hover:text-white text-black whitespace-nowrap shrink-0 transition-colors"
              >
                [ MANAGE ]
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
