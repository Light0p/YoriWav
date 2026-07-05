/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { X, Copy, Check, Plus } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { TrackModel } from "../types";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrack: TrackModel | null;
  onCreateRoom: () => Promise<string>;
}

export default function CreateRoomModal({ isOpen, onClose, currentTrack, onCreateRoom }: CreateRoomModalProps) {
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async () => {
    setLoading(true);
    try {
      const rId = await onCreateRoom();
      setCreatedRoomId(rId);
    } catch (e) {
      console.error("Error creating room:", e);
    } finally {
      setLoading(false);
    }
  };

  const shareUrl = createdRoomId ? `${window.location.origin}/rooms/${createdRoomId}` : "";

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 z-0" onClick={onClose} />
      
      {/* Modal Content */}
      <div className="relative border-4 border-black bg-[#F5F0E8] p-6 md:p-8 max-w-md w-full shadow-[8px_8px_0_0_#000] z-10 font-mono text-black">
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 p-1 border-2 border-black bg-white hover:bg-black hover:text-white cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {!createdRoomId ? (
          <div className="flex flex-col gap-6">
            <h3 className="font-serif text-2xl font-bold uppercase border-b-4 border-black pb-2 tracking-tighter">
              START BROADCAST
            </h3>
            {currentTrack ? (
              <div className="flex flex-col gap-4">
                <p className="text-xs uppercase font-bold text-brand-muted">Active Audio Source:</p>
                <div className="flex items-center gap-3 p-3 border-2 border-black bg-white shadow-[2px_2px_0_0_#000]">
                  <img 
                    src={currentTrack.thumbnailUrl} 
                    alt={currentTrack.title} 
                    className="w-12 h-12 object-cover border border-black filter grayscale shrink-0" 
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs truncate uppercase">{currentTrack.title}</h4>
                    <p className="text-[10px] text-brand-muted truncate uppercase">{currentTrack.artist}</p>
                  </div>
                </div>
                <p className="text-[11px] leading-normal uppercase font-bold">
                  THIS WILL ALLOCATE A STABLE SYNCHRONIZATION ROOM IN THE SYSTEM REGISTRY. 
                  GUESTS TUNING INTO YOUR LINK WILL HEAR THIS TRACK PLAYING IN REAL-TIME.
                </p>
                <button
                  onClick={handleCreate}
                  disabled={loading}
                  className="w-full py-3 border-2 border-black bg-black text-white font-bold uppercase hover:bg-[#F5F0E8] hover:text-black transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {loading ? "ESTABLISHING..." : "[ ENGAGE BROADCAST ]"}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4 text-center py-6">
                <p className="text-sm font-bold uppercase">NO ACTIVE MEDIA TO BROADCAST.</p>
                <p className="text-xs uppercase text-brand-muted">PLAY A TRACK IN YOUR DECK FIRST TO ENGAGE A LIVE LISTENING ROOM.</p>
                <button
                  onClick={onClose}
                  className="w-full py-3 border-2 border-black bg-black text-white font-bold uppercase hover:bg-white hover:text-black transition-colors cursor-pointer"
                >
                  OKAY
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-6 items-center">
            <h3 className="font-serif text-2xl font-bold uppercase border-b-4 border-black pb-2 w-full text-left tracking-tighter">
              BROADCAST LIVE
            </h3>
            <div className="w-full bg-[#E5FFE5] border-2 border-green-800 p-3 text-green-800 text-center font-bold text-xs uppercase font-mono">
              ROOM ONLINE // ID: {createdRoomId}
            </div>

            {/* QR Code */}
            <div className="border-2 border-black p-2 bg-white shrink-0 shadow-[4px_4px_0_0_#000]">
              <QRCodeSVG value={shareUrl} size={160} bgColor="#FFFFFF" fgColor="#0D0D0D" level="L" />
            </div>

            {/* Copy link input */}
            <div className="w-full flex flex-col gap-1.5">
              <label className="text-[9px] font-bold text-brand-muted uppercase">ROOM URL:</label>
              <div className="flex border-2 border-black w-full overflow-hidden bg-white shadow-[2px_2px_0_0_#000]">
                <input 
                  type="text" 
                  readOnly 
                  value={shareUrl} 
                  className="w-full bg-transparent px-3 py-2 text-[10px] font-bold outline-none cursor-default truncate text-black"
                />
                <button 
                  onClick={handleCopy}
                  className="border-l-2 border-black bg-black text-white px-3 font-bold text-xs hover:bg-[#F5F0E8] hover:text-black transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="whitespace-nowrap uppercase">{copied ? "COPIED" : "COPY"}</span>
                </button>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 border-2 border-black bg-black text-white font-bold uppercase hover:bg-[#F5F0E8] hover:text-black transition-colors cursor-pointer"
            >
              [ ENTER BROADCAST DECK ]
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
