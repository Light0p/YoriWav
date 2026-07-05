const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const initialSrcEffect = `  useEffect(() => {
    if (audioRef.current && TRACKS[0]) {
      audioRef.current.src = TRACKS[0].audioUrl;
    }
  }, []);`;

code = code.replace(/const handleTimeUpdate = \(\) => \{/, initialSrcEffect + '\n\n  const handleTimeUpdate = () => {');

fs.writeFileSync('src/App.tsx', code);
