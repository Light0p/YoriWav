const fs = require('fs');
let code = fs.readFileSync('src/components/NowPlayingView.tsx', 'utf8');

const oldImports = /import \{\s*Play,\s*Pause,\s*Disc,\s*Tv,\s*Terminal,\s*ListMusic,\s*Plus,\s*ChevronRight,\s*Database\s*\} from "lucide-react";/;
const newImports = `import { 
  Play, 
  Pause, 
  Disc, 
  Tv, 
  Terminal, 
  ListMusic, 
  Plus, 
  ChevronRight, 
  Database,
  Heart,
  Shuffle,
  Repeat,
  SkipBack,
  SkipForward
} from "lucide-react";`;

code = code.replace(oldImports, newImports);

fs.writeFileSync('src/components/NowPlayingView.tsx', code);
