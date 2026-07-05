const fs = require('fs');

let code = fs.readFileSync('src/components/BottomNav.tsx', 'utf8');

code = code.replace('import { Home, Search, Users, Music } from "lucide-react";', 'import { Home, Search, Users, Music, Sliders } from "lucide-react";');

const mixerBtn = `      <button 
        onClick={() => setCurrentTab("mixer")}
        className={\`flex flex-col items-center justify-center w-full h-full space-y-1 \${currentTab === "mixer" ? "text-brand-fg" : "text-brand-muted"}\`}
      >
        <Sliders className="w-5 h-5" />
        <span className="text-[9px] font-mono font-bold uppercase tracking-wide">Mixer</span>
      </button>`;

code = code.replace(/<button \s*onClick=\{\(\) => setCurrentTab\("room"\)\}[\s\S]*?<\/button>/, match => mixerBtn + '\n' + match);

fs.writeFileSync('src/components/BottomNav.tsx', code);
