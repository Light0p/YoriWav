const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /const \[currentTrackIndex, setCurrentTrackIndex\] = useState<number>\(-1\);/,
  `const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);
  const [isStrictQueue, setIsStrictQueue] = useState<boolean>(false);`
);

code = code.replace(
  /setQueue\(nextQueue\);\n\s*setCurrentTrackIndex\(nextIdx\);/,
  `setQueue(nextQueue);
    setCurrentTrackIndex(nextIdx);
    setIsStrictQueue(!!isStrictPlaylist);`
);

code = code.replace(
  /handlePlayTrack\(queue\[nextIdx\], queue\);/,
  `handlePlayTrack(queue[nextIdx], queue, isStrictQueue);`
);

code = code.replace(
  /handlePlayTrack\(queue\[prevIdx\], queue\);/,
  `handlePlayTrack(queue[prevIdx], queue, isStrictQueue);`
);

fs.writeFileSync('src/App.tsx', code);
