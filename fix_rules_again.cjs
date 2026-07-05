const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

// Increase trackThumbnailUrl max size to 2000
code = code.replace(/data\.trackThumbnailUrl\.size\(\) <= 500/g, 'data.trackThumbnailUrl.size() <= 2000');

// Increase photoUrl max size to 2000
code = code.replace(/data\.photoUrl\.size\(\) <= 500/g, 'data.photoUrl.size() <= 2000');

// Allow update for presence
code = code.replace(/allow create: if isSignedIn\(\) && isValidId\(userId\) && userId == request\.auth\.uid && isValidPresence\(incoming\(\)\) && exists\(\/databases\/\$\(database\)\/documents\/rooms\/\$\(roomId\)\);/, 
'allow create, update: if isSignedIn() && isValidId(userId) && userId == request.auth.uid && isValidPresence(incoming()) && exists(/databases/$(database)/documents/rooms/$(roomId));');

fs.writeFileSync('firestore.rules', code);
