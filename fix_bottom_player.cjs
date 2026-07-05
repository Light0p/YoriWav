const fs = require('fs');
let code = fs.readFileSync('src/components/BottomPlayer.tsx', 'utf8');

// Add Heart to lucide-react import
code = code.replace(/Minimize2\n} from "lucide-react";/, 'Minimize2,\n  Heart\n} from "lucide-react";');

// Add props to interface
code = code.replace('interface BottomPlayerProps {', 'interface BottomPlayerProps {\n  favorites?: string[];\n  onToggleFavorite?: (id: string) => void;');

// Add props to component
code = code.replace('onNavigateToPlayer\n}: BottomPlayerProps) {', 'onNavigateToPlayer,\n  favorites = [],\n  onToggleFavorite\n}: BottomPlayerProps) {');

// Add Heart button in track info section
const heartButton = `
        <button 
          onClick={() => onToggleFavorite && onToggleFavorite(currentTrack.videoId)}
          className="ml-2 text-brand-fg p-1 hover:bg-brand-surface/40 transition-all active:translate-y-px"
        >
          <Heart className="w-4 h-4" fill={favorites.includes(currentTrack.videoId) ? "currentColor" : "none"} />
        </button>
`;
code = code.replace('</p>\n        </div>\n      </div>', '</p>\n        </div>' + heartButton + '\n      </div>');

fs.writeFileSync('src/components/BottomPlayer.tsx', code);
