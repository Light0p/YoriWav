const fs = require('fs');
let code = fs.readFileSync('src/components/HomeView.tsx', 'utf8');

// Ensure props have favorites and onToggleFavorite
code = code.replace(/interface HomeViewProps \{/, 'interface HomeViewProps {\n  favorites?: string[];\n  onToggleFavorite?: (id: string) => void;');
code = code.replace(/activeRooms: any\[\];\n\}/, 'activeRooms: any[];\n  favorites?: string[];\n  onToggleFavorite?: (id: string) => void;\n}');
code = code.replace(/activeRooms\n\}: HomeViewProps\) \{/, 'activeRooms,\n  favorites = [],\n  onToggleFavorite = () => {}\n}: HomeViewProps) {');

fs.writeFileSync('src/components/HomeView.tsx', code);
