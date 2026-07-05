import React from 'react';
import { Play, Pause, Shuffle, ArrowLeft, Heart, Grid2X2 } from 'lucide-react';
import { TrackModel } from '../types';
import { motion } from 'motion/react';

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

interface PlaylistViewProps {
  playlist: any;
  onBack: () => void;
  onPlayTrack: (track: TrackModel, queue?: TrackModel[], isStrictPlaylist?: boolean) => void;
  currentTrack: TrackModel | null;
  isPlaying: boolean;
  onPlayPause: () => void;
}

export default function PlaylistView({
  playlist,
  onBack,
  onPlayTrack,
  currentTrack,
  isPlaying,
  onPlayPause
}: PlaylistViewProps) {

  const handlePlayPlaylist = () => {
    if (playlist.tracks.length === 0) return;
    if (currentTrack && playlist.tracks.some((t: any) => t.videoId === currentTrack.videoId)) {
      onPlayPause();
    } else {
      onPlayTrack(playlist.tracks[0], playlist.tracks, true);
    }
  };

  const handleShufflePlaylist = () => {
    if (playlist.tracks.length === 0) return;
    const shuffled = [...playlist.tracks].sort(() => Math.random() - 0.5);
    onPlayTrack(shuffled[0], shuffled, true);
  };

  const isPlayingPlaylist = currentTrack && playlist.tracks.some((t: any) => t.videoId === currentTrack.videoId);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full pb-[120px]"
    >
      <button 
        onClick={onBack}
        className="mb-6 flex items-center gap-2 font-mono text-xs uppercase font-bold text-brand-fg transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-black hover:text-[#f4f4f0] active:scale-95 cursor-pointer p-1.5 border border-transparent hover:border-brand-fg"
      >
        <ArrowLeft className="w-4 h-4" />
        BACK TO LIBRARY
      </button>

      <div className="flex flex-col md:flex-row gap-6 items-start mb-8 border-[1.5px] border-brand-fg bg-brand-surface p-6 shadow-[6px_6px_0_0_#0D0D0D]">
        <div className="w-32 h-32 md:w-48 md:h-48 border-[1.5px] border-brand-fg flex-shrink-0 bg-white">
          {playlist.customAvatar ? (
             <img src={playlist.customAvatar} alt="Cover" className="w-full h-full object-cover filter grayscale" />
          ) : (
             <div className="grid grid-cols-2 grid-rows-2 w-full h-full">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className={`w-full h-full ${i % 2 === 0 ? 'border-r-[1.5px]' : ''} ${i < 2 ? 'border-b-[1.5px]' : ''} border-brand-fg bg-white overflow-hidden`}>
                     {playlist.tracks[i] ? (
                       <img src={playlist.tracks[i].thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover filter grayscale" />
                     ) : (
                       <div className="w-full h-full bg-brand-bg flex items-center justify-center font-mono text-xl text-brand-muted">#</div>
                     )}
                  </div>
                ))}
             </div>
          )}
        </div>
        
        <div className="flex flex-col flex-1">
          <span className="font-mono text-[10px] text-brand-muted uppercase mb-1">PLAYLIST</span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold leading-none mb-4">{playlist.name}</h2>
          <p className="font-mono text-xs text-brand-fg mb-6">{playlist.tracks.length} TRACKS</p>
          
          <div className="flex gap-4 items-center">
             <button 
               onClick={handlePlayPlaylist}
               className="flex-1 max-w-[200px] border-[2px] border-brand-fg bg-brand-fg text-brand-bg py-3 font-mono font-bold uppercase flex items-center justify-center gap-2 shadow-[4px_4px_0_0_#0D0D0D] transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-black hover:text-[#f4f4f0] active:scale-95 cursor-pointer"
             >
               {isPlayingPlaylist && isPlaying ? (
                 <><Pause className="w-5 h-5 fill-current" /> [ PAUSE ]</>
               ) : (
                 <><Play className="w-5 h-5 fill-current" /> [ PLAY ]</>
               )}
             </button>
             <button 
               onClick={handleShufflePlaylist}
               className="border-[2px] border-brand-fg bg-brand-surface py-3 px-6 font-mono font-bold uppercase flex items-center justify-center shadow-[4px_4px_0_0_#0D0D0D] transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-black hover:text-[#f4f4f0] active:scale-95 cursor-pointer"
             >
               <Shuffle className="w-5 h-5" /> [ SHUFFLE ]
             </button>
          </div>
        </div>
      </div>

      <motion.div 
        variants={listContainerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-2"
      >
         {playlist.tracks.map((track: any, i: number) => (
            <motion.div 
              key={track.videoId + '-' + i}
              variants={listItemVariants}
              onClick={() => onPlayTrack(track, playlist.tracks, true)}
              className="flex items-center justify-between group p-3 hover:bg-brand-surface border-[1.5px] border-transparent hover:border-brand-fg cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-black hover:text-[#f4f4f0] active:scale-95"
            >
               <div className="flex items-center gap-4 flex-1 min-w-0">
                  <span className="font-mono text-[10px] text-brand-muted w-4">{i + 1}.</span>
                  <div className="w-10 h-10 flex-shrink-0 border-[1.5px] border-brand-fg bg-white p-0.5 overflow-hidden">
                    <img 
                      src={track.thumbnailUrl} 
                      alt={track.title} 
                      className="w-full h-full object-cover filter grayscale"
                    />
                  </div>
                  <div className="min-w-0 pr-2">
                    <p className="font-serif text-[15px] font-bold leading-tight group-hover:text-brand-fg truncate">
                      {track.title}
                    </p>
                    <p className="font-mono text-[10px] text-brand-muted mt-1 truncate">{track.artist}</p>
                  </div>
               </div>
               <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-5 h-5 text-brand-fg" />
               </div>
            </motion.div>
         ))}
      </motion.div>
    </motion.div>
  );
}
