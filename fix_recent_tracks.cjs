const fs = require('fs');

// App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf8');

const saveRecentLogic = `
    // Save to recently played
    try {
      const stored = localStorage.getItem("echo_recent_tracks");
      let recentTracks = stored ? JSON.parse(stored) : [];
      // Deduplicate
      recentTracks = recentTracks.filter((t: any) => t.videoId !== track.videoId);
      recentTracks.unshift(playableTrack);
      if (recentTracks.length > 20) recentTracks = recentTracks.slice(0, 20);
      localStorage.setItem("echo_recent_tracks", JSON.stringify(recentTracks));
      
      // Dispatch custom event to notify HomeView if it's mounted
      window.dispatchEvent(new Event("echo_recent_tracks_updated"));
    } catch (err) {
      console.error("Failed to save recent tracks", err);
    }
`;

appCode = appCode.replace(/(setCurrentTrack\(playableTrack\);[\s\S]*?setIsPlaying\(true\);)/, '$1' + saveRecentLogic);
fs.writeFileSync('src/App.tsx', appCode);

// HomeView.tsx
let homeCode = fs.readFileSync('src/components/HomeView.tsx', 'utf8');

const recentState = `  const [homeTracks, setHomeTracks] = useState<any[]>([]);
  const [recentTracks, setRecentTracks] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");

  const loadRecentTracks = () => {
    try {
      const stored = localStorage.getItem("echo_recent_tracks");
      if (stored) {
        setRecentTracks(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Failed to load recent tracks", err);
    }
  };

  useEffect(() => {
    loadRecentTracks();
    window.addEventListener("echo_recent_tracks_updated", loadRecentTracks);
    return () => window.removeEventListener("echo_recent_tracks_updated", loadRecentTracks);
  }, []);`;

homeCode = homeCode.replace(/const \[homeTracks, setHomeTracks\] = useState<any\[\]>\(\[\]\);\s*const \[activeFilter, setActiveFilter\] = useState\("All"\);/, recentState);

// Now change `const recents = homeTracks.slice(0, 6);`
// to use recentTracks if it has items, else trending or nothing.
// The prompt says: "If the user is entirely new and the recently played list is empty, either fallback to 6 trending tracks OR show a sleek brutalist block saying: "NO RECENT ACTIVITY.""
// I will show the block.

const newRecentsVars = `  const trending = homeTracks.slice(6, 16);
  const displayRecents = recentTracks.length > 0 ? recentTracks.slice(0, 6) : homeTracks.slice(0, 6);`;

homeCode = homeCode.replace(/const recents = homeTracks\.slice\(0, 6\);\s*const trending = homeTracks\.slice\(6, 16\);/, newRecentsVars);

// The prompt also says: "Fix the CSS flexbox layout of those cards. Ensure the text container has flex-1 and min-w-0 applied so it takes up available space."
// "Use Tailwind classes like truncate text-sm or line-clamp-2 so the title displays fully up to the container's edge instead of just 3 characters."

// In HomeView.tsx, let's find the card rendering part:
/*
            <div 
              key={track.videoId}
              onClick={() => onPlayTrack(track)}
              className="flex items-center gap-3 bg-brand-surface/40 hover:bg-brand-surface border-[1.5px] border-brand-fg/20 hover:border-brand-fg transition-colors cursor-pointer pr-3 overflow-hidden group"
            >
              <div className="w-14 h-14 bg-white border-r-[1.5px] border-brand-fg/20 group-hover:border-brand-fg flex-shrink-0">
                <img 
                  src={track.thumbnailUrl || undefined} 
                  alt={track.title} 
                  className="w-full h-full object-cover filter grayscale"
                />
              </div>
              <div className="min-w-0 flex-1 py-1">
                <p className="font-serif text-[13px] font-bold leading-tight truncate">
                  {track.title}
                </p>
              </div>
              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"> 
                 <button className="w-8 h-8 rounded-full bg-brand-fg text-brand-bg flex items-center justify-center hover:scale-105 transition-transform shadow-[2px_2px_0_0_#0D0D0D]">
                    <Play className="w-4 h-4 ml-0.5 fill-current" />
                 </button>
              </div>
            </div>
*/

