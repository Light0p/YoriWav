const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add import for BottomNav
if (!code.includes("import BottomNav")) {
  code = code.replace(/import { Disc, Menu, X, LogIn, Laptop } from "lucide-react";/, 'import { Disc, Menu, X, LogIn, Laptop } from "lucide-react";\nimport BottomNav from "./components/BottomNav";');
}

// Remove mobile header
code = code.replace(/\{\/\* Top Mobile Bar header \*\/\}[\s\S]*?\{\/\* Mobile menu navigation drawer \*\/\}[\s\S]*?\{\/\* Core dynamic views wrapper \*\/\}/, '{/* Core dynamic views wrapper */}');

// Add BottomNav
code = code.replace(/<BottomPlayer[\s\S]*?\/>/, (match) => {
  return `${match}\n        {/* Mobile Bottom Navigation */}\n        <BottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />`;
});

// Update main content wrapper to ensure no overflow
code = code.replace(/<div className="flex-1 overflow-y-auto px-4 md:px-12 py-8 pb-\[140px\]">/, '<div className="flex-1 overflow-y-auto overflow-x-hidden px-4 md:px-8 lg:px-12 py-4 md:py-8 pb-[140px]">');

fs.writeFileSync('src/App.tsx', code);
