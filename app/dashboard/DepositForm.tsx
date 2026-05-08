'use client';
import { storage } from '../../lib/storage-adapter';


import { useState, useEffect } from 'react';
import { getUserBalance, saveUserBalance, addTransaction } from '../../lib/storage-helpers';

interface DepositFormProps {
  onSuccess?: () => void;
}

export default function DepositForm({ onSuccess }: DepositFormProps) {
  const [activeMethod, setActiveMethod] = useState('usdt');
  const [formData, setFormData] = useState({
    amount: '',
    txHash: '',
    note: ''
  });
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Cüzdan adresleri (örnek)
  const walletAddresses = {
    usdt: 'TQrZ4srFZR5cSjYXRwMcFUHFxswhVQgQDr',
    btc: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    eth: '0x742d35Cc6634C0532925a3b8D489C13300f9D7D'
  };

  const depositMethods = [
    {
      id: 'usdt',
      name: 'USDT',
      network: 'TRC20',
      icon: 'ri-money-dollar-circle-line',
      color: 'green',
      address: walletAddresses.usdt,
      minAmount: 10,
      description: 'Tether USD - TRC-20 Ağı'
    },
    {
      id: 'btc',
      name: 'Bitcoin',
      network: 'BTC',
      icon: 'ri-bit-coin-line',
      color: 'orange',
      address: walletAddresses.btc,
      minAmount: 0.001,
      description: 'Bitcoin Ana Ağı'
    },
    {
      id: 'eth',
      name: 'Ethereum',
      network: 'ERC20',
      icon: 'ri-currency-line',
      color: 'blue',
      address: walletAddresses.eth,
      minAmount: 0.01,
      description: 'Ethereum Ana Ağı'
    }
  ];

  const selectedMethod = depositMethods.find(m => m.id === activeMethod);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    
    if (!amount || amount <= 0) {
      alert('Geçerli bir miktar girin');
      return;
    }
    
    if (amount < selectedMethod.minAmount) {
      alert(`Minimum yatırım tutarı ${selectedMethod.minAmount} ${selectedMethod.name.toUpperCase()}`);
      return;
    }
    
    if (!formData.txHash.trim()) {
      alert('İşlem hash (TXID) girin');
      return;
    }
    
    if (formData.txHash.trim().length < 10) {
      alert('Geçerli bir işlem hash girin');
      return;
    }

    setLoading(true);

    try {
      const currentBalance = getUserBalance();
      
      // Transaction ekle (pending durumunda)
      if (!Array.isArray(currentBalance.transactions)) {
        currentBalance.transactions = [];
      }
      
      const depositTransaction = {
        id: Date.now().toString(),
        type: 'deposit_pending',
        symbol: selectedMethod.name.toUpperCase(),
        amount: amount,
        description: `${selectedMethod.name} yatırım talebi`,
        date: new Date().toISOString(),
        status: 'pending',
        network: selectedMethod.network,
        txHash: formData.txHash.trim(),
        toAddress: selectedMethod.address,
        note: formData.note.trim(),
        pendingDeposit: true
      };
      
      currentBalance.transactions.unshift(depositTransaction);
      
      const saveSuccess = saveUserBalance(currentBalance);
      
      if (!saveSuccess) {
        throw new Error('İşlem kaydedilemedi');
      }
      
      // Admin için yatırım talebini kaydet
      const depositRequest = {
        id: 'DR' + Date.now().toString().slice(-6),
        userId: 'U' + Date.now().toString().slice(-3),
        userName: 'Kullanıcı',
        userEmail: currentBalance.email || 'user@example.com',
        coin: selectedMethod.name.toUpperCase(),
        amount: amount,
        network: selectedMethod.network,
        txHash: formData.txHash.trim(),
        toAddress: selectedMethod.address,
        requestDate: new Date().toLocaleDateString('tr-TR'),
        requestTime: new Date().toLocaleTimeString('tr-TR'),
        status: 'pending',
        note: formData.note.trim(),
        createdAt: new Date().toISOString(),
        transactionId: depositTransaction.id
      };

      // Mevcut bekleyen yatırımları al ve yeni talebi ekle
      const existingDeposits = JSON.parse(storage.getItem('pendingDeposits') || '[]');
      existingDeposits.push(depositRequest);
      writeJSON('pendingDeposits', existingDeposits);

      console.log('✅ Yatırım talebi başarıyla oluşturuldu:', depositRequest);
      
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        setFormData({ amount: '', txHash: '', note: '' });
        onSuccess?.();
      }, 4000);
      
    } catch (error) {
      console.error('❌ Yatırım talebi oluşturma hatası:', error);
      alert('Yatırım talebi oluşturulurken hata oluştu. Lütfen tekrar deneyin.');
    }

    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    alert('Adres kopyalandı!');
  };

  if (showSuccess) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="ri-check-line text-3xl text-green-600"></i>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Yatırım Talebiniz Alındı!</h3>
        <p className="text-gray-600 mb-4">
          {formData.amount} {selectedMethod.name.toUpperCase()} yatırım talebiniz admin onayına gönderildi.
        </p>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-700">
            İşlem hash: <span className="font-mono text-xs">{formData.txHash}</span>
          </p>
          <p className="text-sm text-blue-700 mt-2">
            Onay sonrası bakiyenize eklenecektir. Genellikle 1-6 saat içinde tamamlanır.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <i className="ri-add-circle-line text-blue-600 text-xl"></i>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Para Yatır</h2>
          <p className="text-sm text-gray-600">Hesabınıza cryptocurrency yatırın</p>
        </div>
      </div>

      {/* Yöntem Seçimi */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Yatırım Yöntemi Seçin
        </label>
        <div className="grid grid-cols-1 gap-3">
          {depositMethods.map(method => (
            <button
              key={method.id}
              type="button"
              onClick={() => {
                setActiveMethod(method.id);
                setFormData({ amount: '', txHash: '', note: '' });
              }}
              className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                activeMethod === method.id
                  ? `border-${method.color}-500 bg-${method.color}-50`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 bg-${method.color}-100 rounded-full flex items-center justify-center`}>
                  <i className={`${method.icon} text-${method.color}-600 text-lg`}></i>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-800">{method.name}</div>
                  <div className="text-sm text-gray-600">{method.description}</div>
                  <div className="text-xs text-gray-500">Min: {method.minAmount} {method.name.toUpperCase()}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Cüzdan Adresi */}
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Yatırım Adresi ({selectedMethod.network})</span>
            <button
              type="button"
              onClick={() => copyAddress(selectedMethod.address)}
              className="text-blue-600 hover:text-blue-700 text-sm cursor-pointer"
            >
              Kopyala
            </button>
          </div>
          <div className="bg-white p-3 rounded border font-mono text-sm break-all">
            {selectedMethod.address}
          </div>
        </div>

        {/* Miktar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Yatırılacak Miktar ({selectedMethod.name.toUpperCase()}) *
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            min={selectedMethod.minAmount}
            step="0.000001"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={`Min: ${selectedMethod.minAmount} ${selectedMethod.name.toUpperCase()}`}
          />
        </div>

        {/* İşlem Hash */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            İşlem Hash (TXID) *
          </label>
          <input
            type="text"
            name="txHash"
            value={formData.txHash}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            placeholder="İşlem hash'ini buraya yapıştırın"
          />
          <div className="text-xs text-gray-500 mt-1">
            Blockchain explorer'dan aldığınız transaction ID'yi girin
          </div>
        </div>

        {/* Not */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Not (Opsiyonel)
          </label>
          <textarea
            name="note"
            value={formData.note}
            onChange={handleChange}
            maxLength={200}
            rows={2}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Yatırım ile ilgili notunuz..."
          />
          <div className="text-xs text-gray-500 mt-1">
            {formData.note.length}/200 karakter
          </div>
        </div>

        {/* Uyarılar */}
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <div className="flex items-start space-x-2">
            <i className="ri-alert-line text-yellow-600 mt-0.5"></i>
            <div>
              <div className="text-sm font-semibold text-yellow-800 mb-2">Önemli Uyarılar</div>
              <ul className="text-xs text-yellow-700 space-y-1">
                <li>• Sadece {selectedMethod.network} ağını kullanın</li>
                <li>• Yanlış ağ kullanımı para kaybına neden olur</li>
                <li>• Minimum {selectedMethod.minAmount} {selectedMethod.name.toUpperCase()} yatırım yapabilirsiniz</li>
                <li>• İşlem hash'ini doğru girdiğinizden emin olun</li>
                <li>• Admin onayı sonrası bakiyenize eklenecektir</li>
                <li>• Onay süreci 1-6 saat arasında değişebilir</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Gönder Butonu */}
        <button
          type="submit"
          disabled={loading || !formData.amount || !formData.txHash}
          className={`w-full py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
            !loading && formData.amount && formData.txHash
              ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
              : 'bg-gray-400 cursor-not-allowed text-white'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Talep Gönderiliyor...</span>
            </div>
          ) : (
            <>
              <i className="ri-send-plane-line mr-2"></i>
              Yatırım Talebini Gönder
            </>
          )}
        </button>
      </form>
    </div>
  );
}