const fs = require('fs');

const files = [
  'app/school/page.tsx',
  'app/student/page.tsx',
  'app/teacher/page.tsx',
  'app/parent/page.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    // Ensure currentUser is destructured cleanly without nesting/duplication
    content = content.replace(/const \{ (.*)\b(?:currentUser:\s*)*user\b(.*) \} = useAuth\(\);/g, (match, prefix, suffix) => {
      const cleanPrefix = prefix.replace(/currentUser:\s*/g, '');
      return `const { ${cleanPrefix}currentUser: user${suffix} } = useAuth();`;
    });
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed currentUser in ' + file);
  }
});
