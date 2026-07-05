const fs = require('fs');
let code = fs.readFileSync('src/components/HomeView.tsx', 'utf8');

// Fix duplicates in interface
code = code.replace(/  favorites\?: string\[\];\n  onToggleFavorite\?: \(id: string\) => void;\n/g, '');
code = code.replace(/interface HomeViewProps \{/, 'interface HomeViewProps {\n  favorites?: string[];\n  onToggleFavorite?: (id: string) => void;');

// Add homeTracks
code = code.replace(/const categories = \[.*?\];[\s\S]*?(?=React\.useEffect\(\(\) => \{)/, `
  const categories = ["Classic", "90s", "New", "Instrumental", "Modern Play"];
  const [homeTracks, setHomeTracks] = useState<any[]>([]);

  React.useEffect(() => {
    async function loadHomeData() {
      try {
        const results = await musicProvider.search("Top trending Hindi");
        setHomeTracks(results as any);
      } catch (err) {
        console.error("Failed to load home data", err);
      }
    }
    loadHomeData();
  }, []);
  
  `);

fs.writeFileSync('src/components/HomeView.tsx', code);
