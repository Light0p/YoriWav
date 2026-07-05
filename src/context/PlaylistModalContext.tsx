import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { TrackModel } from "../types";

export type PlaylistModalView = 'options' | 'create' | 'select';

export interface Playlist {
  id: string;
  name: string;
  customAvatar: string | null;
  tracks: TrackModel[];
}

interface PlaylistModalContextType {
  playlists: Playlist[];
  isModalOpen: boolean;
  modalView: PlaylistModalView;
  songToAdd: TrackModel | null;
  openModal: (song: TrackModel | null, initialView?: PlaylistModalView) => void;
  closeModal: () => void;
  setModalView: (view: PlaylistModalView) => void;
  createNewPlaylist: (name: string, customAvatar: string | null, songToAutoAdd?: TrackModel | null) => void;
  addSongToPlaylist: (playlistId: string, song: TrackModel) => boolean;
}

const PlaylistModalContext = createContext<PlaylistModalContextType | undefined>(undefined);

export function PlaylistModalProvider({ children }: { children: ReactNode }) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalView, setModalView] = useState<PlaylistModalView>('options');
  const [songToAdd, setSongToAdd] = useState<TrackModel | null>(null);

  // Load playlists from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("echo_playlists");
      if (stored) {
        setPlaylists(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load playlists from localStorage", e);
    }
  }, []);

  const savePlaylists = (newPlaylists: Playlist[]) => {
    setPlaylists(newPlaylists);
    localStorage.setItem("echo_playlists", JSON.stringify(newPlaylists));
    // Trigger custom event to notify other components if needed
    window.dispatchEvent(new CustomEvent("playlists_updated", { detail: newPlaylists }));
  };

  const openModal = (song: TrackModel | null, initialView: PlaylistModalView = 'options') => {
    setSongToAdd(song);
    setModalView(initialView);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSongToAdd(null);
  };

  // Add backward compatibility for window event
  useEffect(() => {
    const handleOpenModalEvent = (e: any) => {
      if (e.detail) {
        openModal(e.detail, 'options');
      }
    };
    window.addEventListener('open_playlist_modal', handleOpenModalEvent);
    return () => window.removeEventListener('open_playlist_modal', handleOpenModalEvent);
  }, []);

  const createNewPlaylist = (name: string, customAvatar: string | null, songToAutoAdd?: TrackModel | null) => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      customAvatar,
      tracks: songToAutoAdd ? [songToAutoAdd] : []
    };
    savePlaylists([...playlists, newPlaylist]);
  };

  const addSongToPlaylist = (playlistId: string, song: TrackModel): boolean => {
    let alreadyExists = false;
    const updated = playlists.map(p => {
      if (p.id === playlistId) {
        const exists = p.tracks.some(t => t.videoId === song.videoId);
        if (exists) {
          alreadyExists = true;
          return p;
        }
        return {
          ...p,
          tracks: [...p.tracks, song]
        };
      }
      return p;
    });

    if (!alreadyExists) {
      savePlaylists(updated);
      return true;
    }
    return false;
  };

  return (
    <PlaylistModalContext.Provider value={{
      playlists,
      isModalOpen,
      modalView,
      songToAdd,
      openModal,
      closeModal,
      setModalView,
      createNewPlaylist,
      addSongToPlaylist
    }}>
      {children}
    </PlaylistModalContext.Provider>
  );
}

export function usePlaylistModal() {
  const context = useContext(PlaylistModalContext);
  if (!context) {
    throw new Error("usePlaylistModal must be used within a PlaylistModalProvider");
  }
  return context;
}
