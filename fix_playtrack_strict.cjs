const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regexPlay = /const handlePlayTrack = async \(track: TrackModel, contextQueue\?: TrackModel\[\]\) => \{([\s\S]*?)catch\(e => console\.error\("Suggestions error", e\)\);/m;
const replacePlay = `const handlePlayTrack = async (track: TrackModel, contextQueue?: TrackModel[], isStrictPlaylist?: boolean) => {
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    let playableTrack = track;
    if (!track.audioUrl) {
      try {
        const streamUrl = await musicProvider.getStreamUrl(track as any);
        playableTrack = { ...track, audioUrl: streamUrl, durationSeconds: track.durationSeconds || 0 };
      } catch (err: any) {
        console.error("Failed to resolve stream URL", err);
        alert("Could not resolve stream URL. " + err.message);
        return;
      }
    }

    let nextQueue = contextQueue && contextQueue.length > 0 ? contextQueue : [playableTrack];
    let nextIdx = nextQueue.findIndex(t => t.videoId === track.videoId);
    if (nextIdx === -1) nextIdx = 0;
    
    setQueue(nextQueue);
    setCurrentTrackIndex(nextIdx);

    if (!isStrictPlaylist) {
      // Fetch suggestions async and append
      musicProvider.getSuggestions(track.videoId).then((suggestions) => {
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
    }`;

code = code.replace(regexPlay, replacePlay);
fs.writeFileSync('src/App.tsx', code);
