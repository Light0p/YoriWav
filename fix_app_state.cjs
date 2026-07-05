const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const stateMatch = /const \[favorites, setFavorites\] = useState<TrackModel\[\]>\(\[\]\);/;
const newState = `const [favorites, setFavorites] = useState<TrackModel[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [activePlaylist, setActivePlaylist] = useState<any | null>(null);

  // Load playlists
  useEffect(() => {
    try {
      const p = localStorage.getItem("echo_playlists");
      if (p) setPlaylists(JSON.parse(p));
    } catch (e) {}
  }, []);

  const savePlaylists = (newPlaylists: any[]) => {
    setPlaylists(newPlaylists);
    localStorage.setItem("echo_playlists", JSON.stringify(newPlaylists));
  };
`;

code = code.replace(stateMatch, newState);
fs.writeFileSync('src/App.tsx', code);
