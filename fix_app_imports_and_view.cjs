const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regexImport = /import \{ LibraryView, SearchView, MixerView, RoomsListView \} from "\.\/components\/OtherViews";/;
const newImport = `import { LibraryView, SearchView, MixerView, RoomsListView } from "./components/OtherViews";\nimport PlaylistView from "./components/PlaylistView";`;
code = code.replace(regexImport, newImport);

const libraryViewRender = /<LibraryView\s*onPlayTrack=\{handlePlayTrack\}\s*favorites=\{favorites\}\s*onToggleFavorite=\{handleToggleFavorite\}\s*\/>/m;
const newLibraryRender = `{activePlaylist ? (
              <PlaylistView 
                playlist={activePlaylist}
                onBack={() => setActivePlaylist(null)}
                onPlayTrack={handlePlayTrack}
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                onPlayPause={handlePlayPause}
              />
            ) : (
              <LibraryView 
                onPlayTrack={handlePlayTrack} 
                favorites={favorites} 
                onToggleFavorite={handleToggleFavorite}
                playlists={playlists}
                onSelectPlaylist={(p) => setActivePlaylist(p)}
                onCreatePlaylist={() => {
                  const name = prompt("Enter playlist name:");
                  if (name) {
                    const newP = { id: Date.now().toString(), name, customAvatar: null, tracks: [] };
                    savePlaylists([...playlists, newP]);
                  }
                }}
              />
            )}`;

code = code.replace(libraryViewRender, newLibraryRender);
fs.writeFileSync('src/App.tsx', code);
