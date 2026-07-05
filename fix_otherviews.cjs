const fs = require('fs');
let code = fs.readFileSync('src/components/OtherViews.tsx', 'utf8');

code = code.replace(/onPlayTrack: \(track: TrackModel\) => void;/g, 'onPlayTrack: (track: TrackModel, contextQueue?: TrackModel[]) => void;');
code = code.replace(/onClick=\{\(\) => onPlayTrack\(song\)\}/g, 'onClick={() => onPlayTrack(song, favorites)}');

// Fix SearchView results mapping
const searchPlayTrack = `const trackModel = {
                      videoId: song.videoId,
                      title: song.title,
                      artist: song.artist,
                      thumbnailUrl: song.thumbnailUrl,
                      durationSeconds: 0,
                      audioUrl: ""
                    };
                    const searchQueue = results.map(r => ({
                      videoId: r.videoId,
                      title: r.title,
                      artist: r.artist,
                      thumbnailUrl: r.thumbnailUrl,
                      durationSeconds: 0,
                      audioUrl: ""
                    }));
                    onPlayTrack(trackModel, searchQueue);`;

code = code.replace(/onPlayTrack\(\{[\s\S]*?audioUrl: ""\s*\}\)/g, searchPlayTrack);

fs.writeFileSync('src/components/OtherViews.tsx', code);
