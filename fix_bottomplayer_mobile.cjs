const fs = require('fs');
let code = fs.readFileSync('src/components/BottomPlayer.tsx', 'utf8');

const oldMobileControls = /<div className="flex items-center gap-2 shrink-0">[\s\S]*?<button \n            aria-label="Next" [\s\S]*?<\/button>\n        <\/div>/;

const newMobileControls = `<div className="flex items-center gap-4 shrink-0 pl-2">
          {favorites && onToggleFavorite && (
            <button 
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(currentTrack); }}
              className="w-8 h-8 flex items-center justify-center text-brand-fg transition-transform active:scale-90"
            >
              <Heart className={\`w-4 h-4 \${favorites.some(f => f.videoId === currentTrack.videoId) ? 'fill-current' : ''}\`} />
            </button>
          )}
          <button 
            aria-label="Previous" 
            onClick={(e) => { e.stopPropagation(); onSkipPrevious(); }}
            className="w-8 h-8 flex items-center justify-center text-brand-fg"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button 
            aria-label={isPlaying ? "Pause" : "Play"} 
            onClick={(e) => { e.stopPropagation(); onPlayPause(); }}
            className="w-8 h-8 border-[1.5px] border-brand-fg flex items-center justify-center bg-brand-surface hover:bg-brand-fg hover:text-brand-bg transition-colors shadow-[2px_2px_0_0_#0D0D0D] active:translate-y-0.5 active:shadow-none"
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            )}
          </button>
          <button 
            aria-label="Next" 
            onClick={(e) => { e.stopPropagation(); onSkipNext(); }}
            className="w-8 h-8 flex items-center justify-center text-brand-fg"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>`;

code = code.replace(oldMobileControls, newMobileControls);

fs.writeFileSync('src/components/BottomPlayer.tsx', code);
