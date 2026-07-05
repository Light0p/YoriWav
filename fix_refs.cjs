const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/audioContextRef/g, 'audioCtxRef');

// Let's also remove the \`src={currentTrack?.audioUrl || ""}\` from the <audio> tag, to avoid conflicts with imperative assignments.
code = code.replace(/src=\{currentTrack\?\.audioUrl \|\| ""\}/, '');

fs.writeFileSync('src/App.tsx', code);
