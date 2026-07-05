const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'console.warn("Stream resolution error, using fallback:", error.message);',
  '// fallback silent'
);

fs.writeFileSync('server.ts', code);
