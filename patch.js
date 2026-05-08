const fs = require('fs');

// Patch app/api/db/route.ts
let dbCode = fs.readFileSync('app/api/db/route.ts', 'utf8');
if (!dbCode.includes("case 'getAll':")) {
  const getAllCode = `
      case 'getAll':
        try {
          const [rows] = await connection.execute(
            \`SELECT storage_key, storage_value FROM storage_data\`
          ) as [any[], any];
          
          return NextResponse.json({ success: true, data: rows });
          
        } catch (error) {
          throw error;
        }
  `;
  dbCode = dbCode.replace("case 'getAllKeys':", getAllCode + "\n      case 'getAllKeys':");
  fs.writeFileSync('app/api/db/route.ts', dbCode);
}

// Patch lib/storage-adapter.ts
let adapterCode = fs.readFileSync('lib/storage-adapter.ts', 'utf8');
if (!adapterCode.includes("syncFromServer")) {
  adapterCode = adapterCode.replace("this.loadFromLocalStorage();", "this.loadFromLocalStorage();\n    this.syncFromServer();");
  
  const syncFunc = `
  public async syncFromServer() {
    if (typeof window === 'undefined') return;
    try {
      const resp = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getAll' })
      });
      const result = await resp.json().catch(() => ({}));
      
      if (result?.success && result.data) {
        let changed = false;
        for (const row of result.data) {
          const key = row.storage_key;
          const val = row.storage_value;
          
          if (this.cache.get(key) !== val) {
            this.cache.set(key, val);
            if (window.localStorage) {
              window.localStorage.setItem(key, val);
            }
            changed = true;
          }
        }
        
        if (changed) {
          console.log('🔄 Veritabanından güncel veriler çekildi ve eşitlendi');
          window.dispatchEvent(new Event('db_sync_completed'));
        }
      }
    } catch(e) {
      console.error('Sync from server error:', e);
    }
  }
  `;
  adapterCode = adapterCode.replace("private loadFromLocalStorage() {", syncFunc + "\n  private loadFromLocalStorage() {");
  fs.writeFileSync('lib/storage-adapter.ts', adapterCode);
}

console.log("Patched api and adapter!");
