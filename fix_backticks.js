const fs = require('fs');
let file = 'app/school/page.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/\\`/g, '`');
fs.writeFileSync(file, content, 'utf8');
console.log('Fixed backticks in ' + file);
