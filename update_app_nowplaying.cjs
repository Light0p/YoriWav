const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldNowPlaying = `<NowPlayingView 
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              onPlayTrack={handlePlayTrack}
              currentTime={currentTime}
            />`;

const newNowPlaying = `<NowPlayingView 
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              onPlayTrack={handlePlayTrack}
              currentTime={currentTime}
              queue={queue}
              currentTrackIndex={currentTrackIndex}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onSkipNext={handleSkipNext}
              onSkipPrevious={handleSkipPrevious}
            />`;

code = code.replace(oldNowPlaying, newNowPlaying);
fs.writeFileSync('src/App.tsx', code);
