import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test API endpoint - sadece debug amaçlı
    const testResponse = await fetch('http://localhost:3000/api/db', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'setItem',
        key: 'test_connection',
        value: 'Test başarılı - ' + new Date().toISOString()
      }),
    });

    const result = await testResponse.json();

    if (result.success) {
      // Şimdi geri okuyalım
      const readResponse = await fetch('http://localhost:3000/api/db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getItem',
          key: 'test_connection'
        }),
      });

      const readResult = await readResponse.json();

      return NextResponse.json({
        success: true,
        message: 'MySQL Storage Adapter Testi Başarılı',
        writeTest: result,
        readTest: readResult,
        timestamp: new Date().toISOString()
      });
    } else {
      throw new Error('Write test başarısız: ' + JSON.stringify(result));
    }

  } catch (error) {
    console.error('Storage test hatası:', error);
    return NextResponse.json({
      success: false,
      error: String(error),
      message: 'Storage adapter test başarısız'
    }, { status: 500 });
  }
}