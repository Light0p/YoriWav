const fs = require('fs');
let code = fs.readFileSync('src/components/RoomView.tsx', 'utf8');

const lastReturnIdx = code.lastIndexOf('return (');
const content = code.substring(lastReturnIdx);

// Count opening and closing divs
const openDivs = (content.match(/<div/g) || []).length;
const closeDivs = (content.match(/<\/div>/g) || []).length;

console.log("Open Divs:", openDivs);
console.log("Close Divs:", closeDivs);

if (openDivs < closeDivs) {
  // We have too many closing divs. Let's just remove the excess from the end.
  const diff = closeDivs - openDivs;
  let newContent = content;
  for (let i = 0; i < diff; i++) {
    newContent = newContent.replace(/<\/div>\s*$/, '');
  }
  code = code.substring(0, lastReturnIdx) + newContent;
  fs.writeFileSync('src/components/RoomView.tsx', code);
}
