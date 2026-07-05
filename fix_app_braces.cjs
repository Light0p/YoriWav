const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/\{currentTab === "library" && \(\n\s*\{activePlaylist \?\ \(/, '{currentTab === "library" && (\n            <>\n              {activePlaylist ? (');

code = code.replace(/onSelectPlaylist=\{\(p\) => setActivePlaylist\(p\)\}\n[\s\S]*?\/>\n\s*\)\}/, 'onSelectPlaylist={(p) => setActivePlaylist(p)}\n                onCreatePlaylist={() => {\n                  const name = prompt("Enter playlist name:");\n                  if (name) {\n                    const newP = { id: Date.now().toString(), name, customAvatar: null, tracks: [] };\n                    savePlaylists([...playlists, newP]);\n                  }\n                }}\n              />\n            )}\n            </>\n          )}');

fs.writeFileSync('src/App.tsx', code);
