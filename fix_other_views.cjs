const fs = require('fs');

const code = `import React, { useState, useEffect } from "react";
import { 
  Play, 
  Heart, 
  Sliders, 
  Search,
  Info,
  Loader2
} from "lucide-react";
import { TrackModel } from "../types";
import { musicProvider } from "../lib/providers";

interface OtherViewsProps {
  onPlayTrack: (track: TrackModel) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

export function LibraryView({
  onPlayTrack,
  favorites,
  onToggleFavorite
}: OtherViewsProps) {
  // In a real app we'd fetch actual track data for the favorite IDs.
  // For now, we'll just show the empty state or assume we have the data if we wanted.
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-end border-b-[1.5px] border-brand-fg pb-2 mb-6">
        <h2 className="font-serif text-3xl font-bold leading-none">Liked Songs</h2>
        <span className="font-mono text-[10px] text-brand-muted">SAVED TRACKS</span>
      </div>

      {favorites.length === 0 ? (
        <div className="w-full border-[1.5px] border-brand-fg p-12 flex flex-col items-center justify-center bg-white shadow-[4px_4px_0_0_#0D0D0D]">
          <Heart className="w-12 h-12 text-brand-fg mb-4" />
          <h3 className="font-serif text-xl font-bold mb-2">NO SAVED TRACKS YET.</h3>
          <p className="font-mono text-xs uppercase text-brand-muted">GO LIKE SOME MUSIC.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="w-full border-[1.5px] border-brand-fg p-8 flex flex-col items-center justify-center bg-white shadow-[4px_4px_0_0_#0D0D0D]">
             <h3 className="font-serif text-xl font-bold mb-2">YOU HAVE {favorites.length} SAVED TRACKS.</h3>
             <p className="font-mono text-xs uppercase text-brand-muted">Data fetching for saved tracks would happen here.</p>
          </div>
        </div>
      )}
    </div>
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

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await musicProvider.search(query);
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-6">
        <input 
          type="text"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for songs, artists..."
          className="w-full border-[2px] border-brand-fg bg-white p-4 font-mono text-sm focus:outline-none focus:bg-brand-surface/30 shadow-[4px_4px_0_0_#0D0D0D]"
        />
      </div>
      
      <div className="flex-1 overflow-y-auto pb-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand-fg" />
          </div>
        ) : results.length > 0 ? (
          <div className="flex flex-col gap-2">
            {results.map((song) => (
              <div 
                key={song.videoId}
                className="flex items-center justify-between group p-3 hover:bg-brand-surface border-[1.5px] border-transparent hover:border-brand-fg transition-colors"
              >
                <div 
                  className="flex items-center gap-4 cursor-pointer flex-1 min-w-0" 
                  onClick={() => {
                    onPlayTrack({
                      videoId: song.videoId,
                      title: song.title,
                      artist: song.artist,
                      thumbnailUrl: song.thumbnailUrl,
                      durationSeconds: 0,
                      audioUrl: ""
                    });
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
                    onClick={() => onToggleFavorite(song.videoId)} 
                    className="w-8 h-8 flex items-center justify-center text-brand-muted hover:text-brand-fg"
                  >
                    <Heart className="w-4 h-4" fill={favorites.includes(song.videoId) ? "currentColor" : "none"} />
                  </button>
                  <button 
                    onClick={() => {
                      onPlayTrack({
                        videoId: song.videoId,
                        title: song.title,
                        artist: song.artist,
                        thumbnailUrl: song.thumbnailUrl,
                        durationSeconds: 0,
                        audioUrl: ""
                      });
                    }} 
                    className="w-8 h-8 border-[1.5px] border-brand-fg flex items-center justify-center text-brand-fg hover:bg-brand-fg hover:text-brand-bg transition-colors shadow-[2px_2px_0_0_#0D0D0D] active:translate-y-0.5 active:shadow-none"
                  >
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : query ? (
          <div className="text-center py-12 font-mono text-sm text-brand-muted">
            NO RESULTS FOUND.
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function MixerView() {
  const [channels, setChannels] = useState({
    bass: 0.5,
    mid: 0.7,
    treble: 0.6,
    gain: 0.8
  });

  const handleChannelChange = (channel: string, value: number) => {
    setChannels(prev => ({
      ...prev,
      [channel]: value
    }));
  };

  return (
    <div className="w-full">
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
              {/* Slits details */}
              <div className="absolute left-1/2 -translate-x-1/2 -top-2 text-[8px] font-mono">+12db</div>
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-4 text-[8px] font-mono">-12db</div>
              
              <input 
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={channels.bass}
                onChange={(e) => handleChannelChange("bass", parseFloat(e.target.value))}
                className="absolute origin-center -rotate-90 w-44 cursor-row-resize accent-brand-fg"
                style={{ WebkitAppearance: "slider-vertical" } as any}
              />
            </div>
            
            <span className="font-mono text-xs font-bold mt-12 bg-white border border-brand-fg px-1.5 py-0.5">
              {Math.round(channels.bass * 100)}%
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
                min="0"
                max="1"
                step="0.01"
                value={channels.mid}
                onChange={(e) => handleChannelChange("mid", parseFloat(e.target.value))}
                className="absolute origin-center -rotate-90 w-44 cursor-row-resize accent-brand-fg"
                style={{ WebkitAppearance: "slider-vertical" } as any}
              />
            </div>
            
            <span className="font-mono text-xs font-bold mt-12 bg-white border border-brand-fg px-1.5 py-0.5">
              {Math.round(channels.mid * 100)}%
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
                min="0"
                max="1"
                step="0.01"
                value={channels.treble}
                onChange={(e) => handleChannelChange("treble", parseFloat(e.target.value))}
                className="absolute origin-center -rotate-90 w-44 cursor-row-resize accent-brand-fg"
                style={{ WebkitAppearance: "slider-vertical" } as any}
              />
            </div>
            
            <span className="font-mono text-xs font-bold mt-12 bg-white border border-brand-fg px-1.5 py-0.5">
              {Math.round(channels.treble * 100)}%
            </span>
          </div>

          {/* Channel Fader 4 - Master Gain */}
          <div className="flex flex-col items-center">
            <span className="font-mono text-[10px] text-brand-error font-bold tracking-widest border-b border-brand-error/20 pb-1 mb-6">MASTER_GAIN</span>
            
            <div className="relative h-48 w-1 flex items-center justify-center bg-brand-error">
              <div className="absolute left-1/2 -translate-x-1/2 -top-2 text-[8px] font-mono text-brand-error font-bold">CLIP</div>
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-4 text-[8px] font-mono">0.0db</div>
              
              <input 
                type="range"
                min="0"
                max="12"
                step="0.1"
                value={channels.gain * 10}
                onChange={(e) => handleChannelChange("gain", parseFloat(e.target.value) / 10)}
                className="absolute origin-center -rotate-90 w-44 cursor-row-resize accent-brand-error"
                style={{ WebkitAppearance: "slider-vertical" } as any}
              />
            </div>
            
            <span className="font-mono text-xs font-bold mt-12 bg-brand-error text-white border border-brand-error px-1.5 py-0.5">
              {(channels.gain * 10).toFixed(1)} dB
            </span>
          </div>
        </div>

        {/* Master details log */}
        <div className="mt-6 flex gap-3 font-mono text-[10px] text-brand-muted">
          <Info className="w-4 h-4 text-brand-fg shrink-0 mt-0.5" />
          <span>CHANNEL DEVIATIONS AUTOMATICALLY CONFORMED TO SOUND HELIX STANDARDS. FREQUENCY ENHANCEMENTS ARE CLIENT-SIDE ONLY.</span>
        </div>
      </div>
    </div>
  );
}
`
fs.writeFileSync('src/components/OtherViews.tsx', code);
