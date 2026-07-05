const fs = require('fs');
let code = fs.readFileSync('src/components/RoomView.tsx', 'utf8');

// Replace the main wrapper div
const startWrapper = `<div className="flex flex-col lg:flex-row gap-8 h-full max-h-[85vh]">`;
const newWrapper = `<div className="flex flex-col lg:flex-row gap-4 lg:gap-8 h-full lg:max-h-[85vh]">
      {/* 
        Responsive Order: 
        Mobile: Avatars (order-1) -> Active Track (order-2) -> Chat (order-3)
        Desktop: Left Side Player (w-1/3) -> Right Side Avatars & Chat (w-2/3)
      */}`;

code = code.replace(startWrapper, newWrapper);

// Find Left Column: Metadata & Player
const leftColStart = `<div className="flex-1 flex flex-col gap-4 min-w-0">`;
const newLeftColStart = `<div className="w-full lg:w-1/3 flex flex-col gap-4 min-w-0 order-2 lg:order-1">`;
code = code.replace(leftColStart, newLeftColStart);

// We need to move the Member Presence List to the Right Column for desktop, 
// but on mobile it needs to be order-1. Let's just group Member List and Chat into a right column flex container.

// First, extract Member Presence List
const memberListRegex = /\{\/\* Member Presence List \*\/\}\s*<div className="border-\[1\.5px\] border-brand-fg bg-brand-surface p-4 flex-1 overflow-y-auto max-h-\[220px\] lg:max-h-none">[\s\S]*?<\/div>\s*<\/div>\s*\{\/\* Right Column: Shared Room Chat Terminal \*\/\}/;

const match = code.match(memberListRegex);
if (match) {
  const memberListHtml = match[0].replace(`</div>\n      {/* Right Column: Shared Room Chat Terminal */}`, "");
  
  // Remove member list from left column
  code = code.replace(match[0], `</div>\n      {/* Right Column Container */}\n      <div className="w-full lg:w-2/3 flex flex-col md:flex-row gap-4 lg:gap-8 order-1 lg:order-2 h-full">\n        {/* Avatars (order-1 on mobile) */}\n        <div className="w-full md:w-1/3 lg:w-1/3 order-1 h-[220px] md:h-full">\n          ${memberListHtml}\n        </div>\n\n        {/* Right Column: Shared Room Chat Terminal */}\n        <div className="w-full md:w-2/3 lg:w-2/3 order-3 md:order-2">`);
}

// Ensure the Right Column Chat Terminal div is closed correctly
const chatTerminalStart = `<div className="flex-1 border-[1.5px] border-brand-fg bg-white flex flex-col justify-between h-full shadow-[4px_4px_0_0_#0D0D0D]">`;
const newChatTerminalStart = `<div className="flex-1 border-[1.5px] border-brand-fg bg-white flex flex-col justify-between h-full shadow-[4px_4px_0_0_#0D0D0D]">`;
code = code.replace(chatTerminalStart, newChatTerminalStart);

// Close the Right Column Container at the end of the file
const fileEnd = `    </div>\n  );\n}`;
const newFileEnd = `        </div>\n      </div>\n    </div>\n  );\n}`;
code = code.replace(fileEnd, newFileEnd);

// Fix Member list height classes
code = code.replace(/<div className="border-\[1\.5px\] border-brand-fg bg-brand-surface p-4 flex-1 overflow-y-auto max-h-\[220px\] lg:max-h-none">/, `<div className="border-[1.5px] border-brand-fg bg-brand-surface p-4 h-full overflow-y-auto">`);


fs.writeFileSync('src/components/RoomView.tsx', code);
