/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import BrutalistModal from "../shared/BrutalistModal";

interface LeaveRoomModalProps {
  isOpen: boolean; // Controls open state of the modal window
  onClose: () => void; // Triggered when stay callback or close trigger is invoked
  onLeave: () => void; // Triggered when leaving room is confirmed
}

/**
 * Leaving Confirmation Modal overlay.
 * Uses BrutalistModal layout to prompt users before disconnecting from the active session.
 */
export const LeaveRoomModal: React.FC<LeaveRoomModalProps> = ({
  isOpen,
  onClose,
  onLeave
}) => {
  
  // Brutalist actions footer containing the stay/leave buttons
  const footerActions = (
    <div className="flex gap-3 w-full">
      <button
        onClick={onClose}
        className="flex-1 py-2 border-2 border-black bg-white text-black font-bold uppercase hover:bg-black hover:text-white transition-colors cursor-pointer text-xs shadow-[2px_2px_0_0_#000] active:translate-y-0.5"
      >
        [ STAY ]
      </button>
      <button
        onClick={onLeave}
        className="flex-1 py-2 border-2 border-[#CC0000] bg-[#CC0000] text-white font-bold uppercase hover:bg-white hover:text-[#CC0000] transition-colors cursor-pointer text-xs shadow-[2px_2px_0_0_#000] active:translate-y-0.5"
      >
        [ LEAVE ]
      </button>
    </div>
  );

  return (
    <BrutalistModal
      isOpen={isOpen}
      onClose={onClose}
      title="LEAVE THE VIBE?"
      footer={footerActions}
    >
      <div className="flex flex-col gap-2 font-mono text-xs font-bold text-black uppercase">
        <p>This will disconnect you from the room.</p>
        <p className="text-brand-muted">The music keeps playing for everyone else.</p>
      </div>
    </BrutalistModal>
  );
};

export default LeaveRoomModal;
