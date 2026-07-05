const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add abortControllerRef
const abortRef = `  const audioCtxRef = useRef<AudioContext | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);`;
code = code.replace(/  const audioCtxRef = useRef<AudioContext \| null>\(null\);/, abortRef);

// 2. Add the useEffect
const useEffectStr = `
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
  }, [currentTrack?.videoId]);
`;

// Insert the useEffect before handlePlayTrack
code = code.replace(/  \/\/ Local play triggers/, useEffectStr + '\n  // Local play triggers');


// 3. Rewrite handlePlayTrack to remove the inline fetching and immediate playing
const handlePlayTrackRegex = /const handlePlayTrack = async \(track: TrackModel, contextQueue\?: TrackModel\[\], isStrictPlaylist\?: boolean\) => \{[\s\S]*?if \(audioRef\.current\) \{\s*audioRef\.current\.src = playableTrack\.audioUrl;\s*audioRef\.current\.play\(\)\.catch\(\(\) => \{\}\);\s*\}\s*\};/m;

const newHandlePlayTrack = `const handlePlayTrack = async (track: TrackModel, contextQueue?: TrackModel[], isStrictPlaylist?: boolean) => {
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
  };`;

code = code.replace(handlePlayTrackRegex, newHandlePlayTrack);

fs.writeFileSync('src/App.tsx', code);
