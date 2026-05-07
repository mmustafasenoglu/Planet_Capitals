const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('🔄 Veritabanı bağlantısı test ediliyor (Localhost)...');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '', // Mac'te DB şifren varsa buraya koymayı unutma, örn: 'root'
      // socketPath Mac cihazlarda yerel MySQL için genellikle gereklidir:
      socketPath: '/tmp/mysql.sock' 
    });

    console.log('✅ MySQL sunucusuna başarıyla bağlanıldı!');
    
    try {
      await connection.query('USE planetcapital');
      console.log('✅ "planetcapital" veritabanı başarıyla seçildi!');
      
      const [rows] = await connection.execute('SELECT 1 as result');
      console.log('✅ Örnek sorgu atıldı. İşlem Başarılı!');
    } catch (dbError) {
      if (dbError.code === 'ER_BAD_DB_ERROR') {
        console.error('❌ HATA: "planetcapital" adında bir veritabanı bulunamadı!');
        console.log('💡 ÇÖZÜM: Lütfen phpMyAdmin veya terminal üzerinden "planetcapital" adında bir veritabanı oluştur.');
      } else {
        throw dbError;
      }
    }
    
    await connection.end();
  } catch (error) {
    console.error('❌ Bağlantı HATASI:', error.message);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOENT') {
      console.log('💡 İPUCU: MySQL servisi kapalı veya socket adresi yanlış.');
      console.log('MAMP kullanıyorsan socket yolu: /Applications/MAMP/tmp/mysql/mysql.sock olabilir.');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 İPUCU: Veritabanı şifren yanlış. MAMP veya XAMPP kullanıyorsan şifreyi "root" olarak ayarlamayı dene.');
    }
  }
}

testConnection();