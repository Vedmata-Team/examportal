import fs from 'fs';
import path from 'path';

function removeWouter(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      removeWouter(full);
    } else if (full.endsWith('.tsx')) {
      let content = fs.readFileSync(full, 'utf8');
      let changed = false;

      // Handle simple Link replacements
      if (content.includes('import { Link } from "wouter";')) {
        content = content.replace(/import { Link } from "wouter";\r?\n?/g, 'import Link from "next/link";\n');
        changed = true;
      }

      // Handle useLocation -> useRouter
      if (content.includes('useLocation')) {
        content = content.replace(/import { useLocation } from "wouter";\r?\n?/g, 'import { useRouter } from "next/navigation";\n');
        content = content.replace(/const \[\s*,?\s*setLocation\] = useLocation\(\);/g, 'const router = useRouter();');
        content = content.replace(/setLocation\(/g, 'router.push(');
        changed = true;
      }

      // Handle useParams
      if (content.includes('useWouterParams')) {
        content = content.replace(/import { useParams as useWouterParams } from "wouter";\r?\n?/g, 'import { useParams } from "next/navigation";\n');
        content = content.replace(/const wouterParams = useWouterParams\(\);/g, 'const wouterParams = useParams() || {};');
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(full, content);
        console.log(`Updated wouter imports in ${full}`);
      }
    }
  }
}

const legacyDir = 'e:/Divy/Projects/Netlify/Git/examportal/artifacts/exam-portal-next/legacy-pages';
removeWouter(legacyDir);
console.log('Finished removing wouter dependencies.');
