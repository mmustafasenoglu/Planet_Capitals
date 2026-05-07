import mysql from 'mysql2/promise';
import { NextRequest, NextResponse } from 'next/server';

// MySQL bağlantı havuzu
let pool: mysql.Pool | null = null;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'planetcapital',
      port: Number(process.env.DB_PORT) || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

// Tabloları oluştur (eğer yoksa)
async function createTablesIfNotExists() {
  const connection = getPool();
  
  try {
    // Storage table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS storage_data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        storage_key VARCHAR(255) NOT NULL,
        storage_value LONGTEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_key (storage_key)
      )
    `);
    
    // Logs table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS storage_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        operation VARCHAR(50) NOT NULL,
        storage_key VARCHAR(255) NOT NULL,
        data_size INT DEFAULT 0,
        success BOOLEAN DEFAULT TRUE,
        error_message TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ MySQL tabloları kontrol edildi/oluşturuldu');
  } catch (error) {
    console.error('❌ MySQL tablo oluşturma hatası:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { action, key, value } = body;
    
    if (!action) {
      return NextResponse.json({ success: false, error: 'Action parametresi gerekli' }, { status: 400 });
    }
    
    // İlk çalıştırmada tabloları oluştur
    await createTablesIfNotExists();
    
    const connection = getPool();
    
    switch (action) {
      case 'setItem':
        try {
          const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
          
          await connection.execute(
            `INSERT INTO storage_data (storage_key, storage_value) VALUES (?, ?) 
             ON DUPLICATE KEY UPDATE storage_value = VALUES(storage_value), updated_at = CURRENT_TIMESTAMP`,
            [key, valueStr]
          );
          
          // Log kaydet
          await connection.execute(
            `INSERT INTO storage_logs (operation, storage_key, data_size, success) VALUES (?, ?, ?, ?)`,
            ['setItem', key, valueStr.length, true]
          );
          
          return NextResponse.json({ success: true });
          
        } catch (error) {
          // Hata log kaydet
          await connection.execute(
            `INSERT INTO storage_logs (operation, storage_key, success, error_message) VALUES (?, ?, ?, ?)`,
            ['setItem', key, false, String(error)]
          );
          
          throw error;
        }
        
      case 'getItem':
        try {
          const [rows] = await connection.execute(
            `SELECT storage_value FROM storage_data WHERE storage_key = ?`,
            [key]
          ) as [any[], any];
          
          const result = rows.length > 0 ? rows[0].storage_value : null;
          
          // Log kaydet
          await connection.execute(
            `INSERT INTO storage_logs (operation, storage_key, success) VALUES (?, ?, ?)`,
            ['getItem', key, true]
          );
          
          return NextResponse.json({ success: true, value: result });
          
        } catch (error) {
          // Hata log kaydet
          await connection.execute(
            `INSERT INTO storage_logs (operation, storage_key, success, error_message) VALUES (?, ?, ?, ?)`,
            ['getItem', key, false, String(error)]
          );
          
          throw error;
        }
        
      case 'removeItem':
        try {
          await connection.execute(
            `DELETE FROM storage_data WHERE storage_key = ?`,
            [key]
          );
          
          // Log kaydet
          await connection.execute(
            `INSERT INTO storage_logs (operation, storage_key, success) VALUES (?, ?, ?)`,
            ['removeItem', key, true]
          );
          
          return NextResponse.json({ success: true });
          
        } catch (error) {
          // Hata log kaydet
          await connection.execute(
            `INSERT INTO storage_logs (operation, storage_key, success, error_message) VALUES (?, ?, ?, ?)`,
            ['removeItem', key, false, String(error)]
          );
          
          throw error;
        }
        
      case 'clear':
        try {
          await connection.execute(`TRUNCATE TABLE storage_data`);
          
          // Log kaydet
          await connection.execute(
            `INSERT INTO storage_logs (operation, storage_key, success) VALUES (?, ?, ?)`,
            ['clear', 'ALL', true]
          );
          
          return NextResponse.json({ success: true });
          
        } catch (error) {
          // Hata log kaydet
          await connection.execute(
            `INSERT INTO storage_logs (operation, storage_key, success, error_message) VALUES (?, ?, ?, ?)`,
            ['clear', 'ALL', false, String(error)]
          );
          
          throw error;
        }
        
      case 'getAllKeys':
        try {
          const [rows] = await connection.execute(
            `SELECT storage_key FROM storage_data ORDER BY storage_key`
          ) as [any[], any];
          
          const keys = rows.map((row: any) => row.storage_key);
          
          // Log kaydet
          await connection.execute(
            `INSERT INTO storage_logs (operation, storage_key, success) VALUES (?, ?, ?)`,
            ['getAllKeys', 'ALL', true]
          );
          
          return NextResponse.json({ success: true, keys });
          
        } catch (error) {
          // Hata log kaydet
          await connection.execute(
            `INSERT INTO storage_logs (operation, storage_key, success, error_message) VALUES (?, ?, ?, ?)`,
            ['getAllKeys', 'ALL', false, String(error)]
          );
          
          throw error;
        }
        
      default:
        return NextResponse.json({ success: false, error: 'Geçersiz işlem' }, { status: 400 });
    }
    
  } catch (error) {
    console.error('MySQL API hatası:', error);
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // İlk çalıştırmada tabloları oluştur
    await createTablesIfNotExists();
    
    const connection = getPool();
    
    // Tüm storage verilerini getir (debug amaçlı)
    const [rows] = await connection.execute(
      `SELECT storage_key, LEFT(storage_value, 100) as preview, 
       LENGTH(storage_value) as size, updated_at 
       FROM storage_data ORDER BY updated_at DESC LIMIT 50`
    ) as [any[], any];
    
    return NextResponse.json({ success: true, data: rows });
    
  } catch (error) {
    console.error('MySQL GET hatası:', error);
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 });
  }
}