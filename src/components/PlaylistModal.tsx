import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Upload, Music, Check, Plus } from "lucide-react";
import { usePlaylistModal } from "../context/PlaylistModalContext";

export default function PlaylistModal() {
  const {
    isModalOpen,
    modalView,
    songToAdd,
    playlists,
    closeModal,
    setModalView,
    createNewPlaylist,
    addSongToPlaylist
  } = usePlaylistModal();

  const [playlistName, setPlaylistName] = useState("");
  const [customCover, setCustomCover] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("IMAGE SIZE MUST BE UNDER 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomCover(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistName.trim()) return;

    createNewPlaylist(playlistName.trim(), customCover, songToAdd);
    
    const targetSongName = songToAdd ? `AND ADDED "${songToAdd.title.toUpperCase()}"` : "";
    setSuccessMessage(`PLAYLIST "${playlistName.toUpperCase()}" CREATED ${targetSongName}!`);
    setPlaylistName("");
    setCustomCover(null);

    setTimeout(() => {
      setSuccessMessage(null);
      closeModal();
    }, 2000);
  };

  const handleAddToPlaylist = (playlistId: string, playlistName: string) => {
    if (!songToAdd) return;
    const added = addSongToPlaylist(playlistId, songToAdd);
    
    if (added) {
      setSuccessMessage(`ADDED "${songToAdd.title.toUpperCase()}" TO "${playlistName.toUpperCase()}"!`);
    } else {
      setSuccessMessage(`"${songToAdd.title.toUpperCase()}" IS ALREADY IN "${playlistName.toUpperCase()}"`);
    }

    setTimeout(() => {
      setSuccessMessage(null);
      closeModal();
    }, 2000);
  };

  if (!isModalOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px]"
        onClick={(e) => {
          // Close when clicking background outside modal
          if (e.target === e.currentTarget) closeModal();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 250 }}
          className="w-full max-w-md border-[2px] border-black bg-[#f4f4f0] p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-[#0D0D0D] relative flex flex-col font-mono"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b-2 border-black pb-3 mb-6">
            <h3 className="font-serif text-2xl font-black tracking-tight uppercase">
              {modalView === 'options' && "PLAYLIST OPTIONS"}
              {modalView === 'create' && "CREATE PLAYLIST"}
              {modalView === 'select' && "SELECT PLAYLIST"}
            </h3>
            <button 
              onClick={closeModal}
              className="border-2 border-black bg-white hover:bg-black hover:text-[#f4f4f0] p-1 transition-all duration-200 active:scale-95 cursor-pointer"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success Message Banner */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 bg-black text-[#f4f4f0] p-3 border-2 border-black text-center font-bold text-xs flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Modal Views */}
          {!successMessage && (
            <div className="flex flex-col flex-1 min-h-[220px]">
              
              {/* VIEW 1: OPTIONS */}
              {modalView === 'options' && (
                <div className="flex flex-col gap-4 justify-center items-stretch flex-1">
                  {songToAdd && (
                    <div className="border-[1.5px] border-black bg-white p-3 mb-2 flex items-center gap-3">
                      <img 
                        src={songToAdd.thumbnailUrl} 
                        alt={songToAdd.title} 
                        className="w-12 h-12 object-cover border border-black filter grayscale"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-serif font-black text-xs truncate uppercase leading-tight">{songToAdd.title}</p>
                        <p className="text-[10px] text-gray-500 truncate mt-1">{songToAdd.artist.toUpperCase()}</p>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setModalView('create')}
                    className="border-2 border-black bg-white hover:bg-black hover:text-[#f4f4f0] py-4 px-6 text-sm font-bold uppercase transition-all duration-200 active:scale-95 cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
                  >
                    [ CREATE NEW PLAYLIST ]
                  </button>

                  <button
                    onClick={() => setModalView('select')}
                    className="border-2 border-black bg-white hover:bg-black hover:text-[#f4f4f0] py-4 px-6 text-sm font-bold uppercase transition-all duration-200 active:scale-95 cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
                  >
                    [ ADD TO EXISTING PLAYLIST ]
                  </button>
                </div>
              )}

              {/* VIEW 2: CREATE PLAYLIST */}
              {modalView === 'create' && (
                <form onSubmit={handleSavePlaylist} className="flex flex-col gap-4 flex-1">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-gray-600">PLAYLIST NAME</label>
                    <input
                      type="text"
                      required
                      placeholder="VIBE SESSION"
                      value={playlistName}
                      onChange={(e) => setPlaylistName(e.target.value)}
                      className="w-full border-2 border-black bg-white p-3 text-sm font-bold uppercase focus:outline-none focus:ring-0 focus:border-black placeholder-gray-400"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-gray-600">UPLOAD CUSTOM COVER</label>
                    <div className="flex gap-3 items-center">
                      <div className="w-16 h-16 border-2 border-black bg-white flex items-center justify-center shrink-0 overflow-hidden relative">
                        {customCover ? (
                          <img src={customCover} alt="Cover Preview" className="w-full h-full object-cover filter grayscale" />
                        ) : (
                          <Music className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="border-[1.5px] border-black bg-white hover:bg-black hover:text-[#f4f4f0] text-xs font-bold py-2 px-3 uppercase transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        SELECT FILE
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  </div>

                  {songToAdd && (
                    <div className="text-[10px] text-gray-500 mt-2">
                      * WILL AUTOMATICALLY INCLUDE "{songToAdd.title.toUpperCase()}"
                    </div>
                  )}

                  <div className="flex gap-3 mt-auto pt-4">
                    {songToAdd && (
                      <button
                        type="button"
                        onClick={() => setModalView('options')}
                        className="border-2 border-black bg-white hover:bg-black hover:text-[#f4f4f0] px-4 py-3 text-xs font-bold uppercase transition-all duration-200 active:scale-95 cursor-pointer"
                      >
                        BACK
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex-1 border-2 border-black bg-black text-[#f4f4f0] hover:bg-white hover:text-black py-3 px-4 text-xs font-bold uppercase transition-all duration-200 active:scale-95 cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
                    >
                      [ SAVE PLAYLIST ]
                    </button>
                  </div>
                </form>
              )}

              {/* VIEW 3: SELECT EXISTING PLAYLIST */}
              {modalView === 'select' && (
                <div className="flex flex-col gap-4 flex-1">
                  {playlists.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center p-6 border-[1.5px] border-dashed border-black/40 flex-1 gap-3">
                      <p className="text-xs font-bold text-gray-500 uppercase">NO PLAYLISTS FOUND.</p>
                      <button
                        onClick={() => setModalView('create')}
                        className="border-2 border-black bg-black text-[#f4f4f0] hover:bg-white hover:text-black py-2.5 px-4 text-xs font-bold uppercase transition-all duration-200 active:scale-95 cursor-pointer"
                      >
                        [ CREATE ONE NOW ]
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-[10px] font-bold uppercase text-gray-500 mb-1">CHOOSE PLAYLIST:</p>
                      <div className="flex flex-col gap-2.5 max-h-[250px] overflow-y-auto pr-1">
                        {playlists.map((playlist) => (
                          <button
                            key={playlist.id}
                            onClick={() => handleAddToPlaylist(playlist.id, playlist.name)}
                            className="w-full border-2 border-black bg-white hover:bg-black hover:text-[#f4f4f0] p-3 text-left font-serif font-black text-xs uppercase flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:scale-95 cursor-pointer"
                          >
                            <span className="truncate">{playlist.name}</span>
                            <span className="font-mono text-[9px] text-gray-400 font-normal ml-3 shrink-0">
                              {playlist.tracks.length} TRACKS
                            </span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  <div className="flex gap-3 mt-auto pt-4 border-t border-black/10">
                    <button
                      onClick={() => setModalView('options')}
                      className="border-2 border-black bg-white hover:bg-black hover:text-[#f4f4f0] px-4 py-3 text-xs font-bold uppercase transition-all duration-200 active:scale-95 cursor-pointer"
                    >
                      BACK
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
