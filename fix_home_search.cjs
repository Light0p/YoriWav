const fs = require('fs');
let code = fs.readFileSync('src/components/HomeView.tsx', 'utf8');

code = code.replace(/const displayTracks = searchQuery \? searchResults : TRACKS;/g, 'const displayTracks = searchQuery ? searchResults : homeTracks;');

// Ensure TRACKS import can be removed safely to remove all dummy data dependencies
code = code.replace(/import \{ TRACKS \} from "\.\.\/tracks";\n/g, '');

fs.writeFileSync('src/components/HomeView.tsx', code);
