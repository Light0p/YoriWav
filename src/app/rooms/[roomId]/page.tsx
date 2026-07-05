/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { doc, collection, onSnapshot, query, orderBy, setDoc, deleteDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase/config";
import { musicApi } from "../../../lib/providers/saavnProvider";
import { calculateTargetTime, shouldSeek } from "../../../sync_math";
import RoomView from "../../../components/RoomView";
import { RoomModel, RoomMember, RoomMessage, TrackModel } from "../../../types";

interface RoomPageProps {
  roomId: string;
  currentUser: any;
  currentTrack: TrackModel | null;
  setCurrentTrack: (track: TrackModel | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  currentTime: number;
  setCurrentTime: (time: number) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  onLeaveRoom: () => void;
}

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
  const [roomMessages, setRoomMessages] = useState<RoomMessage[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [checkingJoin, setCheckingJoin] = useState(true);

  const [isTabFocused, setIsTabFocused] = useState(typeof document !== "undefined" ? document.hasFocus() : true);

  const isHost = roomState ? roomState.hostId === currentUser?.uid : true;

  // Watch tab focus state
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

  // Check if current user is in guests or is host
  useEffect(() => {
    const checkMembership = async () => {
      try {
        const roomRef = doc(db, "rooms", roomId);
        const snap = await getDoc(roomRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.hostId === currentUser?.uid || (data.guests && data.guests.includes(currentUser?.uid))) {
            setIsJoined(true);
          }
        }
      } catch (e) {
        console.error("Error checking room membership:", e);
      } finally {
        setCheckingJoin(false);
      }
    };
    checkMembership();
  }, [roomId, currentUser?.uid]);

  // Handle Presence and Live Subscriptions once joined, suspended when tab is blurred/inactive
  useEffect(() => {
    if (!isJoined || !isTabFocused) return;

    // Sub to room details & sync audio
    const roomRef = doc(db, "rooms", roomId);
    const unsubRoom = onSnapshot(roomRef, (snapshot) => {
      const data = snapshot.data() as RoomModel;
      if (data) {
        setRoomState(data);

        // Find track matching room state or construct from room data
        const targetTrack: TrackModel = {
          videoId: data.trackId,
          title: data.trackTitle,
          artist: data.trackArtist,
          thumbnailUrl: data.trackThumbnailUrl,
          durationSeconds: 0,
          audioUrl: ""
        };

        if (targetTrack && currentTrack?.videoId !== targetTrack.videoId) {
          musicApi.getStreamUrl(targetTrack as any).then(url => {
            targetTrack.audioUrl = url || "";
            setCurrentTrack(targetTrack);
            if (audioRef.current) {
              audioRef.current.src = url || "";
              if (data.isPlaying && !isHost) {
                audioRef.current.play().catch(() => {});
              }
            }
          }).catch(err => console.error("Failed to sync stream URL:", err));
        }

        // Apply Host-Guest sync logic
        if (!isHost && audioRef.current) {
          if (data.isPlaying && audioRef.current.paused) {
            audioRef.current.play().catch(() => {});
            setIsPlaying(true);
          } else if (!data.isPlaying && !audioRef.current.paused) {
            audioRef.current.pause();
            setIsPlaying(false);
          }

          const targetPos = calculateTargetTime(data.position, data.updatedAt, 0);
          if (shouldSeek(audioRef.current.currentTime, targetPos)) {
            audioRef.current.currentTime = targetPos;
          }
        }
      }
    });

    // Sub to presence
    const presenceRef = collection(db, "rooms", roomId, "presence");
    const unsubPresence = onSnapshot(presenceRef, (snapshot) => {
      const membersList: RoomMember[] = [];
      snapshot.forEach(doc => {
        membersList.push(doc.data() as RoomMember);
      });
      setRoomMembers(membersList);
    });

    // Sub to message log
    const messagesRef = query(collection(db, "rooms", roomId, "messages"), orderBy("timestamp"));
    const unsubMessages = onSnapshot(messagesRef, (snapshot) => {
      const list: RoomMessage[] = [];
      snapshot.forEach(doc => {
        list.push({ messageId: doc.id, ...doc.data() } as RoomMessage);
      });
      setRoomMessages(list);
    });

    // Write self to presence
    if (currentUser) {
      const myPresenceRef = doc(db, "rooms", roomId, "presence", currentUser.uid);
      setDoc(myPresenceRef, {
        uid: currentUser.uid,
        displayName: currentUser.displayName || "Anonymous",
        photoUrl: currentUser.photoUrl || "",
        joinedAt: Date.now()
      });
    }

    return () => {
      unsubRoom();
      unsubPresence();
      unsubMessages();
      if (currentUser) {
        deleteDoc(doc(db, "rooms", roomId, "presence", currentUser.uid));
      }
    };
  }, [isJoined, isTabFocused, roomId, currentUser]);

  const handleJoinSession = async () => {
    setIsJoined(true); // Optimistic UI
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
        setIsJoined(false); // Rollback
        onLeaveRoom();
      }
    } catch (e) {
      console.error("Error joining broadcast session:", e);
      setIsJoined(false); // Rollback
    }
  };

  const handleSendMessage = (content: string) => {
    if (!currentUser) return;
    const messagesRef = collection(db, "rooms", roomId, "messages");
    setDoc(doc(messagesRef), {
      uid: currentUser.uid,
      displayName: currentUser.displayName || "Anonymous",
      content: content,
      timestamp: Date.now()
    });
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    const nextIsPlaying = !isPlaying;
    setIsPlaying(nextIsPlaying);
    if (nextIsPlaying) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }

    if (isHost) {
      const roomRef = doc(db, "rooms", roomId);
      updateDoc(roomRef, {
        isPlaying: nextIsPlaying,
        position: audioRef.current.currentTime,
        updatedAt: Date.now()
      });
    }
  };

  if (checkingJoin) {
    return <div className="h-full w-full flex items-center justify-center font-mono py-12 text-black">CHECKING_BROADCAST_STATUS...</div>;
  }

  if (!isJoined) {
    return (
      <div className="w-full max-w-md mx-auto my-12 border-4 border-black bg-white p-8 shadow-[8px_8px_0_0_#000] flex flex-col gap-6 text-black">
        <h2 className="font-serif text-3xl font-bold uppercase border-b-4 border-black pb-3">BROADCAST_SESSION</h2>
        <p className="text-sm font-mono font-bold">YOU HAVE BEEN INVITED TO JOIN THE BROADCAST DECK:</p>
        <div className="bg-[#f4f4f0] border-2 border-black p-3 text-center font-bold break-all">{roomId}</div>
        <button 
          onClick={handleJoinSession}
          className="w-full py-4 border-2 border-black bg-black text-white font-mono font-bold uppercase hover:bg-white hover:text-black transition-colors cursor-pointer"
        >
          [ JOIN BROADCAST_SESSION ]
        </button>
        <button 
          onClick={onLeaveRoom}
          className="w-full py-2 border-2 border-black bg-white text-black font-mono font-bold uppercase hover:bg-black hover:text-[#f4f4f0] transition-colors text-xs cursor-pointer"
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
      messages={roomMessages}
      onSendMessage={handleSendMessage}
      onLeaveRoom={onLeaveRoom}
      currentUser={currentUser}
      isHost={isHost}
      onPlayPause={handlePlayPause}
      isPlaying={isPlaying}
    />
  );
};

export default RoomPage;
