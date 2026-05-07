
'use client';

import { useState, useEffect } from 'react';
import { getStorageAdapter } from '@/lib/storage-adapter';

export default function WalletInfo() {
  const [showAddresses, setShowAddresses] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState('');
  const [walletAddresses, setWalletAddresses] = useState([
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      icon: '₿',
      color: 'orange'
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      address: '0x742d35Cc6634C0532925a3b8D4B9b4A3C7C6b5E2',
      icon: 'Ξ',
      color: 'blue'
    },
    {
      symbol: 'USDT',
      name: 'Tether',
      address: '0x742d35Cc6634C0532925a3b8D4B9b4A3C7C6b5E2',
      icon: '₮',
      color: 'green'
    },
    {
      symbol: 'BNB',
      name: 'BNB',
      address: 'bnb1a1zp1ep5qgefi2dmptftl5slmv7divfna',
      icon: 'BNB',
      color: 'yellow'
    },
    {
      symbol: 'ADA',
      name: 'Cardano',
      address: 'addr1qxy2lpan99fcnhhyqn4x',
      icon: 'ADA',
      color: 'indigo'
    },
    {
      symbol: 'DOT',
      name: 'Polkadot',
      address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      icon: 'DOT',
      color: 'pink'
    }
  ]);

  // Load addresses from localStorage on component mount
  useEffect(() => {
    const storage = getStorageAdapter();
    const savedAddresses = storage.getItem('adminWalletAddresses');
    if (savedAddresses) {
      const addresses = JSON.parse(savedAddresses);
      
      // Update walletAddresses with saved addresses
      setWalletAddresses(prev => 
        prev.map(wallet => ({
          ...wallet,
          address: addresses[wallet.symbol] || wallet.address
        }))
      );
    }
  }, []);

  const copyAddress = (address: string, symbol: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(symbol);
    setTimeout(() => setCopiedAddress(''), 2000);
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-800">Cüzdan Adreslerim</h3>
        <button
          onClick={() => setShowAddresses(!showAddresses)}
          className="text-blue-600 hover:text-blue-700 font-medium text-sm cursor-pointer whitespace-nowrap"
        >
          {showAddresses ? 'Gizle' : 'Adresleri Göster'}
        </button>
      </div>

      {showAddresses && (
        <div className="space-y-4">
          {walletAddresses.map((wallet) => (
            <div key={wallet.symbol} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-${wallet.color}-100`}>
                    <span className={`text-${wallet.color}-600 font-bold text-sm`}>
                      {wallet.icon}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{wallet.name}</div>
                    <div className="text-sm text-gray-500">{wallet.symbol}</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <code className="text-sm text-gray-700 font-mono">
                    {shortenAddress(wallet.address)}
                  </code>
                  <button
                    onClick={() => copyAddress(wallet.address, wallet.symbol)}
                    className="text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    {copiedAddress === wallet.symbol ? (
                      <i className="ri-check-line text-green-600"></i>
                    ) : (
                      <i className="ri-file-copy-line"></i>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <i className="ri-information-line text-blue-600"></i>
          <span className="text-sm font-semibold text-blue-800">Cüzdan Bilgileri</span>
        </div>
        <div className="text-xs text-blue-700 space-y-1">
          <p>• Bu adresler sadece belirtilen coinler için kullanılabilir</p>
          <p>• Yatırımlar 1-3 blok onayı sonrası hesabınızda görünür</p>
          <p>• Minimum yatırım limitlerine dikkat edin</p>
          <p>• Yanlış ağa gönderilen coinler geri alınamaz</p>
        </div>
      </div>

      <div className="mt-4 bg-green-50 p-4 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <i className="ri-shield-check-line text-green-600"></i>
          <span className="text-sm font-semibold text-green-800">Güvenlik</span>
        </div>
        <div className="text-xs text-green-700">
          Tüm cüzdan adresleri çoklu imza (multisig) ile güvence altındadır. 
          Fonlarınız cold storage'da saklanır.
        </div>
      </div>
    </div>
  );
}
