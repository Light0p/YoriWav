const fs = require('fs');
let code = fs.readFileSync('src/components/HomeView.tsx', 'utf8');

code = code.replace(/onCreateRoom\(homeTracks\[1\] as any\)/g, 'homeTracks[1] && onCreateRoom(homeTracks[1] as any)');

fs.writeFileSync('src/components/HomeView.tsx', code);
