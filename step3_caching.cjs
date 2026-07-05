const fs = require('fs');
let code = fs.readFileSync('src/lib/providers/saavnProvider.ts', 'utf8');

const regex = /async getStreamUrl\(song: Song\): Promise<string \| null> \{([\s\S]*?)\}\n\}/;

const replacement = `async getStreamUrl(song: Song): Promise<string | null> {
    const cacheKey = \`echo_stream_\${song.videoId}\`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) return cached; // ZERO bandwidth used
    } catch(e) {}

    console.log("Resolving Saavn stream for:", song.title);
    let streamUrl: string | null = null;
    try {
      if (song.downloadUrls && Array.isArray(song.downloadUrls) && song.downloadUrls.length > 0) {
        const bestQuality = song.downloadUrls.find((link: any) => link.quality === '320kbps') || song.downloadUrls[song.downloadUrls.length - 1];
        streamUrl = bestQuality.url || bestQuality.link || (typeof bestQuality === 'string' ? bestQuality : null);
      } else {
        const res = await fetch(\`\${this.baseUrl}/songs?ids=\${song.videoId}\`);
        const data = await res.json();
        const songData = data.data?.[0] || data[0] || data;
        
        if (songData) {
          const downloads = songData.downloadUrl || songData.media_url;
          if (downloads && Array.isArray(downloads) && downloads.length > 0) {
              const bestQuality = downloads.find((link: any) => link.quality === '320kbps') || downloads[downloads.length - 1];
              streamUrl = bestQuality.url || bestQuality.link || (typeof bestQuality === 'string' ? bestQuality : null);
          }
        }
      }
    } catch (err) {
      console.error("Saavn stream resolution failed:", err);
    }

    if (streamUrl) {
      try { localStorage.setItem(cacheKey, streamUrl); } catch(e) {} // Save for future
      return streamUrl;
    }
    return null;
  }
}`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/lib/providers/saavnProvider.ts', code);
