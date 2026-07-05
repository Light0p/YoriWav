const fs = require('fs');

let code = fs.readFileSync('src/lib/providers/youtubeProvider.ts', 'utf8');

const newMethod = `  async getStreamUrl(song: Song): Promise<string> {
    console.log("Fetching stream for:", song.title);
    
    try {
      // Attempt 1: Cobalt API (Bypasses IP locks & CORS)
      const cobaltRes = await fetch("https://api.cobalt.tools/api/json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          url: \`https://www.youtube.com/watch?v=\${song.videoId}\`,
          aFormat: "mp3",
          isAudioOnly: true
        })
      });
      const cobaltData = await cobaltRes.json();
      if (cobaltData && cobaltData.url) {
        console.log("Success! Stream URL:", cobaltData.url);
        return cobaltData.url;
      }
    } catch (err) {
      console.warn("Cobalt attempt failed, falling back...", err);
    }

    // Attempt 2: Piped API 
    try {
      const pipedRes = await fetch(\`https://pipedapi.kavin.rocks/streams/\${song.videoId}\`);
      const pipedData = await pipedRes.json();
      const audioStream = pipedData.audioStreams.find((s: any) => s.codec === 'mp4a.40.2' || s.mimeType.includes('mp4'));
      if (audioStream) return audioStream.url;
    } catch (err) {
      console.error("All streaming methods failed.", err);
    }
    
    throw new Error("No valid stream URL found");
  }`;

// Find the start of getStreamUrl and replace to the end
code = code.replace(/async getStreamUrl.*\}[\s]*\}/s, newMethod + '\n}');

fs.writeFileSync('src/lib/providers/youtubeProvider.ts', code);
