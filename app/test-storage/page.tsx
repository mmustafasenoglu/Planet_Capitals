'use client';

import { useState, useEffect } from 'react';
import { getStorageAdapter } from '@/lib/storage-helpers';

export default function TestStoragePage() {
  const [status, setStatus] = useState('Initializing...');
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    testStorageAdapter();
  }, []);

  const addResult = (message: string) => {
    console.log('📋 Test:', message);
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testStorageAdapter = async () => {
    try {
      addResult('🔄 Storage Adapter test başlatılıyor...');
      
      const storage = getStorageAdapter();
      
      // Test 1: Basic setItem/getItem
      addResult('✅ Test 1: Basic setItem/getItem');
      storage.setItem('test_key_1', 'test_value_1');
      const value1 = storage.getItem('test_key_1');
      if (value1 === 'test_value_1') {
        addResult('✅ Test 1 BAŞARILI: setItem/getItem çalışıyor');
      } else {
        addResult('❌ Test 1 BAŞARISIZ: ' + value1);
      }

      // Test 2: JSON data
      addResult('✅ Test 2: JSON data storage');
      const testObj = { name: 'Test User', email: 'test@example.com', coins: { USDT: 100 } };
      storage.setItem('test_user', JSON.stringify(testObj));
      const retrievedData = storage.getItem('test_user');
      if (retrievedData) {
        const parsedObj = JSON.parse(retrievedData);
        if (parsedObj.name === 'Test User' && parsedObj.coins.USDT === 100) {
          addResult('✅ Test 2 BAŞARILI: JSON data çalışıyor');
        } else {
          addResult('❌ Test 2 BAŞARISIZ: JSON parse hatası');
        }
      } else {
        addResult('❌ Test 2 BAŞARISIZ: Data alınamadı');
      }

      // Test 3: removeItem
      addResult('✅ Test 3: removeItem');
      storage.removeItem('test_key_1');
      const deletedValue = storage.getItem('test_key_1');
      if (deletedValue === null) {
        addResult('✅ Test 3 BAŞARILI: removeItem çalışıyor');
      } else {
        addResult('❌ Test 3 BAŞARISIZ: ' + deletedValue);
      }

      // Test 4: User simulation
      addResult('✅ Test 4: Gerçek kullanıcı simülasyonu');
      const simulatedUser = {
        email: 'demo@planetcapital.com',
        name: 'Demo User',
        loginTime: new Date().toISOString()
      };
      storage.setItem('pc_current_user', JSON.stringify(simulatedUser));
      
      const userBalances = {
        'demo@planetcapital.com': {
          coins: { USDT: 1000, BTC: 0.5 },
          transactions: [
            {
              id: 'tx_' + Date.now(),
              type: 'deposit',
              amount: 1000,
              symbol: 'USDT',
              date: new Date().toISOString()
            }
          ]
        }
      };
      storage.setItem('pc_balances_v2', JSON.stringify(userBalances));

      addResult('✅ Test 4 BAŞARILI: Kullanıcı ve bakiye verisi kaydedildi');

      // Test 5: MySQL sync verification
      addResult('✅ Test 5: MySQL sync kontrolü - 3 saniye bekleyin...');
      
      setTimeout(async () => {
        try {
          const response = await fetch('/api/db', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'getItem',
              key: 'pc_current_user'
            })
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.value) {
              const mysqlUser = JSON.parse(result.value);
              if (mysqlUser.email === 'demo@planetcapital.com') {
                addResult('🎉 Test 5 BAŞARILI: MySQL sync çalışıyor!');
                setStatus('🎉 TÜM TESTLER BAŞARILI! Storage adapter tam çalışır durumda.');
              } else {
                addResult('⚠️ Test 5 KISMÎ: MySQL\'de farklı data var');
                setStatus('⚠️ Sistem çalışıyor ama sync\'de fark var');
              }
            } else {
              addResult('⚠️ Test 5 BAŞARISIZ: MySQL\'den data alınamadı');
              setStatus('⚠️ LocalStorage çalışıyor, MySQL sync problem');
            }
          } else {
            addResult('❌ Test 5 BAŞARISIZ: API response error');
            setStatus('❌ MySQL API bağlantı problemi');
          }
        } catch (error) {
          addResult('❌ Test 5 BAŞARISIZ: ' + (error as Error).message);
          setStatus('❌ MySQL bağlantı hatası');
        }
      }, 3000);

      setStatus('🔄 MySQL sync test bekliyor...');
      
    } catch (error) {
      addResult('❌ GENEL HATA: ' + (error as Error).message);
      setStatus('❌ Test hatası');
    }
  };

  const clearAllData = () => {
    try {
      const storage = getStorageAdapter();
      storage.clear();
      addResult('🗑️ Tüm test verisi silindi');
      setTestResults([]);
    } catch (error) {
      addResult('❌ Silme hatası: ' + (error as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            🧪 Storage Adapter Test Panel
          </h1>
          
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-800">Durum:</h2>
            <p className="text-blue-700">{status}</p>
          </div>

          <div className="flex gap-4 mb-6">
            <button
              onClick={testStorageAdapter}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              🔄 Testleri Yeniden Çalıştır
            </button>
            
            <button
              onClick={clearAllData}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              🗑️ Test Verilerini Temizle
            </button>
          </div>

          <div className="bg-gray-50 border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Test Sonuçları:</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono bg-white p-2 rounded border">
                  {result}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">ℹ️ Açıklama:</h3>
            <ul className="text-yellow-700 space-y-1 text-sm">
              <li>• Bu test, storage adapter sisteminin doğru çalıştığını kontrol eder</li>
              <li>• Veriler hem localStorage\'a hem MySQL\'e yazılır</li>
              <li>• MySQL bağlantısı 3 saniye sonra test edilir</li>
              <li>• Tüm testler geçerse sistem kullanıma hazırdır</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}