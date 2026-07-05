/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from "react";
import { doc, collection, onSnapshot, getDoc, updateDoc, deleteDoc, setDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase/config";
import { musicApi } from "../../../lib/providers/saavnProvider";
import RoomView from "../../../components/RoomView";
import { RoomModel, RoomMember, TrackModel } from "../../../types";
import { useSyncEngine } from "../../../hooks/useSyncEngine";
import { useHostControls } from "../../../hooks/useHostControls";
import { useInactivityMonitor } from "../../../hooks/useInactivityMonitor";

interface RoomPageProps {
  roomId: string; // ID of the active broadcast room
  currentUser: any; // Current user metadata
  currentTrack: TrackModel | null; // React active player track state
  setCurrentTrack: (track: TrackModel | null) => void; // Dispatched on sync updates
  isPlaying: boolean; // Active state of local audio element
  setIsPlaying: (playing: boolean) => void; // Updates local play state
  currentTime: number; // Playback head position
  setCurrentTime: (time: number) => void; // Syncs local timer
  audioRef: React.RefObject<HTMLAudioElement | null>; // HTML Audio component reference
  onLeaveRoom: () => void; // Callback executed on user exit
}

/**
 * Sync Room View Controller.
 * Subscribes to room states, manages user presence, and coordinates audio sync loops.
 */
export const RoomPage: React.FC<RoomPageProps> = ({
  roomId,
  currentUser,
  currentTrack,
  setCurrentTrack,
  isPlaying,
  setIsPlaying,
  currentTime,
  setCurrentTime,
  audioRef,
  onLeaveRoom
}) => {
  const [roomState, setRoomState] = useState<RoomModel | null>(null);
  const [roomMembers, setRoomMembers] = useState<RoomMember[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [checkingJoin, setCheckingJoin] = useState(true);
  const [isArchived, setIsArchived] = useState(false);
  const [isTabFocused, setIsTabFocused] = useState(
    typeof document !== "undefined" ? document.hasFocus() : true
  );

  const isHost = roomState ? roomState.hostId === currentUser?.uid : true;
  const { play: hostPlay, pause: hostPause } = useHostControls();

  // Bind inactivity monitor hook for the host user
  useInactivityMonitor({
    roomId,
    isHost,
    onInactive: () => {
      setIsArchived(true);
    }
  });

  // Watch browser window focus/blur states to suspend active Firestore listeners
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleFocus = () => setIsTabFocused(true);
    const handleBlur = () => setIsTabFocused(false);

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  // Check if current user is listed as a member in the room doc
  useEffect(() => {
    const checkMembership = async () => {
      try {
        const roomRef = doc(db, "rooms", roomId);
        const snap = await getDoc(roomRef);
        if (snap.exists()) {
          const data = snap.data();
          // Redirect immediately if the target room has already been archived
          if (data.isActive === false) {
            setIsArchived(true);
            return;
          }
          if (
            data.hostId === currentUser?.uid ||
            (data.guests && data.guests.includes(currentUser?.uid))
          ) {
            setIsJoined(true);
          }
        }
      } catch (e) {
        console.error("Error checking room membership details:", e);
      } finally {
        setCheckingJoin(false);
      }
    };
    checkMembership();
  }, [roomId, currentUser?.uid]);

  // Callback to sync guest stream audio URLs when track metadata updates
  const handleTrackChange = useCallback(
    (track: TrackModel) => {
      musicApi.getStreamUrl(track)
        .then((url) => {
          const updatedTrack = { ...track, audioUrl: url || "" };
          setCurrentTrack(updatedTrack);
          if (audioRef.current) {
            audioRef.current.src = url || "";
          }
        })
        .catch((err) => {
          console.error("Failed to sync stream URL on track change:", err);
        });
    },
    [setCurrentTrack, audioRef]
  );

  // Bind the event-driven guest sync engine hook
  useSyncEngine({
    roomId,
    audioRef,
    isHost,
    isTabFocused,
    currentTrack,
    onTrackChange: handleTrackChange,
    setIsPlaying
  });

  // Handle Presence and room details sub-collection hooks, suspended on tab blur
  useEffect(() => {
    if (!isJoined || !isTabFocused) return;

    const roomRef = doc(db, "rooms", roomId);

    // Subscribe to parent room details to sync structural attributes (metadata, host info)
    const unsubRoom = onSnapshot(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as RoomModel;
        // Dynamically transition guest view if host archives room
        if (data.isActive === false) {
          setIsArchived(true);
          return;
        }
        setRoomState(data);
      }
    });

    // Subscribe to presence sub-collection to render listening avatars in real-time
    const presenceRef = collection(db, "rooms", roomId, "presence");
    const unsubPresence = onSnapshot(presenceRef, (snapshot) => {
      const membersList: RoomMember[] = [];
      snapshot.forEach((snapDoc) => {
        membersList.push(snapDoc.data() as RoomMember);
      });
      setRoomMembers(membersList);
    });

    // Write self user details to presence sub-collection
    if (currentUser) {
      const myPresenceRef = doc(db, "rooms", roomId, "presence", currentUser.uid);
      setDoc(myPresenceRef, {
        uid: currentUser.uid,
        displayName: currentUser.displayName || "Anonymous",
        photoUrl: currentUser.photoUrl || "",
        isHost,
        lastSeen: Date.now()
      });
    }

    return () => {
      unsubRoom();
      unsubPresence();
      if (currentUser) {
        // Safe delete to detach user avatar from presence list instantly on blur/unmount
        deleteDoc(doc(db, "rooms", roomId, "presence", currentUser.uid)).catch((e) => {
          console.error("Failed to detach presence state:", e);
        });
      }
    };
  }, [isJoined, isTabFocused, roomId, currentUser, isHost]);

  // Invoked when guest joins the broadcast deck
  const handleJoinSession = async () => {
    setIsJoined(true); // Optimistic UX display toggle
    try {
      const roomRef = doc(db, "rooms", roomId);
      const snap = await getDoc(roomRef);
      if (snap.exists()) {
        const data = snap.data();
        const currentGuests = data.guests || [];
        if (!currentGuests.includes(currentUser?.uid)) {
          await updateDoc(roomRef, {
            guests: [...currentGuests, currentUser.uid]
          });
        }
      } else {
        alert("This room does not exist.");
        setIsJoined(false);
        onLeaveRoom();
      }
    } catch (e) {
      console.error("Error joining broadcast session:", e);
      setIsJoined(false); // Rollback
    }
  };

  // Host playback toggles. Calls hostControls helper to trigger synchronization
  const handlePlayPause = () => {
    if (!currentTrack) return;
    if (isPlaying) {
      hostPause(audioRef, roomId, currentUser.uid, currentTrack);
    } else {
      hostPlay(audioRef, roomId, currentUser.uid, currentTrack);
    }
  };

  if (checkingJoin) {
    return (
      <div className="h-full w-full flex items-center justify-center font-mono py-12 text-black select-none">
        CHECKING_BROADCAST_STATUS...
      </div>
    );
  }

  // Archived landing deck overlay
  if (isArchived) {
    return (
      <div className="w-full max-w-md mx-auto my-12 border-4 border-black bg-[#F5F0E8] p-8 shadow-[8px_8px_0_0_#000] flex flex-col gap-6 text-black select-none font-mono">
        <h2 className="font-serif text-3xl font-bold uppercase border-b-4 border-black pb-3 text-[#CC0000]">
          VIBE TERMINATED
        </h2>
        <p className="text-sm font-bold">
          THIS BROADCAST DECK SYNCHRONIZATION HAS BEEN ARCHIVED DUE TO INACTIVITY LIMITATIONS:
        </p>
        <div className="bg-[#EDE8DF] border-2 border-black p-3 text-center font-bold break-all">
          {roomId}
        </div>
        <button 
          onClick={onLeaveRoom}
          className="w-full py-4 border-2 border-black bg-black text-white font-bold uppercase hover:bg-white hover:text-black transition-colors cursor-pointer shadow-[3px_3px_0_0_#0D0D0D] active:translate-y-0.5 active:shadow-none"
        >
          [ RETURN TO DECK LOBBY ]
        </button>
      </div>
    );
  }

  // Pre-join landing deck overlay
  if (!isJoined) {
    return (
      <div className="w-full max-w-md mx-auto my-12 border-4 border-black bg-white p-8 shadow-[8px_8px_0_0_#000] flex flex-col gap-6 text-black select-none font-mono">
        <h2 className="font-serif text-3xl font-bold uppercase border-b-4 border-black pb-3">
          BROADCAST_SESSION
        </h2>
        <p className="text-sm font-mono font-bold">
          YOU HAVE BEEN INVITED TO JOIN THE BROADCAST DECK:
        </p>
        <div className="bg-[#f4f4f0] border-2 border-black p-3 text-center font-bold break-all">
          {roomId}
        </div>
        <button 
          onClick={handleJoinSession}
          className="w-full py-4 border-2 border-black bg-black text-white font-mono font-bold uppercase hover:bg-[#EDE8DF] hover:text-black transition-colors cursor-pointer shadow-[3px_3px_0_0_#0D0D0D] active:translate-y-0.5 active:shadow-none"
        >
          [ JOIN BROADCAST_SESSION ]
        </button>
        <button 
          onClick={onLeaveRoom}
          className="w-full py-2 border-2 border-black bg-white text-black font-mono font-bold uppercase hover:bg-black hover:text-[#EDE8DF] transition-colors text-xs cursor-pointer shadow-[2px_2px_0_0_#0D0D0D]"
        >
          CANCEL
        </button>
      </div>
    );
  }

  return (
    <RoomView 
      roomId={roomId}
      roomState={roomState}
      members={roomMembers}
      onLeaveRoom={onLeaveRoom}
      currentUser={currentUser}
      isHost={isHost}
      onPlayPause={handlePlayPause}
      isPlaying={isPlaying}
      isTabFocused={isTabFocused}
    />
  );
};

export default RoomPage;
