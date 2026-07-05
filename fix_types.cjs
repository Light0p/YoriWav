const fs = require('fs');

// types.ts
let types = fs.readFileSync('src/lib/providers/types.ts', 'utf8');
types = types.replace(
  'getStreamUrl(song: Song): Promise<string>;',
  'getStreamUrl(song: Song): Promise<string | null>;'
);
fs.writeFileSync('src/lib/providers/types.ts', types);

// youtubeProvider.ts
let ytp = fs.readFileSync('src/lib/providers/youtubeProvider.ts', 'utf8');
ytp = ytp.replace(
  'getStreamUrl(song: Song): Promise<string>',
  'getStreamUrl(song: Song): Promise<string | null>'
).replace(
  'throw new Error("No valid stream URL found");',
  'return null;'
);
fs.writeFileSync('src/lib/providers/youtubeProvider.ts', ytp);
