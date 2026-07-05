const fs = require('fs');
let code = fs.readFileSync('src/components/OtherViews.tsx', 'utf8');

const regexLibraryProps = /export function LibraryView\(\{\s*onPlayTrack,\s*favorites,\s*onToggleFavorite\s*\}\: OtherViewsProps\) \{/m;
const newLibraryProps = `interface LibraryViewProps extends OtherViewsProps {
  playlists?: any[];
  onSelectPlaylist?: (playlist: any) => void;
  onCreatePlaylist?: () => void;
}

export function LibraryView({
  onPlayTrack,
  favorites,
  onToggleFavorite,
  playlists = [],
  onSelectPlaylist,
  onCreatePlaylist
}: LibraryViewProps) {`;

code = code.replace(regexLibraryProps, newLibraryProps);

const regexReturn = /return \(\s*<div className="w-full pb-\[120px\]">\s*<div className="flex justify-between items-end border-b-\[1\.5px\] border-brand-fg pb-2 mb-6">/m;
const newReturn = `return (
    <div className="w-full pb-[120px]">
      <div className="flex justify-between items-end border-b-[1.5px] border-brand-fg pb-2 mb-6">
        <h2 className="font-serif text-3xl font-bold leading-none">Your Playlists</h2>
        <button onClick={onCreatePlaylist} className="font-mono text-[10px] text-brand-bg bg-brand-fg px-2 py-1 uppercase hover:scale-105 transition-transform">
          + NEW PLAYLIST
        </button>
      </div>
      
      {playlists.length === 0 ? (
        <div className="w-full border-[1.5px] border-brand-fg p-8 flex flex-col items-center justify-center bg-brand-surface shadow-[4px_4px_0_0_#0D0D0D] mb-12">
          <h3 className="font-serif text-xl font-bold mb-2">NO PLAYLISTS</h3>
          <p className="font-mono text-xs uppercase text-brand-muted">CREATE ONE TO START ORGANIZING</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {playlists.map((playlist: any) => (
            <div 
              key={playlist.id} 
              onClick={() => onSelectPlaylist && onSelectPlaylist(playlist)}
              className="group cursor-pointer border-[1.5px] border-brand-fg bg-white p-2 shadow-[4px_4px_0_0_#0D0D0D] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#0D0D0D] transition-all"
            >
              <div className="w-full aspect-square border-[1.5px] border-brand-fg bg-brand-surface mb-3 relative overflow-hidden">
                 {playlist.customAvatar ? (
                   <img src={playlist.customAvatar} alt="Cover" className="w-full h-full object-cover filter grayscale" />
                 ) : (
                   <div className="grid grid-cols-2 grid-rows-2 w-full h-full">
                      {[0, 1, 2, 3].map(i => (
                        <div key={i} className={\`w-full h-full \${i % 2 === 0 ? 'border-r-[1.5px]' : ''} \${i < 2 ? 'border-b-[1.5px]' : ''} border-brand-fg bg-white overflow-hidden\`}>
                           {playlist.tracks[i] ? (
                             <img src={playlist.tracks[i].thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover filter grayscale" />
                           ) : (
                             <div className="w-full h-full bg-brand-bg flex items-center justify-center font-mono text-[10px] text-brand-muted">#</div>
                           )}
                        </div>
                      ))}
                   </div>
                 )}
                 <div className="absolute inset-0 bg-brand-fg/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <div className="w-10 h-10 rounded-full bg-brand-fg text-brand-bg flex items-center justify-center">
                     <Play className="w-5 h-5 ml-1 fill-current" />
                   </div>
                 </div>
              </div>
              <p className="font-serif font-bold text-sm truncate">{playlist.name}</p>
              <p className="font-mono text-[10px] text-brand-muted mt-0.5">{playlist.tracks.length} TRACKS</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between items-end border-b-[1.5px] border-brand-fg pb-2 mb-6">`;

code = code.replace(regexReturn, newReturn);
fs.writeFileSync('src/components/OtherViews.tsx', code);
