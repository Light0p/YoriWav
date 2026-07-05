const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

// Remove favorites tab
code = code.replace(/\{\s*id: "favorites",\s*label: "Favorites",\s*icon: <Heart[\s\S]*?\},\s*/, '');

fs.writeFileSync('src/components/Sidebar.tsx', code);
