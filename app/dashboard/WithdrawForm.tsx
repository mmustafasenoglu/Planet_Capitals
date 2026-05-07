
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserBalance, getCurrentUserEmail, saveUserBalance, addTransaction } from '../../lib/storage-helpers';

interface WithdrawFormProps {
  onSuccess?: () => void;
}

export default function WithdrawForm({ onSuccess }: WithdrawFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    amount: '',
    walletAddress: '',
    note: ''
  });
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [availableBalance, setAvailableBalance] = useState(0);
  
  // Akordiyon adımları için state
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const loadUserBalance = () => {
    try {
      const userBalance = getUserBalance();
      const usdtBalance = Number(userBalance.coins?.USDT || 0);
      setAvailableBalance(usdtBalance);
    } catch (error) {
      console.error('Bakiye yükleme hatası:', error);
      setAvailableBalance(0);
    }
  };

  useEffect(() => {
    loadUserBalance();
    const interval = setInterval(loadUserBalance, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    
    if (!amount || amount <= 0) {
      alert('Geçerli bir miktar girin');
      return;
    }
    
    if (amount < 10) {
      alert('Minimum çekim tutarı 10 USDT');
      return;
    }
    
    if (amount > availableBalance) {
      alert(`Yetersiz bakiye!\nMevcut: ${availableBalance.toFixed(2)} USDT\nTalep: ${amount.toFixed(2)} USDT`);
      return;
    }
    
    if (!formData.walletAddress.trim()) {
      alert('USDT cüzdan adresini girin');
      return;
    }
    
    const address = formData.walletAddress.trim();
    if (!address.startsWith('T') || address.length !== 34) {
      alert('Geçerli bir TRC20 USDT adresi girin!\n(T ile başlamalı, 34 karakter uzunluğunda)');
      return;
    }

    setLoading(true);

    try {
      const userEmail = getCurrentUserEmail();
      if (!userEmail) {
        alert('Kullanıcı oturumu bulunamadı');
        setLoading(false);
        return;
      }
      
      const currentBalance = getUserBalance();
      
      currentBalance.coins.USDT = Math.max(0, (currentBalance.coins.USDT || 0) - amount);
      
      if (!Array.isArray(currentBalance.transactions)) {
        currentBalance.transactions = [];
      }
      
      const withdrawTransaction = {
        id: Date.now().toString(),
        type: 'withdrawal_pending',
        symbol: 'USDT',
        amount: amount,
        description: `Çekim talebi (${address.substring(0, 10)}...)`,
        date: new Date().toISOString(),
        status: 'pending',
        walletAddress: address,
        note: formData.note.trim(),
        pendingWithdrawal: true
      };
      
      currentBalance.transactions.unshift(withdrawTransaction);
      
      const saveSuccess = saveUserBalance(currentBalance);
      
      if (!saveSuccess) {
        throw new Error('Bakiye güncellenemedi');
      }
      
      const withdrawalRequest = {
        id: 'WR' + Date.now().toString().slice(-6),
        userId: 'U' + Date.now().toString().slice(-3),
        userName: 'Kullanıcı',
        userEmail: userEmail,
        coin: 'USDT',
        amount: amount,
        network: 'TRC20',
        walletAddress: address,
        requestDate: new Date().toLocaleDateString('tr-TR'),
        requestTime: new Date().toLocaleTimeString('tr-TR'),
        status: 'pending',
        note: formData.note.trim(),
        createdAt: new Date().toISOString(),
        transactionId: withdrawTransaction.id
      };

      const existingWithdrawals = JSON.parse(localStorage.getItem('pendingWithdrawals') || '[]');
      existingWithdrawals.push(withdrawalRequest);
      localStorage.setItem('pendingWithdrawals', JSON.stringify(existingWithdrawals));
      
      setShowSuccess(true);
      
      // 3 saniye sonra dashboard'a yönlendir
      setTimeout(() => {
        setShowSuccess(false);
        setFormData({ amount: '', walletAddress: '', note: '' });
        setCurrentStep(1);
        setCompletedSteps([]);
        
        // onSuccess callback varsa çağır, yoksa doğrudan dashboard'a git
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/dashboard');
        }
      }, 3000);
      
    } catch (error) {
      console.error('Çekim talebi oluşturma hatası:', error);
      alert('Çekim talebi oluşturulurken hata oluştu. Lütfen tekrar deneyin.');
    }

    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Adım geçiş fonksiyonları
  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const completeStep = (step: number) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step]);
    }
    setCurrentStep(step + 1);
  };

  // Adım validasyonları
  const isStep1Valid = () => {
    const amount = parseFloat(formData.amount);
    return amount >= 10 && amount <= availableBalance;
  };

  const isStep2Valid = () => {
    const address = formData.walletAddress.trim();
    return address.startsWith('T') && address.length === 34;
  };

  // Final buton görünürlük kontrolü
  const canShowFinalButton = () => {
    return completedSteps.includes(1) && completedSteps.includes(2) && completedSteps.includes(3);
  };

  if (showSuccess) {
    return (
      <div className="bg-white rounded-xl p-3 md:p-4 text-center border border-gray-200 w-full max-w-md mx-auto">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
          <i className="ri-check-line text-xl md:text-2xl text-green-600"></i>
        </div>
        <h3 className="text-base md:text-lg font-bold text-gray-800 mb-2">Çekim Talebiniz Alındı!</h3>
        <p className="text-sm md:text-sm text-gray-600 mb-2 md:mb-3">
          {formData.amount} USDT çekim talebiniz admin onayına gönderildi.
        </p>
        <div className="bg-blue-50 p-2 md:p-3 rounded-lg mb-3">
          <p className="text-xs text-blue-700">
            Tutar bakiyenizden düşürüldü ve onay bekliyor. İşlem genellikle 2-24 saat içinde tamamlanır.
          </p>
        </div>
        <div className="bg-gray-50 p-2 rounded-lg">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <i className="ri-time-line"></i>
            <span>3 saniye sonra hesabınıza döneceksiniz...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white w-full h-screen md:h-auto max-h-screen md:max-h-[600px] md:rounded-xl md:shadow-lg md:max-w-2xl md:mx-auto border-0 md:border md:border-gray-200 flex flex-col">
      
      {/* Modal Header - Mobil için daha kompakt */}
      <div className="p-3 md:p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-2 md:space-x-3">
          <div className="w-8 h-8 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center">
            <i className="ri-money-dollar-box-line text-green-600 text-base md:text-xl"></i>
          </div>
          <div>
            <h2 className="text-base md:text-xl font-bold text-gray-800">USDT Çekim İşlemi</h2>
            <p className="text-xs md:text-sm text-gray-600">Adım adım güvenli çekim</p>
          </div>
        </div>
      </div>

      {/* Modal Content - Scrollable Area - Mobil için padding azaltıldı ve bottom tab bar için alan bırakıldı */}
      <div className="flex-1 overflow-y-auto min-h-0 pb-safe">
        <div className="p-3 md:p-4 space-y-3 md:space-y-4 pb-32 md:pb-4">
          
          {/* Bakiye Bilgisi - Mobil için daha küçük */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 p-3 md:p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs md:text-sm text-blue-700 font-medium">Kullanılabilir Bakiye</span>
                <div className="text-lg md:text-2xl font-bold text-blue-900 mt-1">
                  {availableBalance.toFixed(2)} USDT
                </div>
              </div>
              <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-200 rounded-full flex items-center justify-center">
                <i className="ri-wallet-line text-blue-600 text-lg md:text-2xl"></i>
              </div>
            </div>
          </div>

          {/* ADIM 1 - Tutar Girişi - Mobil için kompakt */}
          <div className="border border-gray-200 rounded-lg">
            <button
              type="button"
              onClick={() => goToStep(1)}
              className="w-full p-3 md:p-4 text-left flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-t-lg"
            >
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold ${
                  completedSteps.includes(1) 
                    ? 'bg-green-100 text-green-600' 
                    : currentStep === 1 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-200 text-gray-500'
                }`}>
                  {completedSteps.includes(1) ? <i className="ri-check-line text-xs md:text-sm"></i> : '1'}
                </div>
                <span className="text-sm md:text-base font-medium">Çekim Miktarı</span>
              </div>
              <i className={`ri-arrow-${currentStep === 1 ? 'up' : 'down'}-s-line text-gray-400`}></i>
            </button>
            
            {currentStep === 1 && (
              <div className="p-3 md:p-4 border-t border-gray-200">
                <div className="space-y-3 md:space-y-4">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                      Çekilecek Miktar (USDT) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        required
                        min="10"
                        max={availableBalance}
                        step="0.01"
                        className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent pr-12 md:pr-16 text-sm md:text-lg font-medium"
                        placeholder="Minimum 10 USDT"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, amount: availableBalance.toString() }))}
                        className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 bg-green-100 text-green-700 hover:bg-green-200 px-2 py-1 rounded text-xs font-medium cursor-pointer whitespace-nowrap"
                      >
                        Tümü
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 md:mt-2 flex justify-between">
                      <span>Minimum: 10 USDT</span>
                      <span>Maksimum: {availableBalance.toFixed(2)} USDT</span>
                    </div>
                  </div>

                  {/* Hızlı Tutar Seçimi - Mobil için daha küçük */}
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                      Hızlı Seçim
                    </label>
                    <div className="grid grid-cols-4 gap-2 md:gap-3">
                      {[50, 100, 500, 1000].map(quickAmount => (
                        <button
                          key={quickAmount}
                          type="button" 
                          onClick={() => setFormData(prev => ({ ...prev, amount: Math.min(quickAmount, availableBalance).toString() }))}
                          disabled={quickAmount > availableBalance}
                          className={`py-1.5 md:py-2 px-2 md:px-3 text-xs md:text-sm rounded-lg border cursor-pointer whitespace-nowrap transition-all ${
                            quickAmount <= availableBalance
                              ? 'border-green-300 text-green-700 hover:bg-green-50'
                              : 'border-gray-300 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          ${quickAmount}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hata mesajları */}
                  {formData.amount && !isStep1Valid() && (
                    <div className="bg-red-50 border border-red-200 p-2 md:p-3 rounded-lg text-center">
                      <i className="ri-error-warning-line text-red-600 mr-2"></i>
                      <span className="text-red-700 text-xs md:text-sm">
                        {parseFloat(formData.amount) < 10 ? 'Minimum çekim tutarı 10 USDT' : 'Yetersiz bakiye'}
                      </span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => completeStep(1)}
                    disabled={!isStep1Valid()}
                    className={`w-full py-2 md:py-3 rounded-lg font-semibold transition-all whitespace-nowrap text-sm md:text-base ${
                      isStep1Valid()
                        ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                        : 'bg-gray-400 cursor-not-allowed text-white'
                    }`}
                  >
                    <i className="ri-arrow-right-line mr-2"></i>
                    Devam Et
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ADIM 2 - Cüzdan Adresi - Mobil için kompakt */}
          {completedSteps.includes(1) && (
            <div className="border border-gray-200 rounded-lg">
              <button
                type="button"
                onClick={() => goToStep(2)}
                className="w-full p-3 md:p-4 text-left flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-t-lg"
              >
                <div className="flex items-center space-x-2 md:space-x-3">
                  <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold ${
                    completedSteps.includes(2) 
                      ? 'bg-green-100 text-green-600' 
                      : currentStep === 2 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-200 text-gray-500'
                  }`}>
                    {completedSteps.includes(2) ? <i className="ri-check-line text-xs md:text-sm"></i> : '2'}
                  </div>
                  <span className="text-sm md:text-base font-medium">Cüzdan Adresi</span>
                </div>
                <i className={`ri-arrow-${currentStep === 2 ? 'up' : 'down'}-s-line text-gray-400`}></i>
              </button>
              
              {currentStep === 2 && (
                <div className="p-3 md:p-4 border-t border-gray-200">
                  <div className="space-y-3 md:space-y-4">
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        USDT Cüzdan Adresi (TRC20) *
                      </label>
                      <input
                        type="text"
                        name="walletAddress"
                        value={formData.walletAddress}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-xs md:text-sm"
                        placeholder="TRC20 USDT adresinizi buraya yapıştırın"
                      />
                      <div className="text-xs text-gray-500 mt-1 md:mt-2">
                        <div className="flex items-center space-x-2">
                          <i className="ri-information-line text-blue-500"></i>
                          <span>T ile başlamalı ve tam 34 karakter uzunluğunda olmalı</span>
                        </div>
                      </div>
                    </div>

                    {/* Hata mesajları */}
                    {formData.walletAddress && !isStep2Valid() && (
                      <div className="bg-red-50 border border-red-200 p-2 md:p-3 rounded-lg text-center">
                        <i className="ri-error-warning-line text-red-600 mr-2"></i>
                        <span className="text-red-700 text-xs md:text-sm">
                          Geçersiz TRC20 cüzdan adresi
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => completeStep(2)}
                      disabled={!isStep2Valid()}
                      className={`w-full py-2 md:py-3 rounded-lg font-semibold transition-all whitespace-nowrap text-sm md:text-base ${
                        isStep2Valid()
                          ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                          : 'bg-gray-400 cursor-not-allowed text-white'
                      }`}
                    >
                      <i className="ri-arrow-right-line mr-2"></i>
                      Devam Et
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ADIM 3 - Not (Opsiyonel) - Mobil için kompakt */}
          {completedSteps.includes(2) && (
            <div className="border border-gray-200 rounded-lg">
              <button
                type="button"
                onClick={() => goToStep(3)}
                className="w-full p-3 md:p-4 text-left flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-t-lg"
              >
                <div className="flex items-center space-x-2 md:space-x-3">
                  <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold ${
                    completedSteps.includes(3) 
                      ? 'bg-green-100 text-green-600' 
                      : currentStep === 3 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-200 text-gray-500'
                  }`}>
                    {completedSteps.includes(3) ? <i className="ri-check-line text-xs md:text-sm"></i> : '3'}
                  </div>
                  <span className="text-sm md:text-base font-medium">Not Ekle (İsteğe Bağlı)</span>
                </div>
                <i className={`ri-arrow-${currentStep === 3 ? 'up' : 'down'}-s-line text-gray-400`}></i>
              </button>
              
              {currentStep === 3 && (
                <div className="p-3 md:p-4 border-t border-gray-200">
                  <div className="space-y-3 md:space-y-4">
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Not (İsteğe Bağlı)
                      </label>
                      <textarea
                        name="note"
                        value={formData.note}
                        onChange={handleChange}
                        maxLength={200}
                        rows={3}
                        className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-xs md:text-sm"
                        placeholder="Çekim işlemi ile ilgili notunuz..."
                      />
                      <div className="text-xs text-gray-500 mt-1 flex justify-between">
                        <span>İsteğe bağlı açıklama ekleyebilirsiniz</span>
                        <span>{formData.note.length}/200</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => completeStep(3)}
                      className="w-full py-2 md:py-3 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition-all whitespace-nowrap text-sm md:text-base"
                    >
                      <i className="ri-arrow-right-line mr-2"></i>
                      Devam Et
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ADIM 4 - Önemli Uyarılar - Mobil için kompakt */}
          {completedSteps.includes(3) && (
            <div className="border border-gray-200 rounded-lg">
              <button
                type="button"
                onClick={() => goToStep(4)}
                className="w-full p-3 md:p-4 text-left flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-t-lg"
              >
                <div className="flex items-center space-x-2 md:space-x-3">
                  <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold ${
                    currentStep === 4 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    4
                  </div>
                  <span className="text-sm md:text-base font-medium">Önemli Uyarılar</span>
                </div>
                <i className={`ri-arrow-${currentStep === 4 ? 'up' : 'down'}-s-line text-gray-400`}></i>
              </button>
              
              {currentStep === 4 && (
                <div className="p-3 md:p-4 border-t border-gray-200">
                  <div className="space-y-3 md:space-y-4">
                    {/* Önemli Uyarılar - Mobil için kompakt */}
                    <div className="bg-orange-50 border border-orange-200 p-3 md:p-4 rounded-lg">
                      <div className="flex items-start space-x-2 md:space-x-3">
                        <i className="ri-alert-line text-orange-600 mt-1 text-base md:text-xl"></i>
                        <div>
                          <div className="text-xs md:text-sm font-semibold text-orange-800 mb-1 md:mb-2">⚠️ Önemli Uyarılar</div>
                          <ul className="text-xs md:text-sm text-orange-700 space-y-1">
                            <li>• Sadece TRC20 ağını destekliyoruz (TRON blockchain)</li>
                            <li>• Cüzdan adresini mutlaka kontrol edin, yanlış adres para kaybına neden olur</li>
                            <li>• Çekim tutarı hemen bakiyenizden düşürülür</li>
                            <li>• Admin onayından sonra işlem blockchain'e gönderilir</li>
                            <li>• İşlem süresi: 1-3 saat (onay sonrası)</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* İşlem Özeti - Mobil için kompakt */}
                    <div className="bg-gray-50 border border-gray-200 p-3 md:p-4 rounded-lg">
                      <h4 className="text-sm md:text-base font-medium text-gray-800 mb-2 md:mb-3">İşlem Özeti</h4>
                      <div className="space-y-1 md:space-y-2 text-xs md:text-sm">
                        <div className="flex justify-between">
                          <span>Çekilecek Miktar:</span>
                          <span className="font-bold">{parseFloat(formData.amount).toFixed(2)} USDT</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Ağ:</span>
                          <span className="font-medium">TRC20 (TRON)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cüzdan Adresi:</span>
                          <span className="font-mono text-xs">{formData.walletAddress.substring(0, 10)}...{formData.walletAddress.substring(24)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>İşlem Süresi:</span>
                          <span>1-3 saat</span>
                        </div>
                        <div className="flex justify-between border-t pt-1 md:pt-2">
                          <span>Kalan Bakiye:</span>
                          <span className="font-bold">{(availableBalance - parseFloat(formData.amount)).toFixed(2)} USDT</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* FIXED BOTTOM BUTTON - Sabit alt buton - Mobil bottom tab bar uyumlu */}
      {canShowFinalButton() && (
        <div className="fixed md:absolute bottom-20 md:bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg md:rounded-b-xl p-3 md:p-4 z-40">
          <form onSubmit={handleSubmit}>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 md:py-4 rounded-lg font-semibold transition-all whitespace-nowrap text-sm md:text-lg ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white cursor-pointer shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2 md:space-x-3">
                  <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Çekim Talebi Gönderiliyor...</span>
                </div>
              ) : (
                <>
                  <i className="ri-send-plane-line mr-2 md:mr-3 text-base md:text-xl"></i>
                  Para Çek
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}