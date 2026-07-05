const fs = require('fs');

let code = fs.readFileSync('src/lib/providers/youtubeProvider.ts', 'utf8');

const newMethod = `  async getStreamUrl(song: Song): Promise<string | null> {
    console.log("Fetching stream for:", song.title);
    
    // Array of known working Piped API instances
    const pipedInstances = [
      "https://pipedapi.tokhmi.xyz",
      "https://pipedapi.smnz.de",
      "https://pipedapi.kavin.rocks"
    ];

    for (const instance of pipedInstances) {
      try {
        console.log(\`Trying Piped instance: \${instance}\`);
        
        // Wrap the request in corsproxy.io to completely bypass browser CORS blocks
        const targetUrl = \`\${instance}/streams/\${song.videoId}\`;
        const res = await fetch(\`https://corsproxy.io/?\${encodeURIComponent(targetUrl)}\`);
        
        if (!res.ok) {
          console.warn(\`Bad response from \${instance}\`);
          continue;
        }
        
        const data = await res.json();
        
        // Extract the highest quality mp4a audio stream
        const audioStream = data.audioStreams?.find((s: any) => s.codec === 'mp4a.40.2' || s.mimeType?.includes('mp4'));
        
        if (audioStream && audioStream.url) {
          console.log("Success! Stream URL found via", instance);
          return audioStream.url;
        }
      } catch (err) {
        console.warn(\`Fetch failed for \${instance}. Moving to fallback...\`);
      }
    }
    
    console.error("CRITICAL: All CORS-proxied Piped instances failed.");
    return null;
  }`;

code = code.replace(/async getStreamUrl.*\}[\s]*\}/s, newMethod + '\n}');
fs.writeFileSync('src/lib/providers/youtubeProvider.ts', code);
