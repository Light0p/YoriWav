const fs = require('fs');

// 1. saavnProvider.ts
let providerCode = fs.readFileSync('src/lib/providers/saavnProvider.ts', 'utf8');
if (!providerCode.includes('export const musicApi = new SaavnProvider();')) {
    providerCode += '\nexport const musicApi = new SaavnProvider();\n';
    fs.writeFileSync('src/lib/providers/saavnProvider.ts', providerCode);
}

// 2. Replace musicProvider with musicApi in all files
function replaceInFile(filePath) {
    if (fs.existsSync(filePath)) {
        let code = fs.readFileSync(filePath, 'utf8');
        code = code.replace(/musicProvider/g, 'musicApi');
        code = code.replace(/from "\.\/lib\/providers"/g, 'from "./lib/providers/saavnProvider"');
        code = code.replace(/from "\.\.\/lib\/providers"/g, 'from "../lib/providers/saavnProvider"');
        fs.writeFileSync(filePath, code);
    }
}

replaceInFile('src/App.tsx');
replaceInFile('src/components/HomeView.tsx');
replaceInFile('src/components/OtherViews.tsx');

