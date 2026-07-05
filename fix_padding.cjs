const fs = require('fs');
let home = fs.readFileSync('src/components/HomeView.tsx', 'utf8');
home = home.replace(/<div className="w-full flex flex-col gap-8">/, '<div className="w-full flex flex-col gap-8 pb-[120px]">');
fs.writeFileSync('src/components/HomeView.tsx', home);

let other = fs.readFileSync('src/components/OtherViews.tsx', 'utf8');
other = other.replace(/export function LibraryView\([\s\S]*?return \(\s*<div className="w-full">/, (match) => {
  return match.replace('<div className="w-full">', '<div className="w-full pb-[120px]">');
});
other = other.replace(/export function SearchView\([\s\S]*?return \(\s*<div className="w-full h-full flex flex-col">/, (match) => {
  return match.replace('<div className="w-full h-full flex flex-col">', '<div className="w-full h-full flex flex-col pb-[120px]">');
});
other = other.replace(/export function RoomsListView\([\s\S]*?return \(\s*<div className="w-full">/, (match) => {
  return match.replace('<div className="w-full">', '<div className="w-full pb-[120px]">');
});

fs.writeFileSync('src/components/OtherViews.tsx', other);
