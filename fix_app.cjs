const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Increase pb-32 to pb-[140px] in App.tsx
code = code.replace('pb-32', 'pb-[140px]');

// Pass favorites to HomeView
code = code.replace('<HomeView \n              user={currentUser}', '<HomeView \n              user={currentUser}\n              favorites={favorites}\n              onToggleFavorite={handleToggleFavorite}');

code = code.replace('<BottomPlayer \n          currentTrack={currentTrack}', '<BottomPlayer \n          currentTrack={currentTrack}\n          favorites={favorites}\n          onToggleFavorite={handleToggleFavorite}');

fs.writeFileSync('src/App.tsx', code);
