const fs = require('fs');
let appCode = fs.readFileSync('src/App.tsx', 'utf8');

// Add queue states
const audioStateRegex = /const \[currentTrack, setCurrentTrack\] = useState<TrackModel \| null>\(TRACKS\[0\]\);/;
const queueState = `const [currentTrack, setCurrentTrack] = useState<TrackModel | null>(null);
  const [queue, setQueue] = useState<TrackModel[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);`;
appCode = appCode.replace(audioStateRegex, queueState);

// Replace handlePlayTrack
const oldHandlePlayTrack = /const handlePlayTrack = async \(track: TrackModel\) => \{([\s\S]*?)setCurrentTrack\(playableTrack\);/m;
const newHandlePlayTrack = `const handlePlayTrack = async (track: TrackModel, contextQueue?: TrackModel[]) => {
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

    if (contextQueue && contextQueue.length > 0) {
      setQueue(contextQueue);
      const idx = contextQueue.findIndex(t => t.videoId === track.videoId);
      setCurrentTrackIndex(idx !== -1 ? idx : 0);
    } else if (queue.length === 0 || !queue.find(t => t.videoId === track.videoId)) {
      setQueue([playableTrack]);
      setCurrentTrackIndex(0);
    } else {
      // Just playing a track that's already in the queue, or a random track without context
      const idx = queue.findIndex(t => t.videoId === track.videoId);
      if (idx !== -1) setCurrentTrackIndex(idx);
    }

    setCurrentTrack(playableTrack);`;
appCode = appCode.replace(oldHandlePlayTrack, newHandlePlayTrack);

// Replace handleSkipNext and Previous
const oldSkip = /const handleSkipNext = \(\) => \{([\s\S]*?)\};[\s\S]*?const handleSkipPrevious = \(\) => \{([\s\S]*?)\};/;
const newSkip = `const handleSkipNext = () => {
    if (queue.length === 0) return;
    const nextIdx = (currentTrackIndex + 1) % queue.length;
    handlePlayTrack(queue[nextIdx], queue);
  };

  const handleSkipPrevious = () => {
    if (queue.length === 0) return;
    const prevIdx = (currentTrackIndex - 1 + queue.length) % queue.length;
    handlePlayTrack(queue[prevIdx], queue);
  };`;
appCode = appCode.replace(oldSkip, newSkip);

fs.writeFileSync('src/App.tsx', appCode);
