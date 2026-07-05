const fs = require('fs');

// HomeView.tsx
let homeCode = fs.readFileSync('src/components/HomeView.tsx', 'utf8');
homeCode = homeCode.replace(/favorites\?: string\[\];/, 'favorites?: TrackModel[];');
homeCode = homeCode.replace(/onToggleFavorite\?: \(id: string\) => void;/, 'onToggleFavorite?: (track: TrackModel) => void;');
// Replace `favorites.includes(track.videoId)` with `favorites.some(f => f.videoId === track.videoId)`
homeCode = homeCode.replace(/favorites\.includes\(([^)]+)\)/g, 'favorites.some(f => f.videoId === $1)');
// Replace `onToggleFavorite(track.videoId)` with `onToggleFavorite(track)`
homeCode = homeCode.replace(/onToggleFavorite\(([^)]+)\.videoId\)/g, 'onToggleFavorite($1)');
fs.writeFileSync('src/components/HomeView.tsx', homeCode);

// OtherViews.tsx
let otherCode = fs.readFileSync('src/components/OtherViews.tsx', 'utf8');
otherCode = otherCode.replace(/favorites: string\[\];/, 'favorites: TrackModel[];');
otherCode = otherCode.replace(/onToggleFavorite: \(id: string\) => void;/, 'onToggleFavorite: (track: TrackModel) => void;');
// Replace `favorites.includes(song.videoId)` with `favorites.some(f => f.videoId === song.videoId)`
otherCode = otherCode.replace(/favorites\.includes\(([^)]+)\)/g, 'favorites.some(f => f.videoId === $1)');
// In SearchView, onToggleFavorite(song.videoId) needs to be onToggleFavorite(song)
// Wait, in SearchView, song is not a TrackModel, it's mapped from results. It's close but missing audioUrl. 
// Actually we can map it to a TrackModel when calling onToggleFavorite.
otherCode = otherCode.replace(/onToggleFavorite\(song\.videoId\)/g, `onToggleFavorite({ videoId: song.videoId, title: song.title, artist: song.artist, thumbnailUrl: song.thumbnailUrl, durationSeconds: 0, audioUrl: "" })`);
fs.writeFileSync('src/components/OtherViews.tsx', otherCode);

// BottomPlayer.tsx
let bottomCode = fs.readFileSync('src/components/BottomPlayer.tsx', 'utf8');
bottomCode = bottomCode.replace(/favorites\?: string\[\];/, 'favorites?: import("../types").TrackModel[];');
bottomCode = bottomCode.replace(/onToggleFavorite\?: \(id: string\) => void;/, 'onToggleFavorite?: (track: import("../types").TrackModel) => void;');
bottomCode = bottomCode.replace(/favorites\.includes\(([^)]+)\)/g, 'favorites.some(f => f.videoId === $1)');
// Update onToggleFavorite call
bottomCode = bottomCode.replace(/onToggleFavorite\(([^)]+)\.videoId\)/g, 'onToggleFavorite($1)');
fs.writeFileSync('src/components/BottomPlayer.tsx', bottomCode);

