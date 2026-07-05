import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Innertube } from "youtubei.js";

const app = express();
const PORT = 3000;

let ytInstance = null;
async function getInnertube() {
  if (!ytInstance) {
    ytInstance = await Innertube.create({ generate_session_locally: true });
  }
  return ytInstance;
}

// API routes FIRST
app.get("/api/music/search", async (req, res) => {
  const query = req.query.q;
  if (!query) {
    res.status(400).json({ error: "Missing query parameter 'q'" });
    return;
  }

  try {
    const yt = await getInnertube();
    const search = await yt.music.search(query, { type: 'song' });
    
    const shelf = search.contents?.find(c => c.type === 'MusicShelf');
    if (!shelf || !shelf.contents) {
      res.json([]);
      return;
    }
    
    const tracks = shelf.contents.map(song => {
      const artists = song.artists?.map(a => a.name).join(', ') || "Unknown Artist";
      const thumbnails = song.thumbnails;
      const thumbnailUrl = song.thumbnails ? song.thumbnails.sort((a, b) => b.width - a.width)[0].url : "";
      
      return {
        videoId: song.id,
        title: song.title,
        artist: artists,
        thumbnailUrl
      };
    }).filter(t => t.videoId);
    
    res.json(tracks);
  } catch (error) {
    console.warn("Search error:", error);
    res.status(500).json({ error: error.message });
  }
});


app.get("/api/music/suggest", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.json([]);
  try {
    const yt = await getInnertube();
    const suggestions = await yt.music.getSearchSuggestions(query);
    let texts = [];
    if (suggestions[0] && suggestions[0].contents) {
        texts = suggestions[0].contents.map(c => (c.suggestion && c.suggestion.text) || (c.title && c.title.text) || c.text).filter(Boolean);
    }
    res.json(texts);
  } catch (error) {
    console.warn("Suggest error:", error);
    res.json([]);
  }
});

app.get("/api/music/stream", async (req, res) => {
  const videoId = req.query.id;
  if (!videoId) {
    res.status(400).json({ error: "Missing video ID" });
    return;
  }

  try {
    const yt = await getInnertube();
    // Try to get stream with Innertube
    let info;
    try {
      info = await yt.getBasicInfo(videoId);
    } catch (err) {
      info = await yt.getBasicInfo(videoId, 'ANDROID_MUSIC');
    }
    
    const format = info.chooseFormat({ type: 'audio', quality: 'best' });
    
    let streamUrl = format?.url;
    if (!streamUrl && format) {
       try {
         streamUrl = format.decipher(yt.session.player);
       } catch (e) {
         console.warn("Decipher failed:", e.message);
       }
    }
    
    if (streamUrl) {
      res.json({ url: streamUrl });
      return;
    }
    
    throw new Error("No valid stream URL found via youtubei.js");
  } catch (error) {
    // fallback silent
    // Fallback to Cobalt/Piped API proxy or direct format if youtubei.js is blocked
    res.json({ 
      url: `https://inv.tux.pizza/latest_version?id=${videoId}&itag=140`,
      fallback: true,
      reason: error.message 
    });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  }
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
