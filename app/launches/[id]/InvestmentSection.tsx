
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../contexts/LanguageContext';
import { buyCoin, getCurrentUserEmail, getUserBalance } from '../../../lib/storage-helpers';

interface InvestmentSectionProps {
  launch: any;
}

export default function InvestmentSection({ launch }: InvestmentSectionProps) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { t } = useLanguage();
  const router = useRouter();

  const handleInvestmentClick = () => {
    const userEmail = getCurrentUserEmail();
    if (!userEmail) {
      alert('Lütfen giriş yapın');
      router.push('/login');
      return;
    }
    setShowModal(true);
  };

  const handlePurchase = async () => {
    if (!amount || Number(amount) <= 0) {
      alert('Geçerli bir tutar girin');
      return;
    }
    
    setLoading(true);
    
    try {
      const usdAmount = Number(amount);
      const success = buyCoin(launch, usdAmount);
      
      if (success) {
        alert(`✅ BAŞARILI! ${launch.name} token'i satın alındı!`);
        setShowModal(false);
        setAmount('');
        
        // React router ile güvenli yönlendirme
        setTimeout(() => {
          router.push('/launches');
        }, 1500);
      } else {
        alert('Satın alma işlemi başarısız');
      }
    } catch (error) {
      console.error('Investment error:', error);
      alert('Yatırım işlemi başarısız');
    } finally {
      setLoading(false);
    }
  };

  // Kullanıcı USDT bakiyesini al
  const userBalance = getUserBalance();
  const usdtBalance = Number(userBalance.coins?.USDT) || 0;

  // Token miktarı hesapla
  const calculateTokens = () => {
    if (!amount || !launch?.price) return '0';
    const priceStr = String(launch.price).replace('$', '').replace(',', '').trim();
    const pricePerToken = Number(priceStr);
    if (pricePerToken <= 0) return '0';
    return (Number(amount) / pricePerToken).toFixed(6);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
        <h3 className="text-xl font-bold mb-4">Yatırım Yap</h3>
        
        {/* Launch Bilgi Doğrulama */}
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-xs">
          <div className="font-semibold text-green-800 mb-1">✅ LAUNCH BİLGİLERİ:</div>
          <div><strong>İsim:</strong> {launch?.name || 'Yükleniyor...'}</div>
          <div><strong>Sembol:</strong> {launch?.symbol || 'Yükleniyor...'}</div>
          <div><strong>Fiyat:</strong> {launch?.price || 'Yükleniyor...'}</div>
        </div>

        {/* Bakiye Bilgisi */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <div className="text-sm text-blue-800">
            <strong>Cüzdan Bakiyeniz:</strong> {usdtBalance.toFixed(2)} USDT
          </div>
        </div>
        
        <button
          onClick={handleInvestmentClick}
          disabled={!launch?.symbol || !launch?.name}
          className={`w-full py-3 px-4 rounded-md font-medium whitespace-nowrap cursor-pointer transition-colors ${
            (!launch?.symbol || !launch?.name)
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {(!launch?.symbol || !launch?.name) ? (
            'Launch Verisi Yükleniyor...'
          ) : (
            'Satın Al'
          )}
        </button>
      </div>

      {/* Satın Alma Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Token Satın Al</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              {/* Launch Bilgileri */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="font-semibold text-gray-800">{launch?.name}</div>
                <div className="text-sm text-gray-600">{launch?.symbol}</div>
                <div className="text-lg font-bold text-blue-600">{launch?.price}</div>
              </div>

              {/* Cüzdan Bakiyesi */}
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <i className="ri-wallet-3-line text-green-600"></i>
                  <div>
                    <div className="text-sm text-green-700">Cüzdan Bakiyesi</div>
                    <div className="font-bold text-green-800">{usdtBalance.toFixed(2)} USDT</div>
                  </div>
                </div>
              </div>

              {/* Tutar Girişi */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yatırım Tutarı (USD)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  max={usdtBalance}
                />
                {amount && Number(amount) > usdtBalance && (
                  <div className="text-red-600 text-xs mt-1">
                    Yetersiz bakiye! Maksimum: {usdtBalance.toFixed(2)} USDT
                  </div>
                )}
              </div>

              {/* Hızlı Tutar Seçimi */}
              <div className="mb-4">
                <div className="grid grid-cols-4 gap-2">
                  {['10', '50', '100', 'MAX'].map((quickAmount) => (
                    <button
                      key={quickAmount}
                      type="button"
                      onClick={() => setAmount(quickAmount === 'MAX' ? usdtBalance.toString() : quickAmount)}
                      className="py-2 px-3 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                      disabled={quickAmount !== 'MAX' && Number(quickAmount) > usdtBalance}
                    >
                      {quickAmount === 'MAX' ? 'TÜMÜ' : `$${quickAmount}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Token Hesaplaması */}
              {amount && launch?.symbol && launch?.price && (
                <div className="bg-gray-50 p-3 rounded-md mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Alacağınız Token:</span>
                    <span className="font-medium">
                      {calculateTokens()} {launch?.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Token Fiyatı:</span>
                    <span className="font-medium">{launch?.price}</span>
                  </div>
                </div>
              )}

              {/* Satın Al Butonu */}
              <button
                onClick={handlePurchase}
                disabled={loading || !amount || Number(amount) <= 0 || Number(amount) > usdtBalance}
                className={`w-full py-3 px-4 rounded-md font-medium whitespace-nowrap cursor-pointer transition-colors ${
                  loading 
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : (!amount || Number(amount) <= 0 || Number(amount) > usdtBalance)
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Satın Alınıyor...</span>
                  </div>
                ) : (
                  'Satın Al'
                )}
              </button>

              {usdtBalance === 0 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-sm text-yellow-800">
                    <i className="ri-information-line mr-1"></i>
                    Cüzdan bakiyeniz 0. Önce para yatırmanız gerekiyor.
                  </div>
                  <button
                    onClick={() => location.href = '/deposit'}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    Para Yatır →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
