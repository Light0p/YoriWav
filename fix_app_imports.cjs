const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/import { LibraryView, FavoritesView, MixerView, TagsView } from "\.\/components\/OtherViews";/, 'import { LibraryView, SearchView, MixerView } from "./components/OtherViews";');

// Also in the rendering logic:
// Replace {currentTab === "tags" && <TagsView />} with {currentTab === "tags" && <SearchView ... />}
code = code.replace(/\{currentTab === "tags" && <TagsView \/>\}/, '{currentTab === "tags" && <SearchView onPlayTrack={handlePlayTrack} favorites={favorites} onToggleFavorite={handleToggleFavorite} />}');

// Also remove the rendering logic for FavoritesView if it exists
code = code.replace(/\{currentTab === "favorites" && \([\s\S]*?favorites={favorites}\n\s*\/>\n\s*\)\}/, '');

fs.writeFileSync('src/App.tsx', code);
