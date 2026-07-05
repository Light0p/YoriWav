const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const startIdx = code.indexOf('const handlePlayTrack = async (track: TrackModel');
const endString = 'if (audioRef.current) {';
let endIdx = code.indexOf(endString, startIdx);
if (endIdx !== -1) {
    // find the closing brace of the if block
    endIdx = code.indexOf('}', endIdx) + 1;
    // one more closing brace for the function
    endIdx = code.indexOf('};', endIdx) + 2;

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

    code = code.substring(0, startIdx) + newHandlePlayTrack + code.substring(endIdx);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Replaced handlePlayTrack successfully.");
} else {
    console.log("Could not find end of handlePlayTrack.");
}
