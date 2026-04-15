import fs from 'fs';
import path from 'path';

function fixCorruptedPages(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      fixCorruptedPages(full);
    } else if (f === 'page.tsx') {
      let content = fs.readFileSync(full, 'utf8');
      if (content.includes('$($_.Parent.Name)/$($_.Name)') || content.includes('`n`n')) {
        // e.g. e:\Divy\...\src\app\admin\chapters\page.tsx
        // Parent folder: chapters
        // Grandparent folder: admin
        const parts = full.split(path.sep);
        const folderName = parts[parts.length - 2];
        const roleName = parts[parts.length - 3]; // admin or student
        
        let newContent = `"use client";\n\nimport PageComponent from "@/../legacy-pages/${roleName}/${folderName}";\n\nexport default function Page() { return <PageComponent />; }\n`;
        fs.writeFileSync(full, newContent);
        console.log(`Fixed: ${full}`);
      }
    }
  }
}

fixCorruptedPages('e:/Divy/Projects/Netlify/Git/examportal/artifacts/exam-portal-next/src/app');
