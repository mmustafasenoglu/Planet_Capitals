import mysql from 'mysql2/promise';
import { NextRequest, NextResponse } from 'next/server';

function getPool(): mysql.Pool {
  return mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'planetcapital',
    port: Number(process.env.DB_PORT) || 3306,
    connectionLimit: 10,
  });
}

export async function GET() {
  try {
    const pool = getPool();
    
    // registeredUsers verilerini al
    const [registeredUserData]: any = await pool.execute(
      'SELECT storage_value FROM storage_data WHERE storage_key = ?',
      ['registeredUsers']
    );

    let users = [];
    if (registeredUserData?.length > 0) {
      try {
        users = JSON.parse(registeredUserData[0].storage_value);
      } catch (e) {
        console.error('Kullanıcı JSON parse hatası:', e);
      }
    }

    // Suspended users listesini al
    const [suspendedData]: any = await pool.execute(
      'SELECT storage_value FROM storage_data WHERE storage_key = ?',
      ['suspendedUsers']
    );

    let suspendedUsers: string[] = [];
    if (suspendedData?.length > 0) {
      try {
        suspendedUsers = JSON.parse(suspendedData[0].storage_value);
      } catch (e) {
        console.error('Askıya alınmış kullanıcı JSON parse hatası:', e);
      }
    }

    // Status bilgisini ekle
    const processedUsers = users.map((user: any) => ({
      ...user,
      status: suspendedUsers.includes(user.email) ? 'suspended' : 'active'
    }));

    return NextResponse.json({ 
      success: true, 
      users: processedUsers 
    });
  } catch (error: any) {
    console.error('API Users hatası:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
