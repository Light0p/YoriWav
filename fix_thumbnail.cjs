const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'const thumbnailUrl = thumbnails ? (thumbnails.sort((a, b) => b.width - a.width)[0]?.url) : "";',
  'const thumbnailUrl = song.thumbnails ? song.thumbnails.sort((a, b) => b.width - a.width)[0].url : "";'
);

fs.writeFileSync('server.ts', code);
