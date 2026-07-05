const fs = require('fs');

// Update App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace(/const \[favorites, setFavorites\] = useState<string\[\]>\(\[\]\);/, 'const [favorites, setFavorites] = useState<TrackModel[]>([]);');
appCode = appCode.replace(/const handleToggleFavorite = \(id: string\) => \{[\s\S]*?\};/, `const handleToggleFavorite = (track: TrackModel) => {
    if (favorites.some(f => f.videoId === track.videoId)) {
      setFavorites(prev => prev.filter(item => item.videoId !== track.videoId));
    } else {
      setFavorites(prev => [...prev, track]);
    }
  };`);
appCode = appCode.replace(/onToggleFavorite=\{\(\) => handleToggleFavorite\(currentTrack\.videoId\)\}/, 'onToggleFavorite={() => handleToggleFavorite(currentTrack)}');
// Actually BottomPlayer is in src/components/BottomPlayer.tsx probably, but let's check.
fs.writeFileSync('src/App.tsx', appCode);
