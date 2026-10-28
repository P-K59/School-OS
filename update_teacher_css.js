const fs = require('fs');

const filePath = 'app/teacher/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update main container
content = content.replace(
    '<div className="space-y-6">',
    '<div className="space-y-6 luxury-mesh-bg p-4 sm:p-6 lg:p-8 rounded-[2.5rem] min-h-[calc(100vh-2rem)] border border-white/50 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)]">'
);

// 2. Update all light-glass classes
content = content.replace(/className="light-glass /g, 'className="glass-3d glass-3d-hover ');
content = content.replace(/className="light-glass-glow /g, 'className="glass-3d glass-3d-hover border-indigo-200 ');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Updated teacher page with 3D UI classes.');
