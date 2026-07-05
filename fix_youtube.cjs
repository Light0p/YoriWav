const fs = require('fs');
let code = fs.readFileSync('src/lib/providers/youtubeProvider.ts', 'utf8');

code = code.replace(/async getSuggestions\(songId: string\): Promise<Song\[\]> \{[\s\S]*?\}/, 'async getSuggestions(songId: string): Promise<Song[]> {\n    return [];\n  }');

fs.writeFileSync('src/lib/providers/youtubeProvider.ts', code);
