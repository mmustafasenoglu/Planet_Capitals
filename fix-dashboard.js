const fs = require('fs');

let content = fs.readFileSync('app/dashboard/DepositForm.tsx', 'utf8');

// Replace localStorage.setItem(..., JSON.stringify(...)) with writeJSON(..., ...)
content = content.replace(/localStorage\.setItem\(\s*('[^']+')\s*,\s*JSON\.stringify\(([^)]+)\)\s*\);/g, "writeJSON($1, $2);");

if (!content.includes('writeJSON')) {
  // If it doesn't have it, import it
  content = content.replace("import { useState } from 'react';", "import { useState } from 'react';\nimport { writeJSON } from '../../lib/storage-helpers';");
}

fs.writeFileSync('app/dashboard/DepositForm.tsx', content);
console.log("Dashboard deposit fixed!");
