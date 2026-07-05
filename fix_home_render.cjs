const fs = require('fs');
let code = fs.readFileSync('src/components/HomeView.tsx', 'utf8');

// Add homeTracks state and effect
const fetchEffect = `
  const [homeTracks, setHomeTracks] = useState<TrackModel[]>([]);
  React.useEffect(() => {
    async function loadHomeData() {
      try {
        const results = await musicProvider.search("Top trending Hindi");
        setHomeTracks(results as any);
      } catch (err) {
        console.error("Failed to load home data", err);
      }
    }
    loadHomeData();
  }, []);
`;
code = code.replace('const categories = ["Classic", "90s", "New", "Instrumental", "Modern Play"];\n  const featuredTrack = TRACKS[0]; // The Suffering', 'const categories = ["Classic", "90s", "New", "Instrumental", "Modern Play"];\n' + fetchEffect);

// Replace Featured Release section
const featuredReplaceRegex = /<span className="font-mono text-xs uppercase tracking-widest text-brand-muted mb-2 border-b-\[1.5px\] border-brand-fg w-fit pb-1">[\s\S]*?<div className="lg:col-span-8 flex flex-col gap-10">/;

const newFeatured = `
            {homeTracks.length > 0 && (
              <>
                <span className="font-mono text-xs uppercase tracking-widest text-brand-muted mb-2 border-b-[1.5px] border-brand-fg w-fit pb-1">
                  Featured Release
                </span>
                <h2 className="font-serif text-5xl font-bold leading-none mb-6">
                  {homeTracks[0].title}
                </h2>
                
                <div className="border-[1.5px] border-brand-fg p-4 bg-brand-surface mb-6 font-mono text-xs">
                  <div className="flex justify-between border-b border-brand-fg/20 pb-2 mb-2">
                    <span>Artist:</span>
                    <span className="font-bold">{homeTracks[0].artist}</span>
                  </div>
                  <div className="flex justify-between border-b border-brand-fg/20 pb-2 mb-2">
                    <span>Format:</span>
                    <span>Digital Stream</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => onPlayTrack(homeTracks[0] as any)}
                    className="btn-brutalist bg-brand-fg text-brand-bg px-6 py-2.5 font-mono text-xs font-bold flex items-center gap-2 hover:bg-brand-fg/95"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    PLAY
                  </button>
                  <button 
                    onClick={() => onToggleFavorite(homeTracks[0].videoId)}
                    className="btn-brutalist bg-brand-surface text-brand-fg px-4 py-2.5 font-mono text-xs hover:bg-brand-surface/75"
                  >
                    <Heart className="w-3.5 h-3.5 inline mr-1" fill={favorites.includes(homeTracks[0].videoId) ? "currentColor" : "none"} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Grid of Content columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Categories and Trending list */}
        <div className="lg:col-span-8 flex flex-col gap-10">
`;

code = code.replace(featuredReplaceRegex, newFeatured);


// Replace Continue Listening (spine list)
const continueReplaceRegex = /<h3 className="font-mono text-xs uppercase tracking-widest text-brand-fg mb-4">\s*Continue Listening\s*<\/h3>\s*<div className="flex flex-col border-\[1.5px\] border-brand-fg bg-white">[\s\S]*?<\/div>\s*<\/section>/;

const newContinue = `
            <h3 className="font-mono text-xs uppercase tracking-widest text-brand-fg mb-4">
              Continue Listening
            </h3>
            <div className="flex flex-col border-[1.5px] border-brand-fg bg-white">
              {homeTracks.slice(1, 4).map((track: any, i) => (
                <div 
                  key={track.videoId}
                  className="flex items-center justify-between p-2 border-b last:border-b-0 border-brand-fg/25 hover:bg-brand-fg hover:text-brand-bg transition-colors group"
                >
                  <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => onPlayTrack(track)}>
                    <div className="w-8 h-8 bg-brand-surface border-r-[1.5px] border-brand-fg flex items-center justify-center font-mono text-[10px] font-bold group-hover:border-brand-bg">
                      0{i + 1}
                    </div>
                    <span className="font-mono text-xs font-bold truncate max-w-[200px]">{track.title}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => onToggleFavorite(track.videoId)}>
                      <Heart className="w-3.5 h-3.5" fill={favorites.includes(track.videoId) ? "currentColor" : "none"} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
`;
code = code.replace(continueReplaceRegex, newContinue);

// Replace Favorite Playlists
const playlistsReplaceRegex = /<section>\s*<h3 className="font-serif text-xl border-b-\[1.5px\] border-brand-fg pb-2 mb-4 font-bold">\s*Favorite Playlists \(4\)\s*<\/h3>[\s\S]*?<\/section>/;

const newPlaylists = `
          <section>
            <h3 className="font-serif text-xl border-b-[1.5px] border-brand-fg pb-2 mb-4 font-bold">
              Trending Tracks
            </h3>
            <div className="flex flex-col gap-3">
              {homeTracks.slice(4, 7).map((track: any) => (
                <div 
                  key={track.videoId}
                  className="flex items-center justify-between group p-2 hover:bg-brand-surface border border-transparent hover:border-brand-fg/20 transition-colors"
                >
                  <div className="flex items-center gap-4 cursor-pointer flex-1 min-w-0" onClick={() => onPlayTrack(track)}>
                    <div className="w-12 h-12 flex-shrink-0 border-[1.5px] border-brand-fg bg-white p-0.5 overflow-hidden">
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
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => onToggleFavorite(track.videoId)} className="w-8 h-8 flex items-center justify-center text-brand-muted hover:text-brand-fg">
                      <Heart className="w-4 h-4" fill={favorites.includes(track.videoId) ? "currentColor" : "none"} />
                    </button>
                    <button onClick={() => onPlayTrack(track)} className="w-8 h-8 rounded-none border-[1.5px] border-brand-fg flex items-center justify-center text-brand-fg group-hover:bg-brand-fg group-hover:text-brand-bg transition-colors">
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
`;

code = code.replace(playlistsReplaceRegex, newPlaylists);

fs.writeFileSync('src/components/HomeView.tsx', code);
