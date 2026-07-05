const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/const handlePlayPause = \(\) => \{/, 'const handlePlayPause = () => {\n    if (audioContextRef.current && audioContextRef.current.state === "suspended") {\n      audioContextRef.current.resume();\n    }');

fs.writeFileSync('src/App.tsx', code);
