import React, { useState, useEffect } from "react";
import { 
  Play, 
  Heart, 
  Sliders, 
  Search,
  Info,
  Loader2
} from "lucide-react";
import { TrackModel, RoomModel } from "../types";
import { Users, Plus } from "lucide-react";
import { musicApi } from "../lib/providers/saavnProvider";
import { motion } from "motion/react";
import LazyViewport from "./LazyViewport";

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

interface OtherViewsProps {
  onPlayTrack: (track: TrackModel, contextQueue?: TrackModel[]) => void;
  favorites: TrackModel[];
  onToggleFavorite: (track: TrackModel) => void;
}

interface LibraryViewProps extends OtherViewsProps {
  playlists?: any[];
  onSelectPlaylist?: (playlist: any) => void;
  onCreatePlaylist?: () => void;
}

export function LibraryView({
  onPlayTrack,
  favorites,
  onToggleFavorite,
  playlists = [],
  onSelectPlaylist,
  onCreatePlaylist
}: LibraryViewProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full pb-[120px]"
    >
      <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-6 gap-4">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold leading-none shrink-0 whitespace-nowrap">Your Playlists</h2>
        <button onClick={onCreatePlaylist} className="font-mono text-[10px] text-brand-bg bg-brand-fg px-2.5 py-1.5 uppercase transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-black hover:text-[#f4f4f0] active:scale-95 cursor-pointer shrink-0">
          + NEW PLAYLIST
        </button>
      </div>
      
      {playlists.length === 0 ? (
        <div className="w-full border-2 border-black p-8 flex flex-col items-center justify-center text-center bg-brand-surface shadow-[4px_4px_0_0_#0D0D0D] mb-12">
          <h3 className="font-serif text-xl font-bold mb-2">NO PLAYLISTS</h3>
          <p className="font-mono text-xs uppercase text-brand-muted">CREATE ONE TO START ORGANIZING</p>
        </div>
      ) : (
        <motion.div 
          variants={listContainerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {playlists.map((playlist: any) => (
            <LazyViewport key={playlist.id}>
              <motion.div 
                variants={listItemVariants}
                onClick={() => onSelectPlaylist && onSelectPlaylist(playlist)}
                className="group cursor-pointer border-2 border-black bg-white p-3 md:p-4 shadow-[4px_4px_0_0_#0D0D0D] transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-black hover:text-[#f4f4f0] active:scale-95"
              >
                <div className="w-full aspect-square border-2 border-black bg-brand-surface mb-3 relative overflow-hidden">
                   {playlist.customAvatar ? (
                     <img src={playlist.customAvatar} alt="Cover" className="w-full h-full object-cover filter grayscale" />
                   ) : (
                     <div className="grid grid-cols-2 grid-rows-2 w-full h-full">
                        {[0, 1, 2, 3].map(i => (
                          <div key={i} className={`w-full h-full ${i % 2 === 0 ? 'border-r-2' : ''} ${i < 2 ? 'border-b-2' : ''} border-black bg-white overflow-hidden`}>
                             {playlist.tracks[i] ? (
                               <img src={playlist.tracks[i].thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover filter grayscale" />
                             ) : (
                               <div className="w-full h-full bg-brand-bg flex items-center justify-center font-mono text-[10px] text-brand-muted">#</div>
                             )}
                          </div>
                        ))}
                     </div>
                   )}
                   <div className="absolute inset-0 bg-brand-fg/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <div className="w-10 h-10 rounded-full bg-brand-fg text-brand-bg flex items-center justify-center">
                       <Play className="w-5 h-5 ml-1 fill-current" />
                     </div>
                   </div>
                </div>
                <p className="font-serif font-bold text-sm truncate">{playlist.name}</p>
                <p className="font-mono text-[10px] text-brand-muted mt-0.5">{playlist.tracks.length} TRACKS</p>
              </motion.div>
            </LazyViewport>
          ))}
        </motion.div>
      )}

      <div className="flex items-baseline justify-between border-b-2 border-black pb-2 mb-6">
        <h2 className="font-serif text-3xl font-bold leading-none">Liked Songs</h2>
        <span className="font-mono text-[10px] text-brand-muted">SAVED TRACKS</span>
      </div>

      {favorites.length === 0 ? (
        <div className="w-full border-2 border-black p-8 flex flex-col items-center justify-center text-center bg-white shadow-[4px_4px_0_0_#0D0D0D]">
          <Heart className="w-12 h-12 text-brand-fg mb-4" />
          <h3 className="font-serif text-xl font-bold mb-2">NO SAVED TRACKS YET.</h3>
          <p className="font-mono text-xs uppercase text-brand-muted">GO LIKE SOME MUSIC.</p>
        </div>
      ) : (
        <motion.div 
          variants={listContainerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-2"
        >
          {favorites.map((song) => (
            <LazyViewport key={song.videoId}>
              <motion.div 
                variants={listItemVariants}
                className="flex items-center justify-between group p-3 hover:bg-brand-surface border-[1.5px] border-transparent hover:border-brand-fg transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-black hover:text-[#f4f4f0] active:scale-95 cursor-pointer"
              >
                <div 
                  className="flex items-center gap-4 cursor-pointer flex-1 min-w-0" 
                  onClick={() => onPlayTrack(song, favorites)}
                >
                  <div className="w-12 h-12 flex-shrink-0 border-[1.5px] border-brand-fg bg-white p-0.5 overflow-hidden">
                    <img 
                      src={song.thumbnailUrl} 
                      alt={song.title} 
                      className="w-full h-full object-cover filter grayscale"
                    />
                  </div>
                  <div className="min-w-0 pr-2">
                    <p className="font-serif text-[15px] font-bold leading-tight group-hover:text-brand-fg truncate">
                      {song.title}
                    </p>
                    <p className="font-mono text-[10px] text-brand-muted mt-1 truncate">{song.artist}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button 
                    onClick={() => onToggleFavorite(song)} 
                    className="w-8 h-8 flex items-center justify-center text-brand-fg"
                  >
                    <Heart className="w-4 h-4" fill="currentColor" />
                  </button>
                  <button 
                    onClick={() => onPlayTrack(song, favorites)} 
                    className="w-8 h-8 border-[1.5px] border-brand-fg flex items-center justify-center text-brand-fg hover:bg-brand-fg hover:text-brand-bg transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-black hover:text-[#f4f4f0] active:scale-95 cursor-pointer shadow-[2px_2px_0_0_#0D0D0D]"
                  >
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </button>
                </div>
              </motion.div>
            </LazyViewport>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

export function SearchView({
  onPlayTrack,
  favorites,
  onToggleFavorite
}: OtherViewsProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([
    "#DARK_SYNTH",
    "NIGHTDRIVE",
    "LO-FI BEATS",
    "RETRO WAVE"
  ]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await musicApi.search(query);
        setResults(data);
        
        // Save to log history if we got results
        if (data && data.length > 0) {
          setHistory(prev => {
            const clean = query.trim().toUpperCase();
            const filtered = prev.filter(item => item !== clean);
            return [clean, ...filtered].slice(0, 5);
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const trendingTags = [
    "#DARK_SYNTH",
    "#LO-FI",
    "#90S_RAW",
    "#EXPERIMENTAL",
    "#AMBIENT",
    "#INDUSTRIAL",
    "#RETRO_WAVE"
  ];

  const browseCategories = [
    { label: "[ A-Z ARTISTS ]", queryValue: "A-Z Artists" },
    { label: "[ TOP_CHARTS ]", queryValue: "Top Charts" },
    { label: "[ NEW_RELEASES ]", queryValue: "New Releases" },
    { label: "[ EXPERIMENTAL ]", queryValue: "Experimental" }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full h-full flex flex-col pb-[120px] px-4 relative min-h-[500px]"
    >
      <div className="halftone-overlay absolute inset-0 opacity-5 pointer-events-none" />
      
      <div className="mb-6 relative z-10">
        <input 
          type="text"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for songs, artists..."
          className="w-full border-[2px] border-brand-fg bg-white p-4 font-mono text-sm focus:outline-none focus:bg-brand-surface/30 shadow-[4px_4px_0_0_#0D0D0D] uppercase placeholder-black/50"
        />
      </div>
      
      <div className="flex-1 overflow-y-auto pb-4 relative z-10">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand-fg" />
          </div>
        ) : results.length > 0 ? (
          <motion.div 
            variants={listContainerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-2"
          >
            {results.map((song) => (
              <LazyViewport key={song.videoId}>
                <motion.div 
                  variants={listItemVariants}
                  className="flex items-center justify-between group p-3 hover:bg-brand-surface border-[1.5px] border-transparent hover:border-brand-fg transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-black hover:text-[#f4f4f0] active:scale-95 cursor-pointer"
                >
                  <div 
                    className="flex items-center gap-4 cursor-pointer flex-1 min-w-0" 
                    onClick={() => {
                      const trackModel = {
                        videoId: song.videoId,
                        title: song.title,
                        artist: song.artist,
                        thumbnailUrl: song.thumbnailUrl,
                        durationSeconds: 0,
                        audioUrl: ""
                      };
                      const searchQueue = results.map(r => ({
                        videoId: r.videoId,
                        title: r.title,
                        artist: r.artist,
                        thumbnailUrl: r.thumbnailUrl,
                        durationSeconds: 0,
                        audioUrl: ""
                      }));
                      onPlayTrack(trackModel, searchQueue);;
                    }}
                  >
                    <div className="w-12 h-12 flex-shrink-0 border-[1.5px] border-brand-fg bg-white p-0.5 overflow-hidden">
                      <img 
                        src={song.thumbnailUrl} 
                        alt={song.title} 
                        className="w-full h-full object-cover filter grayscale"
                      />
                    </div>
                    <div className="min-w-0 pr-2">
                      <p className="font-serif text-[15px] font-bold leading-tight group-hover:text-brand-fg truncate">
                        {song.title}
                      </p>
                      <p className="font-mono text-[10px] text-brand-muted mt-1 truncate">{song.artist}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button 
                      onClick={() => onToggleFavorite({ videoId: song.videoId, title: song.title, artist: song.artist, thumbnailUrl: song.thumbnailUrl, durationSeconds: 0, audioUrl: "" })} 
                      className="w-8 h-8 flex items-center justify-center text-brand-muted hover:text-brand-fg"
                    >
                      <Heart className="w-4 h-4" fill={favorites.some(f => f.videoId === song.videoId) ? "currentColor" : "none"} />
                    </button>
                    <button 
                      onClick={() => {
                        const trackModel = {
                          videoId: song.videoId,
                          title: song.title,
                          artist: song.artist,
                          thumbnailUrl: song.thumbnailUrl,
                          durationSeconds: 0,
                          audioUrl: ""
                        };
                        const searchQueue = results.map(r => ({
                          videoId: r.videoId,
                          title: r.title,
                          artist: r.artist,
                          thumbnailUrl: r.thumbnailUrl,
                          durationSeconds: 0,
                          audioUrl: ""
                        }));
                        onPlayTrack(trackModel, searchQueue);;
                      }} 
                      className="w-8 h-8 border-[1.5px] border-brand-fg flex items-center justify-center text-brand-fg hover:bg-brand-fg hover:text-brand-bg transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-black hover:text-[#f4f4f0] active:scale-95 cursor-pointer shadow-[2px_2px_0_0_#0D0D0D]"
                    >
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </button>
                  </div>
                </motion.div>
              </LazyViewport>
            ))}
          </motion.div>
        ) : query ? (
          <div className="text-center py-12 font-mono text-sm text-brand-muted">
            NO RESULTS FOUND.
          </div>
        ) : (
          <div className="space-y-8 pb-12">
            {/* 1. Search Command Log (Recent Searches) */}
            <div>
              <h3 className="font-mono text-xs font-bold text-black uppercase tracking-widest mb-3">
                [ LOG_HISTORY ]
              </h3>
              <div className="border-2 border-black bg-white divide-y divide-black">
                {history.map((item, index) => (
                  <div 
                    key={index} 
                    className="flex justify-between items-center border-b border-black py-3 px-3 last:border-b-0"
                  >
                    <span className="font-mono text-xs font-bold text-black truncate uppercase">
                      {item}
                    </span>
                    <button 
                      onClick={() => setQuery(item)}
                      className="border-2 border-black bg-[#F1ECE3] hover:bg-black hover:text-white px-3 py-1 text-[10px] font-mono font-bold uppercase transition-colors shrink-0 cursor-pointer"
                    >
                      [ EXECUTE ]
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Frequency Tags (Trending Categories) */}
            <div>
              <h3 className="font-mono text-xs font-bold text-black uppercase tracking-widest mb-2">
                [ ACTIVE_FREQUENCIES ]
              </h3>
              <div className="flex flex-wrap gap-2 p-2 min-h-[100px] border-2 border-black mt-2">
                {trendingTags.map((tag) => (
                  <button 
                    key={tag} 
                    onClick={() => setQuery(tag)}
                    className="border-2 border-black px-3 py-1 font-mono text-[10px] uppercase font-bold bg-[#F1ECE3] hover:bg-black hover:text-white transition-colors cursor-pointer"
                  >
                    [ {tag} ]
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Archive Index (Grid) */}
            <div>
              <h3 className="font-mono text-xs font-bold text-black uppercase tracking-widest mb-3">
                [ DATABASE_BROWSE ]
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {browseCategories.map((cat, index) => (
                  <div 
                    key={index}
                    onClick={() => setQuery(cat.queryValue)}
                    className="mechanical-outset border-2 border-black p-4 text-center font-mono font-bold text-xs uppercase cursor-pointer hover:bg-black hover:text-[#f4f4f0] active:bg-[#2A4B9B] active:text-white transition-all select-none"
                  >
                    {cat.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface MixerViewProps {
  channels: { bass: number; mid: number; treble: number; gain: number };
  onChannelChange: (channel: string, value: number) => void;
}

export function MixerView({ channels, onChannelChange }: MixerViewProps) {
  const handleChannelChange = (channel: string, value: number) => {
    onChannelChange(channel, value);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full"
    >
      <div className="flex justify-between items-end border-b-[1.5px] border-brand-fg pb-2 mb-6">
        <h2 className="font-serif text-3xl font-bold leading-none">Console Mixer</h2>
        <span className="font-mono text-[10px] text-brand-muted">ACTIVE EQUALIZATION BOARD</span>
      </div>

      <div className="border-[1.5px] border-brand-fg bg-[#EDE8DF] p-6 shadow-[4px_4px_0_0_#0D0D0D]">
        
        {/* Console chassis wrapper */}
        <div className="border-[1.5px] border-brand-fg bg-[#DFD9CE] p-6 relative flex flex-col md:flex-row justify-around gap-12">
          
          {/* Channel Fader 1 - Bass */}
          <div className="flex flex-col items-center">
            <span className="font-mono text-[10px] text-brand-fg font-bold tracking-widest border-b border-brand-fg/20 pb-1 mb-6">01_BASS</span>
            
            <div className="relative h-48 w-1 flex items-center justify-center bg-brand-fg">
              <div className="absolute left-1/2 -translate-x-1/2 -top-2 text-[8px] font-mono">+12db</div>
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-4 text-[8px] font-mono">-12db</div>
              
              <input 
                type="range"
                min="-12"
                max="12"
                step="0.1"
                value={channels.bass}
                onChange={(e) => handleChannelChange("bass", parseFloat(e.target.value))}
                className="absolute origin-center -rotate-90 w-44 cursor-row-resize accent-brand-fg"
                style={{ WebkitAppearance: "slider-vertical" } as any}
              />
            </div>
            
            <span className="font-mono text-xs font-bold mt-12 bg-white border border-brand-fg px-1.5 py-0.5">
              {channels.bass > 0 ? '+' : ''}{channels.bass.toFixed(1)} dB
            </span>
          </div>

          {/* Channel Fader 2 - Mid */}
          <div className="flex flex-col items-center">
            <span className="font-mono text-[10px] text-brand-fg font-bold tracking-widest border-b border-brand-fg/20 pb-1 mb-6">02_MID</span>
            
            <div className="relative h-48 w-1 flex items-center justify-center bg-brand-fg">
              <div className="absolute left-1/2 -translate-x-1/2 -top-2 text-[8px] font-mono">+12db</div>
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-4 text-[8px] font-mono">-12db</div>
              
              <input 
                type="range"
                min="-12"
                max="12"
                step="0.1"
                value={channels.mid}
                onChange={(e) => handleChannelChange("mid", parseFloat(e.target.value))}
                className="absolute origin-center -rotate-90 w-44 cursor-row-resize accent-brand-fg"
                style={{ WebkitAppearance: "slider-vertical" } as any}
              />
            </div>
            
            <span className="font-mono text-xs font-bold mt-12 bg-white border border-brand-fg px-1.5 py-0.5">
              {channels.mid > 0 ? '+' : ''}{channels.mid.toFixed(1)} dB
            </span>
          </div>

          {/* Channel Fader 3 - Treble */}
          <div className="flex flex-col items-center">
            <span className="font-mono text-[10px] text-brand-fg font-bold tracking-widest border-b border-brand-fg/20 pb-1 mb-6">03_TREB</span>
            
            <div className="relative h-48 w-1 flex items-center justify-center bg-brand-fg">
              <div className="absolute left-1/2 -translate-x-1/2 -top-2 text-[8px] font-mono">+12db</div>
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-4 text-[8px] font-mono">-12db</div>
              
              <input 
                type="range"
                min="-12"
                max="12"
                step="0.1"
                value={channels.treble}
                onChange={(e) => handleChannelChange("treble", parseFloat(e.target.value))}
                className="absolute origin-center -rotate-90 w-44 cursor-row-resize accent-brand-fg"
                style={{ WebkitAppearance: "slider-vertical" } as any}
              />
            </div>
            
            <span className="font-mono text-xs font-bold mt-12 bg-white border border-brand-fg px-1.5 py-0.5">
              {channels.treble > 0 ? '+' : ''}{channels.treble.toFixed(1)} dB
            </span>
          </div>

          {/* Channel Fader 4 - Master Gain */}
          <div className="flex flex-col items-center">
            <span className="font-mono text-[10px] text-brand-error font-bold tracking-widest border-b border-brand-error/20 pb-1 mb-6">MASTER_GAIN</span>
            
            <div className="relative h-48 w-1 flex items-center justify-center bg-brand-error">
              <div className="absolute left-1/2 -translate-x-1/2 -top-2 text-[8px] font-mono text-brand-error font-bold">CLIP</div>
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-4 text-[8px] font-mono">-12db</div>
              
              <input 
                type="range"
                min="-12"
                max="12"
                step="0.1"
                value={channels.gain}
                onChange={(e) => handleChannelChange("gain", parseFloat(e.target.value))}
                className="absolute origin-center -rotate-90 w-44 cursor-row-resize accent-brand-error"
                style={{ WebkitAppearance: "slider-vertical" } as any}
              />
            </div>
            
            <span className="font-mono text-xs font-bold mt-12 bg-brand-error text-white border border-brand-error px-1.5 py-0.5">
              {channels.gain > 0 ? '+' : ''}{channels.gain.toFixed(1)} dB
            </span>
          </div>
        </div>

        {/* Master details log */}
        <div className="mt-6 flex gap-3 font-mono text-[10px] text-brand-muted">
          <Info className="w-4 h-4 text-brand-fg shrink-0 mt-0.5" />
          <span>CHANNEL DEVIATIONS AUTOMATICALLY CONFORMED TO SOUND HELIX STANDARDS. FREQUENCY ENHANCEMENTS ARE CLIENT-SIDE ONLY.</span>
        </div>
      </div>
    </motion.div>
  );
}



interface RoomsListViewProps {
  activeRooms: RoomModel[];
  onJoinRoom: (roomId: string) => void;
  onCreateRoom: () => void;
}
export function RoomsListView({ activeRooms, onJoinRoom, onCreateRoom }: RoomsListViewProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full pb-[120px]"
    >
      <div className="flex items-baseline justify-between border-b-2 border-black pb-2 mb-4">
        <h2 className="font-serif text-3xl font-bold leading-none">Live Rooms</h2>
        <span className="font-mono text-[10px] text-brand-muted">NETWORKED AUDIO SESSIONS</span>
      </div>

      <div className="flex flex-col gap-4">
        <button 
          onClick={onCreateRoom}
          className="w-full border-[1.5px] border-brand-fg bg-brand-fg text-brand-bg py-4 font-mono font-bold text-lg uppercase tracking-widest transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-black hover:text-[#f4f4f0] active:scale-95 cursor-pointer shadow-[4px_4px_0_0_#0D0D0D]"
        >
          <div className="flex items-center justify-center gap-2">
            <Plus className="w-6 h-6" />
            CREATE NEW JAM ROOM
          </div>
        </button>

        <motion.div 
          variants={listContainerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4"
        >
          {activeRooms.length === 0 ? (
            <div className="col-span-full border-[1.5px] border-brand-fg border-dashed p-8 text-center bg-brand-surface/40">
              <span className="font-mono text-sm text-brand-muted">NO ACTIVE ROOMS FOUND.</span>
            </div>
          ) : (
            activeRooms.map(room => (
              <motion.div 
                key={room.roomId}
                variants={listItemVariants}
                onClick={() => onJoinRoom(room.roomId)}
                className="border-[1.5px] border-brand-fg bg-white p-4 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-black hover:text-[#f4f4f0] active:scale-95 flex flex-col justify-between shadow-[4px_4px_0_0_#0D0D0D]"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-xs font-bold underline decoration-2 truncate max-w-[150px]">
                      {room.roomId.substring(0, 8).toUpperCase()}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[9px] bg-brand-fg text-brand-bg px-1 font-bold">
                      <Users className="w-3 h-3" /> LIVE
                    </span>
                  </div>
                  <div className="font-mono text-[10px] text-brand-muted mb-4">
                    Host: {room.hostName}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border border-brand-fg flex-shrink-0 bg-brand-surface overflow-hidden">
                    <img src={room.trackThumbnailUrl} alt="" className="w-full h-full object-cover filter grayscale" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-serif text-xs font-bold truncate">{room.trackTitle}</p>
                    <p className="font-mono text-[9px] text-brand-muted truncate">{room.trackArtist}</p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
