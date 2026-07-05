const fs = require('fs');
let code = fs.readFileSync('src/components/HomeView.tsx', 'utf8');

// Update prop type
code = code.replace(/onPlayTrack: \(track: TrackModel\) => void;/g, 'onPlayTrack: (track: TrackModel, contextQueue?: TrackModel[]) => void;');

// Update usages
code = code.replace(/onClick=\{\(\) => onPlayTrack\(track\)\}/g, (match, offset) => {
    // If it's in the recents section, use displayRecents
    // If it's in the trending section, use trending
    return 'onClick={() => onPlayTrack(track, displayRecents.includes(track) ? displayRecents : trending)}';
});

fs.writeFileSync('src/components/HomeView.tsx', code);
