const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/if \(activeRoomId && isHost\) \{\s*updateDoc\(doc\(db, "rooms", activeRoomId\), \{[\s\S]*?updatedAt: Date\.now\(\)\s*\}\);\s*\}/g, '');

fs.writeFileSync('src/App.tsx', code);
