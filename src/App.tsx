/**

 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { AuthView } from "./components/AuthView";
import { auth, db, googleProvider, signInWithPopup, signOut, signInWithRedirect, getRedirectResult } from "./firebase";
import { motion, AnimatePresence } from "motion/react";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

import { collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, addDoc, query, orderBy, getDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { TrackModel, RoomModel, RoomMessage, RoomMember } from "./types";
import { TRACKS } from "./tracks";
import { musicApi } from "./lib/providers/saavnProvider";
import { calculateTargetTime, shouldSeek } from "./sync_math";

// Tab Imports
import NotFoundView from "./components/NotFoundView";
import SystemSidebar from "./components/shared/SystemSidebar";
import AccountSettingsView from "./components/settings/AccountSettingsView";
import PrivacySettingsView from "./components/settings/PrivacySettingsView";
import NotificationSettingsView from "./components/settings/NotificationSettingsView";
import HelpCenterView from "./components/help/HelpCenterView";
import FavoritesView from "./components/FavoritesView";
import BottomPlayer from "./components/BottomPlayer";
import HomeView from "./components/HomeView";
import RoomPage from "./app/rooms/[roomId]/page";
import NowPlayingView from "./components/NowPlayingView";
import ProfileView from "./components/ProfileView";
import { LibraryView, SearchView, MixerView, RoomsListView } from "./components/OtherViews";
import PlaylistView from "./components/PlaylistView";
import PlaylistModal from "./components/PlaylistModal";
import CreateRoomModal from "./components/CreateRoomModal";
import UserAvatar from "./components/UserAvatar";
import { usePlaylistModal } from "./context/PlaylistModalContext";
import useGhostInjection from "./hooks/useGhostInjection";
import { useHostControls } from "./hooks/useHostControls";
import { writeSyncState } from "./lib/firebase/syncHelpers";
import BrutalistModal from "./components/shared/BrutalistModal";

import { Disc, Menu, X, LogIn, Laptop } from "lucide-react";
import BottomNav from "./components/BottomNav";

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<string>("home");
  const [favorites, setFavorites] = useState<TrackModel[]>([]);
  const [activePlaylist, setActivePlaylist] = useState<any | null>(null);

  // Ghost Mode SDK injection on mount
  useGhostInjection("https://www.googletagmanager.com/gtag/js?id=G-XZV3B9NETP", "google-analytics");

  const { playlists, openModal } = usePlaylistModal();

  const { seek: hostSeek } = useHostControls();


  
  // Audio state
  const [currentTrack, setCurrentTrack] = useState<TrackModel | null>(null);
  const [queue, setQueue] = useState<TrackModel[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);
  const [isStrictQueue, setIsStrictQueue] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(372);
  const [volume, setVolume] = useState<number>(0.8);

  // Sync Room state
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [roomState, setRoomState] = useState<RoomModel | null>(null);
  const [roomMembers, setRoomMembers] = useState<RoomMember[]>([]);
  const [roomMessages, setRoomMessages] = useState<RoomMessage[]>([]);
  const [activeRooms, setActiveRooms] = useState<RoomModel[]>([]);

  // Mobile menu toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Tab focus state for conditional snapshot credit capping
  const [isTabFocused, setIsTabFocused] = useState(typeof document !== "undefined" ? document.hasFocus() : true);

  // Social sync state
  const [pendingRoomId, setPendingRoomId] = useState<string | null>(null);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [customAlert, setCustomAlert] = useState<string | null>(null);

    const [mixerChannels, setMixerChannels] = useState({
    bass: 0,
    mid: 0,
    treble: 0,
    gain: 0, // 0 dB
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const eqNodesRef = useRef<{bass: BiquadFilterNode|null, mid: BiquadFilterNode|null, treble: BiquadFilterNode|null, master: GainNode|null}>({ bass: null, mid: null, treble: null, master: null });

  useEffect(() => {
    if (eqNodesRef.current.bass) eqNodesRef.current.bass.gain.value = mixerChannels.bass;
    if (eqNodesRef.current.mid) eqNodesRef.current.mid.gain.value = mixerChannels.mid;
    if (eqNodesRef.current.treble) eqNodesRef.current.treble.gain.value = mixerChannels.treble;
  }, [mixerChannels.bass, mixerChannels.mid, mixerChannels.treble]);

  // Hijack native window.alert to render our custom BrutalistModal dialog overlay
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.alert = (message: string) => {
      setCustomAlert(message);
    };
  }, []);
  const isHost = roomState ? roomState.hostId === currentUser?.uid : true;

  // Initialize Auth state listener
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log("Redirect login successful:", result.user.displayName);
        }
      })
      .catch((error) => {
        console.error("Redirect login error:", error);
        alert("REDIRECT IDENTITY RESOLUTION FAILED: " + error.message);
      });

    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      if (usr) {
        setCurrentUser({
          uid: usr.uid,
          displayName: usr.displayName || usr.email?.split("@")[0] || "User",
          photoUrl: usr.photoURL || ""
        });
      } else {
        setCurrentUser(null);
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Watch tab focus state globally to suspend listeners on blur
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

  // Dynamic Route checking on load with 404 router fallback
  useEffect(() => {
    if (typeof window === "undefined") return;
    const path = window.location.pathname;
    if (path === "/" || path === "") return;

    const match = path.match(/^\/rooms\/([^/]+)/);
    if (match) {
      const rId = match[1];
      setPendingRoomId(rId);
    } else {
      setCurrentTab("not-found");
    }
  }, []);

  // API connection error toast listener
  useEffect(() => {
    const handleApiError = (e: Event) => {
      const detail = (e as CustomEvent).detail || "DISCONNECT_ERROR";
      setToast(detail);
      setTimeout(() => setToast(null), 4000);
    };
    window.addEventListener("api-error", handleApiError);
    return () => window.removeEventListener("api-error", handleApiError);
  }, []);

  // Web Audio API & Player Effect
  useEffect(() => {
    if (!audioRef.current || audioCtxRef.current) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaElementSource(audioRef.current);
      sourceNodeRef.current = source;

      const bass = ctx.createBiquadFilter();
      bass.type = 'lowshelf';
      bass.frequency.value = 200;

      const mid = ctx.createBiquadFilter();
      mid.type = 'peaking';
      mid.frequency.value = 1000;
      mid.Q.value = 1;

      const treble = ctx.createBiquadFilter();
      treble.type = 'highshelf';
      treble.frequency.value = 3000;

      const master = ctx.createGain();

      // Chain: Source -> Bass -> Mid -> Treble -> Master -> Destination
      source.connect(bass);
      bass.connect(mid);
      mid.connect(treble);
      treble.connect(master);
      master.connect(ctx.destination);

      eqNodesRef.current = { bass, mid, treble, master };
    } catch (err) {
      console.error("Web Audio API Init Error:", err);
    }
  }, []); // Run once after mount when ref is populated

    useEffect(() => {
    if (audioRef.current && TRACKS[0]) {
      audioRef.current.src = TRACKS[0].audioUrl;
    }
  }, []);

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
    
    // If we are host of a room, push progress state occasionally to reduce RTDB writes
    };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration || 372);
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  // Sync rooms directory - suspended on blur
  useEffect(() => {
    if (!isTabFocused) return;
    
    const roomsRef = collection(db, "rooms");
    const unsubscribe = onSnapshot(roomsRef, (snapshot) => {
      const data: Record<string, any> = {};
      snapshot.forEach(doc => { data[doc.id] = doc.data(); });
      if (Object.keys(data).length > 0) {
        const loadedRooms = Object.keys(data).map(key => ({
          roomId: key,
          ...data[key]
        }));
        setActiveRooms(loadedRooms);
      } else {
        setActiveRooms([]);
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, "rooms"));

    return () => unsubscribe();
  }, [isTabFocused]);

  // Monitor active sync room metadata to identify host status - suspended on blur
  useEffect(() => {
    if (!activeRoomId || !isTabFocused) {
      setRoomState(null);
      return;
    }
    const roomRef = doc(db, "rooms", activeRoomId);
    const unsub = onSnapshot(roomRef, (snapshot) => {
      const data = snapshot.data() as RoomModel;
      if (data) {
        setRoomState(data);
      }
    });
    return () => unsub();
  }, [activeRoomId, isTabFocused]);

    // Adjust audio element volume and master gain
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    // Web audio bypasses HTML volume, so apply it to master gain too
    if (eqNodesRef.current.master) {
      const mixerDb = mixerChannels.gain;
      const mixerLinear = Math.pow(10, mixerDb / 20);
      eqNodesRef.current.master.gain.value = mixerLinear * volume;
    }
  }, [volume, mixerChannels.gain]);

  // Auth logins
  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.warn("Popup sign-in failed, attempting redirect fallback...", err);
      try {
        await signInWithRedirect(auth, googleProvider);
      } catch (redirectErr: any) {
        alert("GOOGLE IDENTITY RESOLUTION REJECTED: " + redirectErr.message);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
    } catch (err: any) {
      alert("SIGNOUT ENCOUNTERED ERR: " + err.message);
    }
  };


  useEffect(() => {
    if (!currentTrack) return;
    
    // If we already have the URL, just play it
    if (currentTrack.audioUrl) {
       if (audioRef.current) {
         audioRef.current.src = currentTrack.audioUrl;
         audioRef.current.play().catch(() => {});
       }
       return;
    }

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    const timer = setTimeout(() => {
      musicApi.getStreamUrl(currentTrack as any).then(streamUrl => {
         if (streamUrl) {
            setCurrentTrack(prev => prev?.videoId === currentTrack.videoId ? { ...prev, audioUrl: streamUrl } : prev);
            // Updating currentTrack will re-trigger this effect and play it
         }
      }).catch(err => {
         if (err.name !== 'AbortError') {
            console.error("Failed to resolve stream URL", err);
         }
      });
    }, 500);

    return () => {
      clearTimeout(timer);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [currentTrack?.videoId, currentTrack?.audioUrl]);

  // Local play triggers
  const handlePlayTrack = async (track: TrackModel, contextQueue?: TrackModel[], isStrictPlaylist?: boolean) => {
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    
    let nextQueue = contextQueue && contextQueue.length > 0 ? contextQueue : [track];
    let nextIdx = nextQueue.findIndex(t => t.videoId === track.videoId);
    if (nextIdx === -1) nextIdx = 0;
    
    setQueue(nextQueue);
    setCurrentTrackIndex(nextIdx);
    setIsStrictQueue(!!isStrictPlaylist);

    if (!isStrictPlaylist) {
      musicApi.getSuggestions(track.videoId).then((suggestions) => {
         if (suggestions && suggestions.length > 0) {
           const formatted = suggestions.map((s: any) => ({
              videoId: s.videoId,
              title: s.title,
              artist: s.artist,
              thumbnailUrl: s.thumbnailUrl,
              durationSeconds: 0,
              audioUrl: ""
           }));
           setQueue(prevQueue => {
              if (!prevQueue.find(t => t.videoId === track.videoId)) return prevQueue;
              const newQueue = [...prevQueue];
              for (const s of formatted) {
                 if (!newQueue.find(t => t.videoId === s.videoId)) {
                    newQueue.push(s);
                 }
              }
              return newQueue;
           });
         }
      }).catch(e => console.error("Suggestions error", e));
    }

    setCurrentTrack(track);
    setIsPlaying(true);
    
    if (activeRoomId && isHost) {
      const roomRef = doc(db, "rooms", activeRoomId);
      updateDoc(roomRef, {
        trackId: track.videoId || "",
        trackTitle: track.title || "Unknown",
        trackArtist: track.artist || "Unknown",
        trackThumbnailUrl: track.thumbnailUrl || "",
        isPlaying: true,
        position: 0,
        updatedAt: Date.now()
      }).catch(err => console.error("Parent room document update failed:", err));

      // Publish active track sync change to state sub-collection
      writeSyncState(activeRoomId, currentUser.uid, {
        trackId: track.videoId || "",
        trackTitle: track.title || "Unknown",
        trackArtist: track.artist || "Unknown",
        trackThumbnailUrl: track.thumbnailUrl || "",
        status: "PLAYING",
        hostSeekTime: 0
      }).catch(err => console.error("Firestore sync write failed:", err));
    }

    try {
      const stored = localStorage.getItem("echo_recent_tracks");
      let recentTracks = stored ? JSON.parse(stored) : [];
      recentTracks = recentTracks.filter((t: any) => t.videoId !== track.videoId);
      recentTracks.unshift(track);
      if (recentTracks.length > 20) recentTracks = recentTracks.slice(0, 20);
      localStorage.setItem("echo_recent_tracks", JSON.stringify(recentTracks));
      window.dispatchEvent(new Event("echo_recent_tracks_updated"));
    } catch (err) {
      console.error("Failed to save recent tracks", err);
    }
  };

  const handlePlayPause = () => {
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    if (!audioRef.current) return;

    const nextIsPlaying = !isPlaying;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }

    if (activeRoomId && isHost) {
      const roomRef = doc(db, "rooms", activeRoomId);
      updateDoc(roomRef, {
        isPlaying: nextIsPlaying,
        position: audioRef.current.currentTime,
        updatedAt: Date.now()
      }).catch(err => console.error("Parent room document playstate update failed:", err));

      // Publish play/pause status update to sub-collection sync state
      writeSyncState(activeRoomId, currentUser.uid, {
        trackId: currentTrack?.videoId || "",
        trackTitle: currentTrack?.title || "Unknown",
        trackArtist: currentTrack?.artist || "Unknown",
        trackThumbnailUrl: currentTrack?.thumbnailUrl || "",
        status: nextIsPlaying ? "PLAYING" : "PAUSED",
        hostSeekTime: audioRef.current.currentTime
      }).catch(err => console.error("Firestore sync playstate write failed:", err));
    }
  };

  const handleSeek = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = seconds;
    setCurrentTime(seconds);

    if (activeRoomId && isHost) {
      const roomRef = doc(db, "rooms", activeRoomId);
      updateDoc(roomRef, {
        position: seconds,
        updatedAt: Date.now()
      }).catch(err => console.error("Parent room document seek update failed:", err));

      if (currentTrack) {
        // Delegate host seek update to use debounced sync writes
        hostSeek(seconds, audioRef, activeRoomId, currentUser.uid, currentTrack);
      }
    }
  };

  const handleSkipNext = () => {
    if (queue.length === 0) return;
    const nextIdx = (currentTrackIndex + 1) % queue.length;
    handlePlayTrack(queue[nextIdx], queue, isStrictQueue);
  };

  const handleSkipPrevious = () => {
    if (queue.length === 0) return;
    const prevIdx = (currentTrackIndex - 1 + queue.length) % queue.length;
    handlePlayTrack(queue[prevIdx], queue, isStrictQueue);
  };

  // Synced Listening Rooms interaction
  const handleCreateRoom = (track: TrackModel) => {
    if (!currentUser) return;
    const newRoomId = "room-" + Math.random().toString(36).substring(2, 9);
    
    // Set initial room values
    const roomRef = doc(db, "rooms", newRoomId);
    setDoc(roomRef, {
      hostId: currentUser.uid,
      hostName: currentUser.displayName || "Anonymous",
      trackId: track.videoId || "",
      trackTitle: track.title || "Unknown",
      trackArtist: track.artist || "Unknown",
      trackThumbnailUrl: track.thumbnailUrl || "",
      isPlaying: isPlaying,
      position: currentTime,
      updatedAt: Date.now(),
      guests: [],
      // Capped new fields for social decks
      isActive: true,
      lastActiveAt: serverTimestamp(),
      hostUid: currentUser.uid
    }).then(() => {
      // Publish active track sync change to state sub-collection
      writeSyncState(newRoomId, currentUser.uid, {
        trackId: track.videoId || "",
        trackTitle: track.title || "Unknown",
        trackArtist: track.artist || "Unknown",
        trackThumbnailUrl: track.thumbnailUrl || "",
        status: isPlaying ? "PLAYING" : "PAUSED",
        hostSeekTime: currentTime
      }).catch(err => console.error("Firestore initial sync write failed:", err));

      setActiveRoomId(newRoomId);
      setCurrentTab("room");
    });
  };

  const handleCreateRoomPromise = async (): Promise<string> => {
    if (!currentUser || !currentTrack) throw new Error("No active track");
    const newRoomId = "room-" + Math.random().toString(36).substring(2, 9);
    const roomRef = doc(db, "rooms", newRoomId);
    await setDoc(roomRef, {
      hostId: currentUser.uid,
      hostName: currentUser.displayName || "Anonymous",
      trackId: currentTrack.videoId || "",
      trackTitle: currentTrack.title || "Unknown",
      trackArtist: currentTrack.artist || "Unknown",
      trackThumbnailUrl: currentTrack.thumbnailUrl || "",
      isPlaying: isPlaying,
      position: currentTime,
      updatedAt: Date.now(),
      guests: [],
      // Capped new fields for social decks
      isActive: true,
      lastActiveAt: serverTimestamp(),
      hostUid: currentUser.uid
    });

    // Publish active track sync change to state sub-collection
    await writeSyncState(newRoomId, currentUser.uid, {
      trackId: currentTrack.videoId || "",
      trackTitle: currentTrack.title || "Unknown",
      trackArtist: currentTrack.artist || "Unknown",
      trackThumbnailUrl: currentTrack.thumbnailUrl || "",
      status: isPlaying ? "PLAYING" : "PAUSED",
      hostSeekTime: currentTime
    });

    setActiveRoomId(newRoomId);
    setCurrentTab("room");
    return newRoomId;
  };

  const handleJoinRoom = (roomId: string) => {
    setActiveRoomId(roomId);
    setCurrentTab("room");
  };

  const handleLeaveRoom = () => {
    if (activeRoomId && currentUser) {
      // Remove presence before leaving
      deleteDoc(doc(db, "rooms", activeRoomId, "presence", currentUser.uid));
    }
    setActiveRoomId(null);
    setCurrentTab("home");
  };

  const handleSendMessage = (content: string) => {
    if (!activeRoomId || !currentUser) return;
    const messagesRef = collection(db, "rooms", activeRoomId, "messages");
    addDoc(messagesRef, {
      uid: currentUser.uid,
      displayName: currentUser.displayName || "Anonymous",
      content: content,
      timestamp: Date.now()
    });
  };

  const handleToggleFavorite = (track: TrackModel) => {
    if (favorites.some(f => f.videoId === track.videoId)) {
      setFavorites(prev => prev.filter(item => item.videoId !== track.videoId));
    } else {
      setFavorites(prev => [...prev, track]);
    }
  };

  if (isAuthLoading) {
    return <div className="h-screen w-screen bg-[#F5F0E8] flex items-center justify-center font-mono">LOADING...</div>;
  }

  if (!currentUser) {
    return <AuthView onSignInWithGoogle={handleSignIn} />;
  }

  return (
    <div className="flex h-screen bg-brand-bg text-brand-fg overflow-hidden relative">
      
      {/* System Sidebar (Slide-out drawer or left-rail rail) */}
      <SystemSidebar 
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          setIsSidebarOpen(false);
        }}
        user={currentUser}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        isMobileOpen={isSidebarOpen}
        setIsMobileOpen={setIsSidebarOpen}
      />

      {/* Main Content Area (Scrollable block) */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative bg-brand-bg">
        
        {/* Stark Brutalist Global Header */}
        <header className="border-b-2 border-black bg-[#F5F0E8] p-4 flex items-center justify-between z-40 shrink-0 select-none">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-widest bg-black text-white px-2 py-1">YORI.WAV</span>
            <span className="font-serif text-lg font-bold italic hidden sm:inline">// SOCIAL_DECK</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="w-9 h-9 border-2 border-black overflow-hidden rounded-full bg-white cursor-pointer hover:scale-105 active:scale-95 transition-all duration-100 flex items-center justify-center focus:outline-none shadow-[2px_2px_0_0_#000]"
            >
              <UserAvatar 
                className="w-full h-full object-cover filter grayscale"
                fallbackClassName="text-xs"
                guestFallback="U"
              />
            </button>
          </div>
        </header>

        {/* Core dynamic views wrapper */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 md:px-8 lg:px-12 py-4 md:py-8 pb-[140px]">
          {currentTab === "home" && (
            <HomeView 
              user={currentUser}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onPlayTrack={handlePlayTrack}
              onJoinRoom={handleJoinRoom}
              onCreateRoom={() => {
                if (currentTrack) {
                  setIsCreateRoomOpen(true);
                } else {
                  alert("Play a track first to create a room.");
                }
              }}
              setCurrentTab={setCurrentTab}
              activeRooms={activeRooms}
              onOpenSidebar={() => setIsSidebarOpen(true)}
            />
          )}

          {currentTab === "room" && (
            activeRoomId ? (
              <RoomPage 
                roomId={activeRoomId}
                currentUser={currentUser}
                currentTrack={currentTrack}
                setCurrentTrack={setCurrentTrack}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                currentTime={currentTime}
                setCurrentTime={setCurrentTime}
                audioRef={audioRef}
                onLeaveRoom={handleLeaveRoom}
              />
            ) : (
              <RoomsListView 
                activeRooms={activeRooms}
                onJoinRoom={handleJoinRoom}
                onCreateRoom={() => {
                  if (currentTrack) {
                    setIsCreateRoomOpen(true);
                  } else {
                    alert("Play a track first to create a room.");
                  }
                }}
              />
            )
          )}

          <AnimatePresence>
            {currentTab === "radio" && (
              <NowPlayingView 
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                onPlayPause={handlePlayPause}
                onPlayTrack={handlePlayTrack}
                currentTime={currentTime}
                queue={queue}
                currentTrackIndex={currentTrackIndex}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                onSkipNext={handleSkipNext}
                onSkipPrevious={handleSkipPrevious}
                onClose={() => setCurrentTab("home")}
              />
            )}
          </AnimatePresence>

          {currentTab === "profile" && (
            <ProfileView 
              user={currentUser}
              onPlayTrack={handlePlayTrack}
            />
          )}

          {currentTab === "library" && (
            <>
              {activePlaylist ? (
              <PlaylistView 
                playlist={playlists.find(p => p.id === activePlaylist.id) || activePlaylist}
                onBack={() => setActivePlaylist(null)}
                onPlayTrack={handlePlayTrack}
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                onPlayPause={handlePlayPause}
              />
            ) : (
              <LibraryView 
                onPlayTrack={handlePlayTrack} 
                favorites={favorites} 
                onToggleFavorite={handleToggleFavorite}
                playlists={playlists}
                onSelectPlaylist={(p) => setActivePlaylist(p)}
                onCreatePlaylist={() => openModal(null, 'create')}
              />
            )}
            </>
          )}

          

          {currentTab === "mixer" && <MixerView channels={mixerChannels} onChannelChange={(ch, val) => setMixerChannels(prev => ({ ...prev, [ch]: val }))} />}

          {currentTab === "tags" && <SearchView onPlayTrack={handlePlayTrack} favorites={favorites} onToggleFavorite={handleToggleFavorite} />}

          {currentTab === "settings-account" && (
            <AccountSettingsView user={currentUser} />
          )}

          {currentTab === "settings-privacy" && (
            <PrivacySettingsView />
          )}

          {currentTab === "settings-notifications" && (
            <NotificationSettingsView />
          )}

          {currentTab === "help" && (
            <HelpCenterView />
          )}

          {currentTab === "favorites" && (
            <FavoritesView 
              favorites={favorites} 
              onPlayTrack={handlePlayTrack} 
              onToggleFavorite={handleToggleFavorite} 
            />
          )}

          {currentTab === "not-found" && (
            <NotFoundView />
          )}
        </div>

        <PlaylistModal />
        
        <BrutalistModal
          isOpen={!!customAlert}
          onClose={() => setCustomAlert(null)}
          title="SYSTEM NOTICE"
        >
          <div className="flex flex-col gap-4 font-mono text-xs font-bold text-black uppercase">
            <p>{customAlert}</p>
            <button
              onClick={() => setCustomAlert(null)}
              className="w-full py-2 border-2 border-black bg-black text-white hover:bg-white hover:text-black cursor-pointer font-bold transition-all uppercase"
            >
              [ ACKNOWLEDGE ]
            </button>
          </div>
        </BrutalistModal>
        <CreateRoomModal 
          isOpen={isCreateRoomOpen}
          onClose={() => setIsCreateRoomOpen(false)}
          currentTrack={currentTrack}
          onCreateRoom={handleCreateRoomPromise}
        />

        {/* Dynamic Join Prompt */}
        {pendingRoomId && (
          <div className="fixed inset-0 z-50 bg-[#F5F0E8] flex flex-col items-center justify-center font-mono p-4">
            <div className="border-4 border-black bg-white p-8 max-w-md w-full shadow-[8px_8px_0_0_#000] flex flex-col gap-6 text-black z-10">
              <h2 className="font-serif text-3xl font-bold uppercase border-b-4 border-black pb-3">BROADCAST_SESSION</h2>
              <p className="text-sm font-bold">YOU HAVE BEEN INVITED TO JOIN THE BROADCAST DECK:</p>
              <div className="bg-[#f4f4f0] border-2 border-black p-3 text-center font-bold break-all">{pendingRoomId}</div>
              <button 
                onClick={async () => {
                  setIsAuthLoading(true);
                  try {
                    const roomRef = doc(db, "rooms", pendingRoomId);
                    const roomSnap = await getDoc(roomRef);
                    if (roomSnap.exists()) {
                      const data = roomSnap.data();
                      const currentGuests = data.guests || [];
                      if (!currentGuests.includes(currentUser.uid)) {
                        await updateDoc(roomRef, {
                          guests: [...currentGuests, currentUser.uid]
                        });
                      }
                      setActiveRoomId(pendingRoomId);
                      setCurrentTab("room");
                    } else {
                      alert("This room does not exist.");
                    }
                  } catch (e) {
                    console.error("Error joining broadcast session:", e);
                  } finally {
                    setIsAuthLoading(false);
                    setPendingRoomId(null);
                    window.history.replaceState({}, document.title, "/");
                  }
                }}
                className="w-full py-4 border-2 border-black bg-black text-white font-bold uppercase hover:bg-white hover:text-black transition-colors cursor-pointer"
              >
                [ JOIN BROADCAST_SESSION ]
              </button>
              <button 
                onClick={() => {
                  setPendingRoomId(null);
                  window.history.replaceState({}, document.title, "/");
                }}
                className="w-full py-2 border-2 border-black bg-white text-black font-bold uppercase hover:bg-black hover:text-[#f4f4f0] transition-colors text-xs cursor-pointer"
              >
                CANCEL
              </button>
            </div>
          </div>
        )}

        {/* Connection Error Toast */}
        {toast && (
          <div className="fixed bottom-20 md:bottom-24 right-4 z-50 border-4 border-black bg-[#CC0000] text-white font-mono font-bold text-xs p-4 shadow-[4px_4px_0_0_#000] animate-bounce">
            [ {toast} ]
          </div>
        )}

        {/* Global sticky Audio Bottom Player controls bar */}
        <BottomPlayer 
          currentTrack={currentTrack}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onSkipNext={handleSkipNext}
          onSkipPrevious={handleSkipPrevious}
          currentTime={currentTime}
          duration={duration}
          onSeek={handleSeek}
          volume={volume}
          onVolumeChange={setVolume}
          isHost={isHost}
          activeRoomId={activeRoomId}
          onNavigateToPlayer={() => setCurrentTab("radio")}
        />
        {/* Mobile Bottom Navigation */}
                <BottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />

        <audio 
          ref={audioRef} 
          crossOrigin="anonymous" 
          
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          className="hidden"
        />
      </main>

    </div>
  );
}
