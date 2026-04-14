import fs from 'fs';
import path from 'path';

function stripLayouts(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      stripLayouts(full);
    } else if (full.endsWith('.tsx')) {
      let content = fs.readFileSync(full, 'utf8');
      
      // Admin Layout
      content = content.replace(/import AdminLayout from "@\/components\/admin-layout";\r?\n?/g, '');
      content = content.replace(/<AdminLayout>/g, '<>');
      content = content.replace(/<\/AdminLayout>/g, '</>');
      
      // Student Layout
      content = content.replace(/import StudentLayout from "@\/components\/student-layout";\r?\n?/g, '');
      content = content.replace(/<StudentLayout>/g, '<>');
      content = content.replace(/<\/StudentLayout>/g, '</>');
      
      fs.writeFileSync(full, content);
    }
  }
}

stripLayouts('e:/Divy/Projects/Netlify/Git/examportal/artifacts/exam-portal-next/legacy-pages');
console.log('Layouts successfully stripped from legacy pages!');
