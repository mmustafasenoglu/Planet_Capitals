const fs = require('fs');

let content = fs.readFileSync('app/admin/page.tsx', 'utf8');

// Replace localStorage.setItem(..., JSON.stringify(...)) with writeJSON(..., ...)
content = content.replace(/localStorage\.setItem\(\s*('[^']+')\s*,\s*JSON\.stringify\(([^)]+)\)\s*\);/g, "writeJSON($1, $2);");

// Also add 'storage_adapter' db_sync_completed listener to trigger initial load
if (!content.includes('db_sync_completed')) {
  // Find where they load initial data
  // Basically in the first useEffect inside AdminPage
  content = content.replace(/useEffect\(\(\) => \{\n\s*\/\/ Component yüklendiğinde/, `
  const loadAdminData = () => {
    // Component yüklendiğinde veya db'den sync olduğunda çalışacak veri çekme fonksiyonu
    const adminSession = localStorage.getItem('adminSession');
    if (!adminSession && typeof window !== 'undefined') {
        // window.location.href = '/admin/login';
    } else {
        setIsLoggedIn(true);
    }
  };

  useEffect(() => {
    // Listener added here
    window.addEventListener('db_sync_completed', () => {
       console.log('🔄 DB Sync Completed in Admin, reloading window for fresh data (or we could reload states manually)');
       window.location.reload();
    });
`);
}

fs.writeFileSync('app/admin/page.tsx', content);
console.log("Admin fixed!");
