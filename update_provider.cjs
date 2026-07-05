const fs = require('fs');
let code = fs.readFileSync('src/lib/providers/saavnProvider.ts', 'utf8');

const getSuggestionsCode = `async getSuggestions(songId: string): Promise<Song[]> {
    try {
      const res = await fetch(\`\${this.baseUrl}/songs/\${songId}/suggestions\`);
      const data = await res.json();
      const results = data.data || data;
      if (!Array.isArray(results)) return [];
      
      return results.map((song: any) => {
        const thumb = song.image?.find((img: any) => img.quality === '500x500') || song.image?.[song.image?.length - 1];
        const thumbUrl = thumb?.url || thumb?.link || (typeof song.image === 'string' ? song.image : '');
        
        return {
          videoId: song.id,
          title: song.title?.replace(/&quot;/g, '"') || song.song || song.name, 
          artist: song.primaryArtists || song.singers || song.artists?.primary?.[0]?.name,
          thumbnailUrl: thumbUrl,
          downloadUrls: song.downloadUrl || song.media_url
        };
      });
    } catch (err) {
      console.error("Saavn suggestions failed:", err);
      return [];
    }
  }`;

code = code.replace(/async getSuggestions\(query: string\): Promise<string\[\]> \{\s*return \[\];\s*\}/, getSuggestionsCode);
// Also update IMusicProvider in types.ts if necessary
fs.writeFileSync('src/lib/providers/saavnProvider.ts', code);
