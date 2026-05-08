'use client';
import { storage } from '../../lib/storage-adapter';


import { useState, useEffect } from 'react';
import { getUserBalance } from '../../lib/storage-helpers';

type FilterType = 'all' | 'completed' | 'pending' | 'deposits' | 'withdrawals' | 'purchases';

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [expandedTransactions, setExpandedTransactions] = useState<Set<string>>(new Set());

  const toggleTransactionExpansion = (transactionId: string) => {
    const newExpanded = new Set(expandedTransactions);
    if (newExpanded.has(transactionId)) {
      newExpanded.delete(transactionId);
    } else {
      newExpanded.add(transactionId);
    }
    setExpandedTransactions(newExpanded);
  };

  const loadTransactions = () => {
    try {
      const balance = getUserBalance();
      const allTransactions = balance.transactions || [];
      
      // ✅ DÜZELTME: ADMIN ONAYLANMIŞ ÇEKİMLERİ KONTROL ET
      const adminWithdrawals = JSON.parse(storage.getItem('withdrawalHistory') || '[]');
      const adminProcessedIds = adminWithdrawals
        .filter((w: any) => w.status === 'approved' || w.status === 'rejected')
        .map((w: any) => w.transactionId)
        .filter(Boolean);

      // ✅ DÜZELTME: TRANSACTION'LARI FİLTRELE VE GÜNCELLE
      const processedTransactions = allTransactions.map((transaction: any) => {
        // Eğer bu transaction admin tarafından işlenmişse
        if (transaction.type === 'withdrawal_pending' && adminProcessedIds.includes(transaction.id)) {
          const adminWithdrawal = adminWithdrawals.find((w: any) => w.transactionId === transaction.id);
          
          if (adminWithdrawal?.status === 'rejected') {
            // ✅ REDDEDİLEN ÇEKİM OLARAK GÖSTER
            return {
              ...transaction,
              type: 'withdrawal_rejected',
              status: 'rejected',
              description: `Çekim talebi reddedildi - bakiye iade edildi`,
              rejectedAt: adminWithdrawal.rejectedAt,
              rejectedBy: 'admin',
              pendingWithdrawal: false,
              rejectedWithdrawal: true
            };
          } else if (adminWithdrawal?.status === 'approved') {
            // ✅ ONAYLANMIŞ ÇEKİM OLARAK GÖSTER
            return {
              ...transaction,
              type: 'withdrawal_completed',
              status: 'completed',
              description: `Çekim tamamlandı`,
              approvedAt: adminWithdrawal.approvedAt,
              approvedBy: 'admin',
              pendingWithdrawal: false,
              completedWithdrawal: true,
              isInformationOnly: true
            };
          }
        }
        
        return transaction;
      });
      
      const sortedTransactions = processedTransactions.sort((a: any, b: any) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      setTransactions(sortedTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
    const interval = setInterval(loadTransactions, 1000); // Daha sık kontrol et
    return () => clearInterval(interval);
  }, []);

  const getFilteredTransactions = () => {
    switch (activeFilter) {
      case 'completed':
        return transactions.filter(t => 
          t.status === 'completed' || 
          t.status === 'approved' || 
          t.type?.includes('admin_') ||
          t.type === 'withdrawal_completed'
        );
      case 'pending':
        return transactions.filter(t => {
          // ✅ DÜZELTME: SADECE GERÇEKTENç BEKLEYEN İŞLEMLERİ GÖSTER
          if (t.type === 'withdrawal_pending') {
            // Admin tarafından işlenmiş mi kontrol et
            const adminWithdrawals = JSON.parse(storage.getItem('withdrawalHistory') || '[]');
            const isProcessed = adminWithdrawals.some((w: any) => 
              w.transactionId === t.id && (w.status === 'approved' || w.status === 'rejected')
            );
            return !isProcessed && t.status === 'pending';
          }
          return t.status === 'pending';
        });
      case 'deposits':
        return transactions.filter(t => 
          t.type?.includes('deposit') || 
          t.type?.includes('admin_deposit')
        );
      case 'withdrawals':
        return transactions.filter(t => 
          t.type?.includes('withdrawal')
        );
      case 'purchases':
        return transactions.filter(t => 
          t.type?.includes('purchase') || 
          t.type?.includes('buy')
        );
      default:
        return transactions;
    }
  };

  const filteredTransactions = getFilteredTransactions();

  const getTransactionIcon = (transaction: any) => {
    if (transaction.type?.includes('withdrawal')) {
      if (transaction.type === 'withdrawal_pending') {
        return { icon: 'ri-time-line', color: 'text-yellow-600', bg: 'bg-yellow-100' };
      } else if (transaction.type === 'withdrawal_completed') {
        return { icon: 'ri-check-circle-line', color: 'text-green-600', bg: 'bg-green-100' };
      } else if (transaction.type === 'withdrawal_rejected') {
        // ✅ YENİ: REDDEDİLEN ÇEKİM İKONU
        return { icon: 'ri-close-circle-line', color: 'text-red-600', bg: 'bg-red-100' };
      } else {
        return { icon: 'ri-subtract-line', color: 'text-red-600', bg: 'bg-red-100' };
      }
    } else if (transaction.type?.includes('deposit') || transaction.type?.includes('admin_deposit')) {
      return { icon: 'ri-add-circle-line', color: 'text-green-600', bg: 'bg-green-100' };
    } else if (transaction.type?.includes('purchase') || transaction.type?.includes('buy')) {
      return { icon: 'ri-shopping-cart-line', color: 'text-blue-600', bg: 'bg-blue-100' };
    } else {
      return { icon: 'ri-exchange-line', color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  const getTransactionStatus = (transaction: any) => {
    if (transaction.type === 'withdrawal_pending') {
      // ✅ DÜZELTME: ADMIN İŞLEDİ Mİ KONTROL ET
      const adminWithdrawals = JSON.parse(storage.getItem('withdrawalHistory') || '[]');
      const isProcessed = adminWithdrawals.some((w: any) => 
        w.transactionId === transaction.id && (w.status === 'approved' || w.status === 'rejected')
      );
      
      if (isProcessed) {
        return { text: '🔄 İşleniyor...', color: 'text-blue-600 bg-blue-100' };
      }
      return { text: '⏳ Bekliyor', color: 'text-yellow-600 bg-yellow-100' };
    } else if (transaction.type === 'withdrawal_completed') {
      return { text: '✅ Tamamlandı', color: 'text-green-600 bg-green-100' };
    } else if (transaction.type === 'withdrawal_rejected') {
      // ✅ YENİ: REDDEDİLEN ÇEKİM DURUMU
      return { text: '❌ Reddedildi', color: 'text-red-600 bg-red-100' };
    } else if (transaction.status === 'pending') {
      return { text: '⏳ Bekliyor', color: 'text-yellow-600 bg-yellow-100' };
    } else if (transaction.status === 'approved' || transaction.status === 'completed') {
      return { text: '✅ Tamamlandı', color: 'text-green-600 bg-green-100' };
    } else if (transaction.status === 'rejected') {
      return { text: '❌ Reddedildi', color: 'text-red-600 bg-red-100' };
    } else {
      return { text: '✅ Tamamlandı', color: 'text-green-600 bg-green-100' };
    }
  };

  const formatAmount = (transaction: any) => {
    const amount = Number(transaction.amount) || 0;
    const symbol = transaction.symbol || 'USD';
    
    if (transaction.type?.includes('withdrawal')) {
      if (transaction.type === 'withdrawal_completed') {
        return `ℹ️ ${amount.toFixed(2)} ${symbol}`;
      } else if (transaction.type === 'withdrawal_rejected') {
        // ✅ YENİ: REDDEDİLEN ÇEKİM TUTARI (İADE EDİLDİ)
        return `+${amount.toFixed(2)} ${symbol}`;
      } else {
        return `-${amount.toFixed(2)} ${symbol}`;
      }
    } else if (transaction.type?.includes('deposit') || transaction.type?.includes('admin_deposit')) {
      return `+${amount.toFixed(2)} ${symbol}`;
    } else {
      return `${amount.toFixed(2)} ${symbol}`;
    }
  };

  const getAmountColor = (transaction: any) => {
    if (transaction.type === 'withdrawal_completed') {
      return 'text-blue-600';
    } else if (transaction.type === 'withdrawal_rejected') {
      // ✅ YENİ: REDDEDİLEN ÇEKİM RENK (YEŞİL - İADE EDİLDİ)
      return 'text-green-600';
    } else if (transaction.type?.includes('withdrawal')) {
      return 'text-red-600';
    } else if (transaction.type?.includes('deposit') || transaction.type?.includes('admin_deposit')) {
      return 'text-green-600';
    } else {
      return 'text-gray-600';
    }
  };

  const getTransactionBackground = (transaction: any) => {
    if (transaction.type === 'withdrawal_completed') {
      return 'bg-blue-50 border-blue-200';
    } else if (transaction.type === 'withdrawal_rejected') {
      // ✅ YENİ: REDDEDİLEN ÇEKİM ARKAPLAN
      return 'bg-red-50 border-red-200';
    } else {
      return 'bg-gray-50';
    }
  };

  const getTransactionDescription = (transaction: any) => {
    if (transaction.type === 'withdrawal_completed') {
      return `${transaction.description || 'Çekim tamamlandı'} (${transaction.walletAddress?.substring(0, 10) || 'T7z5Tf9jj1'}...)`;
    } else if (transaction.type === 'withdrawal_rejected') {
      // ✅ YENİ: REDDEDİLEN ÇEKİM AÇIKLAMASI
      return `Çekim talebi reddedildi - bakiye iade edildi (${transaction.walletAddress?.substring(0, 10) || 'T7z5Tf9jj1'}...)`;
    } else if (transaction.type === 'withdrawal_pending') {
      return `${transaction.description || 'Çekim talebi'} (${transaction.walletAddress?.substring(0, 10) || 'T7z5Tf9jj1'}...)`;
    } else {
      return transaction.description || transaction.type;
    }
  };

  const getTransactionTitle = (transaction: any) => {
    if (transaction.type === 'withdrawal_completed') {
      return 'Çekim Tamamlandı ✅';
    } else if (transaction.type === 'withdrawal_rejected') {
      // ✅ YENİ: REDDEDİLEN ÇEKİM BAŞLIĞI
      return 'Çekim Reddedildi ❌';
    } else if (transaction.type === 'withdrawal_pending') {
      return 'Çekim Onay Bekliyor ⏳';
    } else if (transaction.type?.includes('withdrawal')) {
      return 'Para Çekme';
    } else if (transaction.type?.includes('deposit') || transaction.type?.includes('admin_deposit')) {
      return 'Para Yatırma';
    } else if (transaction.type?.includes('purchase') || transaction.type?.includes('buy')) {
      return 'Coin Alımı';
    } else {
      return 'İşlem';
    }
  };

  const getCounts = () => {
    const total = transactions.length;
    const completed = transactions.filter(t => 
      t.status === 'completed' || 
      t.status === 'approved' || 
      t.type?.includes('admin_') ||
      t.type === 'withdrawal_completed'
    ).length;
    
    // ✅ DÜZELTME: PENDING SAYIMI
    const pending = transactions.filter(t => {
      if (t.type === 'withdrawal_pending') {
        const adminWithdrawals = JSON.parse(storage.getItem('withdrawalHistory') || '[]');
        const isProcessed = adminWithdrawals.some((w: any) => 
          w.transactionId === t.id && (w.status === 'approved' || w.status === 'rejected')
        );
        return !isProcessed && t.status === 'pending';
      }
      return t.status === 'pending';
    }).length;
    
    const rejected = transactions.filter(t => 
      t.status === 'rejected' || t.type === 'withdrawal_rejected'
    ).length;

    return { total, completed, pending, rejected };
  };

  const counts = getCounts();

  const filters = [
    { key: 'all' as FilterType, label: 'Tümü', icon: 'ri-list-check', shortLabel: 'Tümü' },
    { key: 'completed' as FilterType, label: 'Tamamlanan', icon: 'ri-check-circle-line', shortLabel: 'Tamam' },
    { key: 'pending' as FilterType, label: 'Bekleyen', icon: 'ri-time-line', shortLabel: 'Bekle' },
    { key: 'deposits' as FilterType, label: 'Yatırımlar', icon: 'ri-add-circle-line', shortLabel: 'Yatır' },
    { key: 'withdrawals' as FilterType, label: 'Çekimler', icon: 'ri-subtract-line', shortLabel: 'Çek' },
    { key: 'purchases' as FilterType, label: 'Alımlar', icon: 'ri-shopping-cart-line', shortLabel: 'Alım' }
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="loading-mobile flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <i className="ri-history-line text-purple-600 text-xl"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">İşlem Geçmişi</h2>
            <p className="text-sm text-gray-600">Tüm işlemlerinizi görüntüleyin</p>
          </div>
        </div>
        <div className="text-sm text-gray-600">{counts.total} işlem</div>
      </div>

      {/* Filters - MOBİL 3'LÜ GRİD, MASAÜSTÜ 6'LI */}
      <div className="mb-6">
        <div className="filter-grid-mobile grid grid-cols-3 md:grid-cols-6 gap-2">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`filter-btn-mobile p-2 rounded-lg font-medium transition-all cursor-pointer text-center ${
                activeFilter === filter.key
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="w-6 h-6 mx-auto mb-1 flex items-center justify-center">
                <i className={`${filter.icon} text-lg`}></i>
              </div>
              <div className="text-xs leading-tight">{filter.shortLabel}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List - SABİT YÜKSEKLİK SCROLL */}
      <div className="scroll-area-mobile h-96 overflow-y-auto mb-6">
        {filteredTransactions.length === 0 ? (
          <div className="empty-state-mobile flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <i className="ri-history-line text-4xl mb-3"></i>
              <p className="text-lg font-medium mb-1">Henüz işlem yok</p>
              <p className="text-sm">İşlemleriniz burada görünecek</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction, index) => {
              const iconInfo = getTransactionIcon(transaction);
              const statusInfo = getTransactionStatus(transaction);
              const transactionId = transaction.id || `${index}`;
              const isExpanded = expandedTransactions.has(transactionId);
              
              return (
                <div
                  key={transactionId}
                  className={`border border-gray-200 rounded-xl overflow-hidden ${getTransactionBackground(transaction)}`}
                >
                  {/* ACCORDION HEADER - Tıklanabilir */}
                  <div
                    onClick={() => toggleTransactionExpansion(transactionId)}
                    className="cursor-pointer hover:bg-gray-100 transition-colors p-4"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconInfo.bg} ${iconInfo.color}`}>
                        <i className={`${iconInfo.icon} text-lg`}></i>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 truncate-mobile">
                          {getTransactionTitle(transaction)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(transaction.date).toLocaleDateString('tr-TR')} {' '}
                          {new Date(transaction.date).toLocaleTimeString('tr-TR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                      
                      <div className="text-right flex items-center space-x-3">
                        <div>
                          <div className={`font-bold ${getAmountColor(transaction)}`}>
                            {formatAmount(transaction)}
                            {transaction.type === 'withdrawal_completed' && (
                              <span className="text-xs ml-1">(Bilgi)</span>
                            )}
                            {transaction.type === 'withdrawal_rejected' && (
                              <span className="text-xs ml-1">(İade)</span>
                            )}
                          </div>
                          <div className={`text-xs px-2 py-1 rounded-full mt-1 inline-flex items-center ${statusInfo.color}`}>
                            {statusInfo.text}
                          </div>
                        </div>
                        
                        <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                          <i className="ri-arrow-down-s-line text-gray-400 text-xl"></i>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ACCORDION CONTENT - Genişletildiğinde görünür */}
                  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="px-4 pb-4 border-t border-gray-200 bg-white">
                      <div className="pt-4 space-y-3">
                        {/* İşlem Detayları */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-gray-600 font-medium mb-2">İşlem Bilgileri</div>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Tip:</span>
                                <span className="font-medium">{getTransactionTitle(transaction)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Miktar:</span>
                                <span className="font-medium">{formatAmount(transaction)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Para Birimi:</span>
                                <span className="font-medium">{transaction.symbol || 'USDT'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Durum:</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${statusInfo.color}`}>
                                  {statusInfo.text}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-gray-600 font-medium mb-2">Tarih & Zaman</div>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Tarih:</span>
                                <span className="font-medium">
                                  {new Date(transaction.date).toLocaleDateString('tr-TR')}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Saat:</span>
                                <span className="font-medium">
                                  {new Date(transaction.date).toLocaleTimeString('tr-TR')}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">İşlem ID:</span>
                                <span className="font-mono text-xs">
                                  #{transactionId.slice(-8)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Açıklama */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-gray-600 font-medium mb-1">Açıklama</div>
                          <div className="text-sm text-gray-700">
                            {getTransactionDescription(transaction)}
                          </div>
                        </div>

                        {/* Cüzdan Adresi (eğer varsa) */}
                        {transaction.walletAddress && (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="text-blue-700 font-medium mb-1">Cüzdan Adresi</div>
                            <div className="text-sm text-blue-600 font-mono break-all">
                              {transaction.walletAddress}
                            </div>
                          </div>
                        )}

                        {/* Not (eğer varsa) */}
                        {transaction.note && (
                          <div className="bg-yellow-50 p-3 rounded-lg">
                            <div className="text-yellow-700 font-medium mb-1">Not</div>
                            <div className="text-sm text-yellow-600">
                              {transaction.note}
                            </div>
                          </div>
                        )}

                        {/* Özel bilgi notları */}
                        {transaction.type === 'withdrawal_rejected' && (
                          <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                            <div className="text-red-700 font-medium mb-1">💰 İade Bilgisi</div>
                            <div className="text-sm text-red-600">
                              Çekim talebiniz reddedildi ve {formatAmount(transaction)} tutarı bakiyenize iade edildi.
                            </div>
                          </div>
                        )}

                        {transaction.type === 'withdrawal_completed' && (
                          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                            <div className="text-blue-700 font-medium mb-1">📋 Bilgi Notu</div>
                            <div className="text-sm text-blue-600">
                              Bu kayıt sadece bilgi amaçlıdır. Bu işlem bakiyenizi etkilemez.
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary Stats - MOBİL 2X2 GRİD */}
      <div className="pt-4 border-t border-gray-200">
        <div className="stats-grid-mobile grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="stat-label-mobile text-sm text-gray-600">Toplam İşlem</div>
            <div className="stat-value-mobile font-bold text-gray-800">{counts.total}</div>
          </div>
          <div>
            <div className="stat-label-mobile text-sm text-gray-600">Tamamlanan</div>
            <div className="stat-value-mobile font-bold text-green-600">{counts.completed}</div>
          </div>
          <div>
            <div className="stat-label-mobile text-sm text-gray-600">Bekleyen</div>
            <div className="stat-value-mobile font-bold text-yellow-600">{counts.pending}</div>
          </div>
          <div>
            <div className="stat-label-mobile text-sm text-gray-600">Reddedilen</div>
            <div className="stat-value-mobile font-bold text-red-600">{counts.rejected}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
