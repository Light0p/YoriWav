const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileView.tsx', 'utf8');

code = code.replace(/onPlayTrack: \(track: TrackModel\) => void;/g, 'onPlayTrack: (track: TrackModel, contextQueue?: TrackModel[]) => void;');
code = code.replace(/onClick=\{\(\) => onPlayTrack\(track\)\}/g, 'onClick={() => onPlayTrack(track, vaultTracks)}');

fs.writeFileSync('src/components/ProfileView.tsx', code);
