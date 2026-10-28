const fs = require('fs');

const files = [
    'app/student/page.tsx',
    'app/superadmin/courses/page.tsx',
    'app/superadmin/schools/page.tsx'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    // Replace \$ with $
    content = content.replace(/\\\$/g, '$');
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed syntax in ${file}`);
});
