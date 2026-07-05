const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

code = code.replace(/ && data\.updatedAt == request\.time\.toMillis\(\)/g, '');
code = code.replace(/ && data\.joinedAt == request\.time\.toMillis\(\)/g, '');
code = code.replace(/ && data\.timestamp == request\.time\.toMillis\(\)/g, '');

fs.writeFileSync('firestore.rules', code);
