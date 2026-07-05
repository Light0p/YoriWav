const fs = require('fs');
let code = fs.readFileSync('src/components/HomeView.tsx', 'utf8');

const regex = /<section className="mb-12 mt-4 md:mt-0">[\s\S]*?<div className="w-full md:w-1\/2 max-w-\[400px\] border-\[1.5px\] border-brand-fg bg-white p-2 jewel-case shadow-\[6px_6px_0_0_#0D0D0D\]">\s*<img \s*src=\{featuredTrack\.thumbnailUrl\}\s*alt="Featured Turntable Art"\s*className="w-full aspect-square object-cover filter grayscale contrast-125"\s*\/>/;

const newCode = `
      <section className="mb-12 mt-4 md:mt-0">
        <div className="border-[1.5px] border-brand-fg bg-[#F1ECE3] p-4 md:p-8 flex flex-col md:flex-row gap-8 items-center relative">
          <div className="absolute top-4 right-4 w-2 h-2 bg-brand-fg"></div>
          <div className="absolute top-4 right-8 w-2 h-2 bg-brand-fg"></div>
          
          <div className="w-full md:w-1/2 max-w-[400px] border-[1.5px] border-brand-fg bg-white p-2 jewel-case shadow-[6px_6px_0_0_#0D0D0D]">
            <img 
              src={homeTracks.length > 0 ? homeTracks[0].thumbnailUrl : ""} 
              alt="Featured Turntable Art" 
              className="w-full aspect-square object-cover filter grayscale contrast-125"
            />
`;

code = code.replace(regex, newCode);
fs.writeFileSync('src/components/HomeView.tsx', code);
