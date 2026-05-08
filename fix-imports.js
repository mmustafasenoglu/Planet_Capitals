const fs = require('fs');

const findFiles = (dir) => {
  let results = [];
  for (const file of fs.readdirSync(dir)) {
    const filePath = dir + '/' + file;
    if (fs.statSync(filePath).isDirectory()) {
      results = results.concat(findFiles(filePath));
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      results.push(filePath);
    }
  }
  return results;
}

const files = findFiles('./app');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  if (content.includes('import { storage }')) {
    const parts = file.split('/');
    // Example: ./app/admin/page.tsx (length 4)
    // from admin (dir) to root: ../../
    const depth = parts.length - 2; // e.g. for ./app/page.tsx it's 3 - 2 = 1.
    const prefix = depth > 0 ? '../'.repeat(depth) : './';
    const correctPath = prefix + 'lib/storage-adapter';
    
    content = content.replace(/import \{ storage \} from '[^']+';/g, `import { storage } from '${correctPath}';`);
    
    if (content !== original) {
      fs.writeFileSync(file, content);
      console.log('Fixed', file, correctPath);
    }
  }
}
