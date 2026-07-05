import React from "react";
import { Heart, Play, Trash2 } from "lucide-react";
import { TrackModel } from "../types";
import { motion } from "motion/react";

interface FavoritesViewProps {
  favorites: TrackModel[];
  onPlayTrack: (track: TrackModel, contextQueue?: TrackModel[]) => void;
  onToggleFavorite: (track: TrackModel) => void;
}

const listContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const listItemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  }
};

export default function FavoritesView({
  favorites,
  onPlayTrack,
  onToggleFavorite
}: FavoritesViewProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full pb-24 font-mono text-black select-none"
    >
      {/* Header */}
      <div className="border-b-4 border-black pb-3 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter uppercase">SAVED_FAVORITES.EXE</h1>
          <p className="text-xs text-brand-muted mt-1 uppercase">YOUR LOCALLY ARCHIVED AUDIO TRACKS</p>
        </div>
        <div className="text-xs font-bold bg-black text-[#F5F0E8] px-3 py-1 uppercase">
          {favorites.length} TRACKS
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="w-full border-2 border-black mechanical-outset p-12 flex flex-col items-center justify-center bg-white relative overflow-hidden jewel-case">
          <div className="halftone-overlay absolute inset-0" />
          <Heart className="w-12 h-12 text-[#CC0000] mb-4 animate-pulse" />
          <h3 className="font-serif text-xl font-bold mb-2">NO ARCHIVED RECORDS</h3>
          <p className="font-mono text-xs uppercase text-brand-muted">POPULATE THE REPOSITORY BY SAVING SOUNDTRACKS</p>
        </div>
      ) : (
        <motion.div 
          variants={listContainerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-2"
        >
          {favorites.map((song) => (
            <motion.div 
              key={song.videoId}
              variants={listItemVariants}
              className="flex items-center justify-between group p-3 hover:bg-black hover:text-[#f4f4f0] border-2 border-black bg-white mechanical-outset transition-all duration-100 cursor-pointer relative overflow-hidden"
              onClick={() => onPlayTrack(song, favorites)}
            >
              <div className="flex items-center gap-4 cursor-pointer flex-1 min-w-0 z-10">
                <div className="w-12 h-12 flex-shrink-0 border-2 border-black bg-white p-0.5 overflow-hidden">
                  <img 
                    src={song.thumbnailUrl} 
                    alt={song.title} 
                    className="w-full h-full object-cover filter grayscale"
                  />
                </div>
                <div className="min-w-0 pr-2">
                  <p className="font-bold text-sm truncate uppercase">
                    {song.title}
                  </p>
                  <p className="text-[10px] text-brand-muted group-hover:text-white/70 mt-1 truncate uppercase">{song.artist}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 z-10">
                {/* Play hover button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayTrack(song, favorites);
                  }}
                  className="p-2 border-2 border-black bg-[#F5F0E8] text-black hover:bg-black hover:text-[#00ff66] transition-colors"
                >
                  <Play className="w-4 h-4 fill-current" />
                </button>

                {/* Remove button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(song);
                  }}
                  className="p-2 border-2 border-black bg-[#FFF2F2] text-[#CC0000] hover:bg-[#CC0000] hover:text-white transition-colors"
                  title="REMOVE RECORD"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
