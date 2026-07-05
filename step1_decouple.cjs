const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Remove handleTimeUpdate's firestore sync
code = code.replace(/if \(activeRoomId && isHost && Math\.floor\(audioRef\.current\.currentTime\) % 2 === 0\) \{[\s\S]*?\}\n\s*\};/, '};');

// Check the onSnapshot inside activeRoomId effect
// The prompt says "STOP syncing the audio currentTime, progress, or isPlaying state to Firestore/Lovable Cloud... All real-time playback state must be STRICTLY LOCAL"
// Let's remove the whole activeRoomId block's track playing logic, or just the part that syncs back? Wait, the problem is infinite re-renders because roomState updates constantly. We can just leave it as is if we removed the timeUpdate write, which was the source of infinite loop (client writes time, snapshot fires, state updates, rerender, etc).
// Actually, let's also remove `updateDoc` from `handlePlayPause` and `handleSeek` just in case!

const playPauseRegex = /const handlePlayPause = \(\) => \{[\s\S]*?if \(activeRoomId && isHost\) \{[\s\S]*?updateDoc\([\s\S]*?\);[\s\S]*?\}[\s\S]*?\};/;
code = code.replace(playPauseRegex, (match) => {
    return match.replace(/if \(activeRoomId && isHost\) \{[\s\S]*?updateDoc[\s\S]*?\);[\s\S]*?\}/, '');
});

const handleSeekRegex = /const handleSeek = \(seconds: number\) => \{[\s\S]*?if \(activeRoomId && isHost\) \{[\s\S]*?updateDoc\([\s\S]*?\);[\s\S]*?\}[\s\S]*?\};/;
code = code.replace(handleSeekRegex, (match) => {
    return match.replace(/if \(activeRoomId && isHost\) \{[\s\S]*?updateDoc[\s\S]*?\);[\s\S]*?\}/, '');
});

fs.writeFileSync('src/App.tsx', code);
