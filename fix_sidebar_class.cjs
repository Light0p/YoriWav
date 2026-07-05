const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

code = code.replace(/interface SidebarProps \{/, 'interface SidebarProps {\n  className?: string;');
code = code.replace(/onSignOut\n\}: SidebarProps\) \{/, 'onSignOut,\n  className\n}: SidebarProps) {');
code = code.replace(/<nav className="hidden md:flex flex-col h-full w-64 border-r-\[1.5px\] border-brand-fg bg-brand-surface flex-shrink-0 justify-between z-30 pt-8 pb-4">/, '<nav className={className || "hidden md:flex flex-col h-full w-64 border-r-[1.5px] border-brand-fg bg-brand-surface flex-shrink-0 justify-between z-30 pt-8 pb-4"}>');

fs.writeFileSync('src/components/Sidebar.tsx', code);
