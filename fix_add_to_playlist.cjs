const fs = require('fs');
let code = fs.readFileSync('src/components/NowPlayingView.tsx', 'utf8');

const regexBtn = /<Heart className=\{`w-6 h-6 \$\{favorites\.some\(f => f\.videoId === currentTrack\.videoId\) \? 'fill-current' : ''\}`\} \/>\s*<\/button>\s*\)}/m;

const replacement = `<Heart className={\`w-6 h-6 \${favorites.some(f => f.videoId === currentTrack.videoId) ? 'fill-current' : ''}\`} />
                   </button>
                 )}
                 <button
                   onClick={() => window.dispatchEvent(new CustomEvent('open_playlist_modal', { detail: currentTrack }))}
                   className="text-brand-fg hover:scale-110 transition-transform active:scale-95 shrink-0"
                 >
                   <Plus className="w-6 h-6" />
                 </button>`;

code = code.replace(regexBtn, replacement);
fs.writeFileSync('src/components/NowPlayingView.tsx', code);
