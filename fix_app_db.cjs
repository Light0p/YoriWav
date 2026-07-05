const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Fix room creation
code = code.replace(/hostName: currentUser\.displayName,/, 'hostName: currentUser.displayName || "Anonymous",');
code = code.replace(/trackId: track\.videoId,/, 'trackId: track.videoId || "",');
code = code.replace(/trackTitle: track\.title,/, 'trackTitle: track.title || "Unknown",');
code = code.replace(/trackArtist: track\.artist,/, 'trackArtist: track.artist || "Unknown",');
code = code.replace(/trackThumbnailUrl: track\.thumbnailUrl,/, 'trackThumbnailUrl: track.thumbnailUrl || "",');

// Fix presence creation
code = code.replace(/setDoc\(myPresenceRef, \{\s*displayName: currentUser\.displayName,\s*photoUrl: currentUser\.photoUrl,\s*joinedAt: Date\.now\(\)\s*\}\);/, `setDoc(myPresenceRef, {
        uid: currentUser.uid,
        displayName: currentUser.displayName || "Anonymous",
        photoUrl: currentUser.photoUrl || "",
        joinedAt: Date.now()
      });`);

// Fix message creation
code = code.replace(/displayName: currentUser\.displayName,/, 'displayName: currentUser.displayName || "Anonymous",');

fs.writeFileSync('src/App.tsx', code);
