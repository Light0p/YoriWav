const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/useState<string\[\]>\(\["the-suffering", "resonance"\]\)/, 'useState<string[]>([])');

fs.writeFileSync('src/App.tsx', code);