// It already has flex-1 and min-w-0 on the text container! And truncate on the paragraph!
// Wait, the issue says "the track titles are aggressively truncated to just 3 letters (e.g., "Tre..."). ... Fix the CSS flexbox layout of those cards. Ensure the text container has flex-1 and min-w-0 applied so it takes up available space. Use Tailwind classes like truncate text-sm or line-clamp-2 so the title displays fully up to the container's edge instead of just 3 characters."
// Let's replace `recents` with `displayRecents` first.

homeCode = homeCode.replace(/\{recents\.map/g, '{displayRecents.map');

// Let's check the container layout to see why it truncates.
// The container has `pr-3 overflow-hidden group`. Wait, `overflow-hidden` on the flex container might cause issues?
// No, flex containers handle `min-w-0 flex-1` fine, but let's change `truncate` to `line-clamp-2 text-sm` as requested.

homeCode = homeCode.replace(/<p className="font-serif text-\[13px\] font-bold leading-tight truncate">/g, '<p className="font-serif text-sm font-bold leading-tight line-clamp-2">');

// If recentTracks is empty, we show a block if requested, but falling back to 6 trending tracks is also allowed: "either fallback to 6 trending tracks OR show a sleek brutalist block saying: 'NO RECENT ACTIVITY.'" 
// We are already falling back to 6 trending tracks via `const displayRecents = recentTracks.length > 0 ? recentTracks.slice(0, 6) : homeTracks.slice(0, 6);`. Let's actually show the block instead, to explicitly follow the "NO RECENT ACTIVITY" option which is cooler.

const newRecentsVarsBlock = `  const trending = homeTracks.slice(0, 10);
  const displayRecents = recentTracks.slice(0, 6);`;
homeCode = homeCode.replace(newRecentsVars, newRecentsVarsBlock);

const newSection1 = `      {/* Section 1: Recents (2 Column Grid, Horizontal Rectangles) */}
      <section>
        {displayRecents.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {displayRecents.map((track) => (
              <div 
                key={track.videoId}
                onClick={() => onPlayTrack(track)}
                className="flex items-center gap-3 bg-brand-surface/40 hover:bg-brand-surface border-[1.5px] border-brand-fg/20 hover:border-brand-fg transition-colors cursor-pointer pr-3 overflow-hidden group"
              >
                <div className="w-14 h-14 bg-white border-r-[1.5px] border-brand-fg/20 group-hover:border-brand-fg flex-shrink-0">
                  <img 
                    src={track.thumbnailUrl || undefined} 
                    alt={track.title} 
                    className="w-full h-full object-cover filter grayscale"
                  />
                </div>
                <div className="min-w-0 flex-1 py-1">
                  <p className="font-serif text-sm font-bold leading-tight line-clamp-2">
                    {track.title}
                  </p>
                </div>
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"> 
                   <button className="w-8 h-8 rounded-full bg-brand-fg text-brand-bg flex items-center justify-center hover:scale-105 transition-transform shadow-[2px_2px_0_0_#0D0D0D]">
                      <Play className="w-4 h-4 ml-0.5 fill-current" />
                   </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full border-[1.5px] border-brand-fg bg-brand-surface/20 p-8 flex flex-col justify-center shadow-[4px_4px_0_0_#0D0D0D]">
            <h3 className="font-mono text-sm font-bold tracking-widest text-brand-muted uppercase mb-1">ACTIVITY_LOG</h3>
            <p className="font-serif text-xl font-bold">NO RECENT ACTIVITY.</p>
          </div>
        )}
      </section>`;

homeCode = homeCode.replace(/\{\/\* Section 1: Recents \(2 Column Grid, Horizontal Rectangles\) \*\/\}[\s\S]*?<\/section>/, newSection1);

fs.writeFileSync('src/components/HomeView.tsx', homeCode);
