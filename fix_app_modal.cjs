const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regexUseEffect = /const savePlaylists = \(newPlaylists: any\[\]\) => \{([\s\S]*?)\n\s*\};/;
const modalLogic = `const savePlaylists = (newPlaylists: any[]) => {
    setPlaylists(newPlaylists);
    localStorage.setItem("echo_playlists", JSON.stringify(newPlaylists));
  };

  const [playlistModalTrack, setPlaylistModalTrack] = useState<TrackModel | null>(null);

  useEffect(() => {
    const handleOpenModal = (e: any) => {
      setPlaylistModalTrack(e.detail);
    };
    window.addEventListener('open_playlist_modal', handleOpenModal);
    return () => window.removeEventListener('open_playlist_modal', handleOpenModal);
  }, []);

  const addToPlaylist = (playlistId: string) => {
    if (!playlistModalTrack) return;
    const updated = playlists.map(p => {
      if (p.id === playlistId) {
        if (!p.tracks.find((t: any) => t.videoId === playlistModalTrack.videoId)) {
           return { ...p, tracks: [...p.tracks, playlistModalTrack] };
        }
      }
      return p;
    });
    savePlaylists(updated);
    setPlaylistModalTrack(null);
  };
`;

code = code.replace(regexUseEffect, modalLogic);

const modalRender = `
        {/* Global sticky Audio Bottom Player controls bar */}`;
const newModalRender = `
        {playlistModalTrack && (
          <div className="fixed inset-0 z-[100] bg-brand-bg/80 flex items-center justify-center p-4">
            <div className="w-full max-w-sm border-[1.5px] border-brand-fg bg-brand-surface p-6 shadow-[8px_8px_0_0_#0D0D0D]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif text-xl font-bold">ADD TO PLAYLIST</h3>
                <button onClick={() => setPlaylistModalTrack(null)} className="font-mono text-xs font-bold uppercase hover:underline">CLOSE</button>
              </div>
              <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
                {playlists.length === 0 ? (
                  <p className="font-mono text-xs text-brand-muted">NO PLAYLISTS AVAILABLE.</p>
                ) : (
                  playlists.map(p => (
                    <button 
                      key={p.id}
                      onClick={() => addToPlaylist(p.id)}
                      className="border-[1.5px] border-brand-fg bg-white p-3 font-serif font-bold text-left hover:-translate-y-0.5 hover:shadow-[2px_2px_0_0_#0D0D0D] transition-all"
                    >
                      {p.name} <span className="font-mono text-[10px] text-brand-muted font-normal ml-2">{p.tracks.length} TRACKS</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Global sticky Audio Bottom Player controls bar */}`;

code = code.replace(modalRender, newModalRender);
fs.writeFileSync('src/App.tsx', code);
