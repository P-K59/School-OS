const fs = require('fs');

const files = [
  'app/superadmin/courses/page.tsx',
  'app/superadmin/schools/page.tsx',
  'app/superadmin/page.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/\\`/g, '`');
    content = content.replace(/\\\$/g, '$');
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed syntax in ' + file);
  }
});
