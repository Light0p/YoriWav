import React, { useState, useEffect } from "react";
import { Shield, Skull } from "lucide-react";
import { auth, db } from "../../firebase";
import { onAuthStateChanged, deleteUser } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export default function PrivacySettingsView() {
  const [publicPresence, setPublicPresence] = useState(true);
  const [discoveryIndex, setDiscoveryIndex] = useState(true);
  const [privateMode, setPrivateMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid, "privacy", "settings");
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setPublicPresence(data.publicPresence ?? true);
            setDiscoveryIndex(data.discoveryIndex ?? true);
            setPrivateMode(data.privateMode ?? false);
          } else {
            // Initialize if none exist
            await setDoc(docRef, {
              publicPresence: true,
              discoveryIndex: true,
              privateMode: false
            });
            setPublicPresence(true);
            setDiscoveryIndex(true);
            setPrivateMode(false);
          }
        } catch (error) {
          console.error("Error fetching privacy settings:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleToggle = async (field: "publicPresence" | "discoveryIndex" | "privateMode", currentValue: boolean) => {
    const newValue = !currentValue;
    
    // Optimistic UI update
    if (field === "publicPresence") setPublicPresence(newValue);
    if (field === "discoveryIndex") setDiscoveryIndex(newValue);
    if (field === "privateMode") setPrivateMode(newValue);

    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, "users", user.uid, "privacy", "settings");
        await updateDoc(docRef, {
          [field]: newValue
        });
      } catch (error) {
        console.error(`Error updating ${field}:`, error);
        // Rollback
        if (field === "publicPresence") setPublicPresence(currentValue);
        if (field === "discoveryIndex") setDiscoveryIndex(currentValue);
        if (field === "privateMode") setPrivateMode(currentValue);
      }
    }
  };

  const handleTerminateAccount = async () => {
    if (confirm("Are you sure?")) {
      const user = auth.currentUser;
      if (user) {
        try {
          await deleteUser(user);
          alert("ECHO ACCOUNT TERMINATED. SYSTEM LOGOUT ENGAGED.");
          window.location.reload();
        } catch (error: any) {
          console.error("Account termination failed:", error);
          if (error.code === "auth/requires-recent-login") {
            alert("SECURITY TRIGGER: Please sign out and sign in again before terminating your account.");
          } else {
            alert(`TERMINATION_ERROR: ${error.message}`);
          }
        }
      } else {
        alert("NO ACTIVE AUTH SESSION TO TERMINATE.");
      }
    }
  };

  return (
    <div className="w-full max-w-2xl font-mono mx-auto text-black select-none px-4 md:px-margin-desktop py-6 space-y-8">
      {/* Header */}
      <div className="border-b-4 border-black pb-4 mb-8">
        <h1 className="text-3xl font-black uppercase font-mono tracking-tighter">PRIVACY_PROTOCOLS.EXE</h1>
        <p className="font-serif italic text-sm text-black mt-1">"Your data is your property."</p>
      </div>

      <div className="space-y-8">
        {/* Section 1: [ SYSTEM PRIVACY PRESETS ] */}
        <div className="mechanical-inset p-6 border-2 border-black bg-[#f4f4f0] relative overflow-hidden">
          <div className="halftone-overlay absolute inset-0 opacity-10" />
          
          <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-black mb-6 flex items-center gap-2 relative z-10">
            <Shield className="w-4 h-4 shrink-0" />
            <span>[ SYSTEM PRIVACY PRESETS ]</span>
          </h2>

          <div className="flex flex-col gap-4 relative z-10">
            {/* Toggle 1 */}
            <div className="flex justify-between items-center py-2 border-b border-black/10">
              <div className="w-3/4 flex flex-col gap-1">
                <span className="font-bold text-sm uppercase tracking-wide">PUBLIC PRESENCE</span>
                <span className="text-[10px] text-black uppercase font-bold tracking-normal leading-normal">
                  ALLOW OTHERS TO OBSERVE WHAT YOU ARE LISTENING TO IN REAL-TIME
                </span>
              </div>
              <button 
                onClick={() => handleToggle("publicPresence", publicPresence)} 
                className="w-[48px] h-[24px] border-2 border-black bg-[#F1ECE3] relative shrink-0 cursor-pointer"
              >
                <div className={"absolute top-0 bottom-0 w-[20px] border-l-2 border-black transition-all " + (publicPresence ? "right-0 bg-[#2A4B9B]" : "left-0 bg-white border-r-2 border-l-0")} />
              </button>
            </div>

            {/* Toggle 2 */}
            <div className="flex justify-between items-center py-2 border-b border-black/10">
              <div className="w-3/4 flex flex-col gap-1">
                <span className="font-bold text-sm uppercase tracking-wide">DISCOVERY INDEX</span>
                <span className="text-[10px] text-black uppercase font-bold tracking-normal leading-normal">
                  LISTS YOUR VIBEROOM SESSIONS IN THE PUBLIC DIRECTORY ENGINE
                </span>
              </div>
              <button 
                onClick={() => handleToggle("discoveryIndex", discoveryIndex)} 
                className="w-[48px] h-[24px] border-2 border-black bg-[#F1ECE3] relative shrink-0 cursor-pointer"
              >
                <div className={"absolute top-0 bottom-0 w-[20px] border-l-2 border-black transition-all " + (discoveryIndex ? "right-0 bg-[#2A4B9B]" : "left-0 bg-white border-r-2 border-l-0")} />
              </button>
            </div>

            {/* Toggle 3 */}
            <div className="flex justify-between items-center py-2">
              <div className="w-3/4 flex flex-col gap-1">
                <span className="font-bold text-sm uppercase tracking-wide">PRIVATE MODE</span>
                <span className="text-[10px] text-black uppercase font-bold tracking-normal leading-normal">
                  FORCE STRICT ENCRYPTION AND DE-LINK TRACK PLAY HISTORY INSTANTLY
                </span>
              </div>
              <button 
                onClick={() => handleToggle("privateMode", privateMode)} 
                className="w-[48px] h-[24px] border-2 border-black bg-[#F1ECE3] relative shrink-0 cursor-pointer"
              >
                <div className={"absolute top-0 bottom-0 w-[20px] border-l-2 border-black transition-all " + (privateMode ? "right-0 bg-[#2A4B9B]" : "left-0 bg-white border-r-2 border-l-0")} />
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: [ HARD_STRAY // DANGER ZONE ] */}
        <div className="mechanical-inset p-6 border-2 border-black bg-[#FFF2F2] relative overflow-hidden">
          <div className="halftone-overlay absolute inset-0 opacity-10" />
          
          <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-red-600 mb-4 flex items-center gap-2 relative z-10">
            <Skull className="w-4 h-4 shrink-0 text-red-600" />
            <span>[ HARD_STRAY // DANGER ZONE ]</span>
          </h2>

          <div className="relative z-10">
            <div className="border-2 border-black p-4 mb-4 bg-white">
              <p className="text-red-600 text-[10px] font-bold uppercase leading-relaxed">
                WARNING: DELETION IS PERMANENT. THIS OPERATION DELETES ALL SYNC ROOM RECORDS, SAVED MIXER PRESETS, PLAYLIST REPLICAS, AND CORRESPONDING CLOUD AUTH ARCHIVES. ALL TRACK REPLICAS WILL BE SHREDDED.
              </p>
            </div>

            <button 
              onClick={handleTerminateAccount}
              className="w-full bg-[#cc0000] text-white border-2 border-black py-3 font-mono font-bold hover:bg-red-800 active:translate-y-px active:translate-x-px cursor-pointer"
            >
              [ TERMINATE ACCOUNT ]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
