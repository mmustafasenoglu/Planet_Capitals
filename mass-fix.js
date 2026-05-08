const fs = require('fs');
const glob = require('glob');
const path = require('path');

// Recursive file search
function findFiles(dir, filter) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(filePath, filter));
    } else if (filter.test(filePath)) {
      results.push(filePath);
    }
  }
  return results;
}

const files = findFiles('./app', /\.tsx?$/);

let fixCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Let's replace ONLY IF they are native localStorage calls.
  // Actually, wait. It's safer to just let them use storage-adapter.ts
  if (content.includes("localStorage.setItem") || content.includes("localStorage.getItem")) {
    
    // Add import if not exists
    if (!content.includes("storage-adapter") && !content.includes("getStorageAdapter")) {
        // figure out depth to lib
        const depth = file.split('/').length - 2;
        const prefix = depth > 0 ? '../'.repeat(depth) : './';
        const importStatement = `import { storage } from '${prefix}lib/storage-adapter';\n`;
        
        // Find top after 'use client'
        if (content.includes("'use client';")) {
             content = content.replace("'use client';", "'use client';\n" + importStatement);
        } else if (content.includes('"use client";')) {
             content = content.replace('"use client";', '"use client";\n' + importStatement);
        } else {
             content = importStatement + content;
        }
    }
    
    // Replace native localStorage calls with storage
    content = content.replace(/window\.localStorage/g, 'storage');
    content = content.replace(/localStorage\./g, 'storage.');
    
    if (content !== original) {
      fs.writeFileSync(file, content);
      fixCount++;
    }
  }
}

console.log("Fixed " + fixCount + " files.");
