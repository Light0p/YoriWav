const fs = require('fs');
let code = fs.readFileSync('src/components/NowPlayingView.tsx', 'utf8');

// Insert the new controls below the visualizer screen
const oldVisualizerEnd = `          </div>
        </div>

        {/* Digital read out panel */}`;

const newControls = `          </div>
        </div>

        {/* --- ADDED: Media Controls & Track Info --- */}
        <div className="border-[1.5px] border-brand-fg bg-brand-surface p-6 shadow-[4px_4px_0_0_#0D0D0D] flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Track Info */}
          <div className="flex items-center gap-4 flex-1 w-full min-w-0">
             <div className="min-w-0 flex-1">
               <div className="flex items-center gap-3">
                 <h2 className="font-serif text-2xl md:text-3xl font-bold truncate">{currentTrack.title}</h2>
                 {favorites && onToggleFavorite && (
                   <button 
                     onClick={() => onToggleFavorite(currentTrack)}
                     className="text-brand-fg hover:scale-110 transition-transform active:scale-95 shrink-0"
                   >
                     <Heart className={\`w-6 h-6 \${favorites.some(f => f.videoId === currentTrack.videoId) ? 'fill-current' : ''}\`} />
                   </button>
                 )}
               </div>
               <p className="font-mono text-sm md:text-base text-brand-muted uppercase truncate mt-1">{currentTrack.artist}</p>
             </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-4 md:gap-6 shrink-0">
             <button className="text-brand-muted hover:text-brand-fg transition-colors hidden sm:block">
               <Shuffle className="w-5 h-5" />
             </button>
             
             <button 
               onClick={onSkipPrevious}
               className="text-brand-fg hover:scale-110 transition-transform active:scale-95"
             >
               <SkipBack className="w-7 h-7" />
             </button>
             
             <button 
               onClick={onPlayPause}
               className="w-16 h-16 rounded-full border-[2px] border-brand-fg bg-brand-fg text-brand-bg flex items-center justify-center shadow-[4px_4px_0_0_#0D0D0D] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#0D0D0D] transition-all active:translate-x-[4px] active:translate-y-[4px] active:shadow-none shrink-0"
             >
               {isPlaying ? (
                 <Pause className="w-8 h-8 fill-current" />
               ) : (
                 <Play className="w-8 h-8 fill-current ml-1" />
               )}
             </button>
             
             <button 
               onClick={onSkipNext}
               className="text-brand-fg hover:scale-110 transition-transform active:scale-95"
             >
               <SkipForward className="w-7 h-7" />
             </button>
             
             <button className="text-brand-muted hover:text-brand-fg transition-colors hidden sm:block">
               <Repeat className="w-5 h-5" />
             </button>
          </div>
        </div>
        {/* --- END ADDED --- */}

        {/* Digital read out panel */}`;

code = code.replace(oldVisualizerEnd, newControls);

// Update Queue mapping
const oldQueue = /TRACKS\.filter\(t => t\.videoId !== currentTrack\.videoId\)\.map\(\(track, i\) => \(/;
const newQueue = `(queue || []).slice(currentTrackIndex + 1).map((track, i) => (`;
code = code.replace(oldQueue, newQueue);

// Update history queue as well
const oldHistoryEmpty = /<div className="font-mono text-\[10px\] text-brand-muted text-center py-8">\s*NO RECENT SESSION LOGS PRESENT\.\s*<\/div>/;
const newHistory = `
                (queue || []).slice(0, currentTrackIndex).reverse().length > 0 ? (
                  (queue || []).slice(0, currentTrackIndex).reverse().map((track, i) => (
                    <div 
                      key={track.videoId + '-' + i}
                      onClick={() => onPlayTrack(track, queue)}
                      className="group flex items-center justify-between p-2 border-[1.5px] border-transparent hover:border-brand-fg hover:bg-brand-surface cursor-pointer transition-all opacity-70 hover:opacity-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 border border-brand-fg bg-white overflow-hidden p-0.5">
                          <img 
                            src={track.thumbnailUrl || undefined} 
                            alt={track.title} 
                            className="w-full h-full object-cover filter grayscale"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-serif text-xs font-bold leading-tight group-hover:underline truncate">
                            {track.title}
                          </p>
                          <p className="font-mono text-[9px] text-brand-muted uppercase truncate mt-0.5">
                            {track.artist}
                          </p>
                        </div>
                      </div>
                      <Play className="w-3 h-3 text-brand-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))
                ) : (
                  <div className="font-mono text-[10px] text-brand-muted text-center py-8">
                    NO RECENT SESSION LOGS PRESENT.
                  </div>
                )
`;
code = code.replace(oldHistoryEmpty, newHistory);

// Fix the click handler for upcoming queue items to pass the queue
code = code.replace(/onClick=\{\(\) => onPlayTrack\(track\)\}/, 'onClick={() => onPlayTrack(track, queue)}');

fs.writeFileSync('src/components/NowPlayingView.tsx', code);
