
'use client';

import { useState, useEffect, useRef } from 'react';
import { getStorageAdapter } from '@/lib/storage-adapter';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'admin';
  timestamp: Date;
  userName?: string;
  userEmail?: string;
}

interface ChatSession {
  id: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  messages: Message[];
  status: 'active' | 'closed';
  startTime: Date;
  lastActivity: Date;
  isGuest?: boolean;
}

interface LiveChatProps {
  showInitially?: boolean;
}

export default function LiveChat({ showInitially = false }: LiveChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showText, setShowText] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<'active' | 'closed'>('active');
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ✅ YENİ: KULLANICI EMail ALMA FONKSİYONU - HER İKİ SİSTEMİ DE KONTROL ET
  const getCurrentUserEmail = (): string => {
    try {
      const storage = getStorageAdapter();
      
      // Önce yeni anahtar sistemini kontrol et
      const newUser = storage.getItem('pc_current_user');
      if (newUser) {
        const user = JSON.parse(newUser);
        return (user.email || '').trim().toLowerCase();
      }
      
      // Eski sistem için fallback
      const oldUser = storage.getItem('currentUser');
      if (oldUser) {
        const user = JSON.parse(oldUser);
        return (user.email || '').trim().toLowerCase();
      }
      
      return '';
    } catch {
      return '';
    }
  };

  useEffect(() => {
    // ✅ MOUNT EDİLDİĞİNDE HEMEN GÖRÜNÜR YAP
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      
      // Ana sayfada otomatik göster
      if (currentPath === '/') {
        setIsVisible(true);
        console.log('🎯 Ana sayfa tespit edildi - buton görünür yapıldı');
        
        // 10 saniye sonra gizle (sadece açılmamışsa)
        const hideTimer = setTimeout(() => {
          if (!isOpen) {
            setIsVisible(false);
            console.log('⏰ 10 saniye geçti - buton gizlendi');
          }
        }, 10000);

        return () => clearTimeout(hideTimer);
      }
    }
  }, []); // Sadece mount olduğunda çalışsın

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // ✅ GÜVENLİ KULLANICI KONTROL SİSTEMİ
    const loggedUserEmail = getCurrentUserEmail();
    setCurrentUserEmail(loggedUserEmail);

    if (loggedUserEmail) {
      // Kayıtlı kullanıcı
      setIsLoggedIn(true);
      
      // Kullanıcı bilgilerini al
      try {
        const storageAdapter = getStorageAdapter();
        const newUser = storageAdapter.getItem('pc_current_user');
        const oldUser = storageAdapter.getItem('currentUser');
        
        let user = null;
        if (newUser) {
          user = JSON.parse(newUser);
        } else if (oldUser) {
          user = JSON.parse(oldUser);
        }
        
        if (user) {
          setUserName(user.fullName || user.name || '');
          setUserEmail(user.email || '');
          setUserPhone(user.phone || '');
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    } else {
      // ✅ YENİ: KULLANICI ÇIKIŞ YAPMIŞ - CHAT VERİLERİNİ TEMİZLE
      setIsLoggedIn(false);
      setSessionId('');
      setMessages([]);
      setIsStarted(false);
      setUserName('');
      setUserEmail('');
      setUserPhone('');
      setSessionStatus('active');
      setUnreadCount(0);
      const storage = getStorageAdapter();
      storage.removeItem('currentChatSessionId');
      console.log('🔄 Kullanıcı çıkış yapmış - chat verileri temizlendi');
    }

    // Listen for openLiveChat event from footer
    const handleOpenChat = () => {
      setIsVisible(true);
      setIsOpen(true);
      console.log('📞 Footer\'dan canlı destek açıldı');
    };

    window.addEventListener('openLiveChat', handleOpenChat);

    // ✅ SADECE GİRİŞ YAPMIŞ KULLANICININ SESSION'INI YÜKLESİN
    if (loggedUserEmail) {
      loadUserSession(loggedUserEmail);
    }

    // Check for new messages periodically - sadece giriş yapmış kullanıcı için
    let interval: NodeJS.Timeout | null = null;
    if (loggedUserEmail) {
      interval = setInterval(() => checkForNewMessages(loggedUserEmail), 2000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
      window.removeEventListener('openLiveChat', handleOpenChat);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowText(prev => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // ✅ SADECE BU KULLANICININ SESSION'INI YÜKLE
  const loadUserSession = (userEmail: string) => {
    try {
      const storage = getStorageAdapter();
      const userSessions = JSON.parse(storage.getItem('chatSessions') || '[]');
      
      // ✅ SADECE BU KULLANICININ SESSION'LARINI FİLTRELE
      let userSession = null;
      
      if (userEmail) {
        // Kayıtlı kullanıcı - email'e göre filtrele
        userSession = userSessions.find((s: ChatSession) => 
          s.userEmail && s.userEmail.toLowerCase() === userEmail.toLowerCase()
        );
      } else {
        // Misafir kullanıcı - currentChatSessionId'ye göre bul
        const existingSessionId = storage.getItem('currentChatSessionId');
        if (existingSessionId) {
          userSession = userSessions.find((s: ChatSession) => s.id === existingSessionId);
        }
      }
      
      if (userSession) {
        setSessionId(userSession.id);
        setMessages(userSession.messages || []);
        setUserName(userSession.userName || '');
        setUserEmail(userSession.userEmail || '');
        setUserPhone(userSession.userPhone || '');
        setSessionStatus(userSession.status || 'active');
        setIsStarted(true);
        
        // Session ID'yi kaydet
        storage.setItem('currentChatSessionId', userSession.id);
      } else {
        // Bu kullanıcının session'ı yok
        setSessionId('');
        setMessages([]);
        setIsStarted(false);
        storage.removeItem('currentChatSessionId');
      }
    } catch (error) {
      console.error('Error loading user session:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ✅ SADECE BU KULLANICININ MESAJLARINI KONTROL ET
  const checkForNewMessages = (userEmail: string) => {
    if (!sessionId) return;

    try {
      const storage = getStorageAdapter();
      const userSessions = JSON.parse(storage.getItem('chatSessions') || '[]');
      
      // ✅ SADECE BU KULLANICININ SESSION'INI BUL
      let currentSession = null;
      
      if (userEmail) {
        // Kayıtlı kullanıcı
        currentSession = userSessions.find((s: ChatSession) => 
          s.id === sessionId && 
          s.userEmail && 
          s.userEmail.toLowerCase() === userEmail.toLowerCase()
        );
      } else {
        // Misafir kullanıcı
        currentSession = userSessions.find((s: ChatSession) => s.id === sessionId);
      }
      
      if (currentSession) {
        // Check if session status changed
        if (currentSession.status !== sessionStatus) {
          setSessionStatus(currentSession.status);
        }
        
        // Check for new messages
        if (currentSession.messages && currentSession.messages.length > messages.length) {
          const newMessages = currentSession.messages.slice(messages.length);
          
          // Check for new admin messages for notification count
          const newAdminMessages = newMessages.filter(
            (msg: Message) => msg.sender === 'admin'
          );
          
          if (newAdminMessages.length > 0) {
            if (!isOpen) {
              setUnreadCount(prev => prev + newAdminMessages.length);
            }
          }
          
          setMessages(currentSession.messages);
        }
      }
    } catch (error) {
      console.error('Error checking for new messages:', error);
    }
  };

  // ✅ GÜVENLİ SESSION OLUŞTURMA
  const createNewSession = () => {
    const newSessionId = Date.now().toString();
    const finalUserEmail = currentUserEmail || `guest_${newSessionId}@temp.com`;
    
    const newSession: ChatSession = {
      id: newSessionId,
      userName: userName.trim(),
      userEmail: finalUserEmail,
      userPhone: userPhone.trim(),
      messages: [],
      status: 'active',
      startTime: new Date(),
      lastActivity: new Date(),
      isGuest: !currentUserEmail
    };

    // Save to both user and admin storage
    try {
      const storage = getStorageAdapter();
      
      // User sessions
      const userSessions = JSON.parse(storage.getItem('chatSessions') || '[]');
      userSessions.push(newSession);
      storage.setItem('chatSessions', JSON.stringify(userSessions));
      
      // Admin sessions (separate storage)
      const adminSessions = JSON.parse(storage.getItem('adminChatSessions') || '[]');
      adminSessions.push(newSession);
      storage.setItem('adminChatSessions', JSON.stringify(adminSessions));
      
      // Set current session
      storage.setItem('currentChatSessionId', newSessionId);
      
      setSessionId(newSessionId);
      setUserEmail(finalUserEmail);
      setIsStarted(true);
      setShowGuestForm(false);
      
      console.log(`✅ Yeni session oluşturuldu: ${newSessionId} - ${finalUserEmail}`);
      
    } catch (error) {
      console.error('Error creating new session:', error);
    }
  };

  // ✅ GÜVENLİ MESAJ EKLEME
  const addMessage = (message: Message) => {
    try {
      const storage = getStorageAdapter();
      
      // ✅ SADECE BU KULLANICININ SESSION'INI GÜNCELLE
      const userSessions = JSON.parse(storage.getItem('chatSessions') || '[]');
      const userIndex = userSessions.findIndex((s: ChatSession) => 
        s.id === sessionId && 
        s.userEmail === userEmail
      );
      
      if (userIndex !== -1) {
        userSessions[userIndex].messages.push(message);
        userSessions[userIndex].lastActivity = new Date();
        storage.setItem('chatSessions', JSON.stringify(userSessions));
      }
      
      // Update admin sessions
      const adminSessions = JSON.parse(storage.getItem('adminChatSessions') || '[]');
      const adminIndex = adminSessions.findIndex((s: ChatSession) => 
        s.id === sessionId && 
        s.userEmail === userEmail
      );
      
      if (adminIndex !== -1) {
        adminSessions[adminIndex].messages.push(message);
        adminSessions[adminIndex].lastActivity = new Date();
        storage.setItem('adminChatSessions', JSON.stringify(adminSessions));
      }
      
      setMessages(prev => [...prev, message]);
      
      console.log(`✅ Mesaj eklendi: ${sessionId} - ${userEmail} - ${message.text.substring(0, 30)}`);
      
    } catch (error) {
      console.error('Error adding message:', error);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || sessionStatus === 'closed') return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      sender: 'user',
      timestamp: new Date(),
      userName,
      userEmail
    };

    addMessage(message);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleChat = () => {
    if (!isOpen) {
      // Opening chat
      if (!isLoggedIn && !isStarted) {
        setShowGuestForm(true);
      } else if (isLoggedIn && !isStarted) {
        createNewSession();
      }
      setUnreadCount(0);
      setIsVisible(true); // Chat açıldığında kesin göster
    } else {
      // ✅ YENİ: Closing chat - İKONU GİZLE
      setIsVisible(false);
    }
    
    setIsOpen(!isOpen);
  };

  const handleGuestFormSubmit = () => {
    if (!userName.trim() || !userPhone.trim()) {
      alert('Lütfen tüm alanları doldurun');
      return;
    }
    createNewSession();
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ✅ BUTON GÖSTERİM KONTROLÜ - HER DURUMDA LOG EKLE
  if (!isVisible && !isOpen) {
    console.log('❌ LiveChat buton gizli - isVisible:', isVisible, 'isOpen:', isOpen);
    return null;
  }

  console.log('✅ LiveChat buton görünür - isVisible:', isVisible, 'isOpen:', isOpen);

  return (
    <>
      {/* Chat Button - HER ZAMAN GÖSTER EĞER isVisible TRUE */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleChat}
          data-chat-button
          className="relative w-14 h-14 bg-white rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center border-2 border-blue-100 overflow-hidden"
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <div className={`absolute inset-0 transition-opacity duration-500 ${showText ? 'opacity-0' : 'opacity-100'}`}>
              <img 
                src="https://readdy.ai/api/search-image?query=Professional%20business%20woman%20with%20headset%20customer%20service%2C%20friendly%20smile%2C%20corporate%20attire%2C%20clean%20white%20background%2C%20customer%20support%20specialist%2C%20modern%20office%20environment&width=60&height=60&seq=support-woman-avatar&orientation=squarish"
                alt="Canlı Destek"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            
            <div className={`absolute inset-0 bg-blue-600 rounded-full flex items-center justify-center transition-opacity duration-500 ${showText ? 'opacity-100' : 'opacity-0'}`}>
              <div className="text-center">
                <div className="text-[8px] font-bold text-white leading-tight">Canlı</div>
                <div className="text-[8px] font-bold text-white leading-tight">Destek</div>
              </div>
            </div>
          </div>
          
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}

          <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-20"></div>
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-300">
                  <img 
                    src="https://readdy.ai/api/search-image?query=Professional%20business%20woman%20with%20headset%20customer%20service%20representative%2C%20friendly%20smile%2C%20corporate%20attire%2C%20clean%20background%2C%20customer%20support%20specialist%2C%20modern%20office%20environment&width=40&height=40&seq=support-woman-header&orientation=squarish"
                    alt="Destek Temsilcisi"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold">Canlı Destek</h3>
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${sessionStatus === 'active' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <p className="text-xs text-blue-100">
                      {sessionStatus === 'active' ? 'Online - Uzman ekibimiz sizinle' : 'Görüşme kapalı'}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={toggleChat}
                className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center hover:bg-blue-800 transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>
          </div>

          {/* Chat Content */}
          <div className="flex-1 flex flex-col">
            {showGuestForm ? (
              // Guest Form
              <div className="p-4 space-y-4">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-3 border-3 border-blue-100">
                    <img 
                      src="https://readdy.ai/api/search-image?query=Professional%20business%20woman%20with%20headset%20customer%20service%20representative%2C%20friendly%20smile%2C%20corporate%20attire%2C%20welcoming%20gesture%2C%20customer%20support%20specialist%2C%20high%20quality%20portrait&width=80&height=80&seq=support-woman-welcome&orientation=squarish"
                      alt="Destek Temsilcisi"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-semibold text-gray-800">Canlı Desteğe Başlayın</h4>
                  <p className="text-sm text-gray-600">Size yardımcı olabilmemiz için lütfen bilgilerinizi girin</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      İsim Soyisim *
                    </label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      placeholder="Adınızı ve soyadınızı yazın"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefon Numarası *
                    </label>
                    <input
                      type="tel"
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      placeholder="+90 (555) 123 45 67"
                    />
                  </div>

                  <button
                    onClick={handleGuestFormSubmit}
                    disabled={!userName.trim() || !userPhone.trim()}
                    className={`w-full py-2 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      userName.trim() && userPhone.trim()
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <i className="ri-chat-1-line mr-2"></i>
                    Sohbeti Başlat
                  </button>
                </div>
              </div>
            ) : !isStarted ? (
              // Logged in user start
              <div className="p-4 space-y-4">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-3 border-3 border-blue-100">
                    <img 
                      src="https://readdy.ai/api/search-image?query=Professional%20business%20woman%20with%20headset%20customer%20service%20representative%2C%20friendly%20smile%2C%20corporate%20attire%2C%20welcoming%20gesture%2C%20customer%20support%20specialist%2C%20high%20quality%20portrait&width=80&height=80&seq=support-woman-welcome&orientation=squarish"
                      alt="Destek Temsilcisi"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-semibold text-gray-800">Canlı Desteğe Başlayın</h4>
                  <p className="text-sm text-gray-600">Uzman ekibimiz size yardımcı olmak için hazır</p>
                </div>

                <div className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="text-sm text-blue-800">
                      <div className="font-semibold">{userName}</div>
                      <div className="text-blue-600">{currentUserEmail}</div>
                      {userPhone && <div className="text-blue-600">{userPhone}</div>}
                    </div>
                  </div>
                  <button
                    onClick={createNewSession}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-chat-1-line mr-2"></i>
                    Sohbeti Başlat
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {messages.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      <i className="ri-chat-1-line text-3xl mb-2"></i>
                      <p className="text-sm">Sohbet başlatıldı. Mesajınızı yazın!</p>
                    </div>
                  )}
                  
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-2xl ${
                          message.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 px-3 py-2 rounded-2xl">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  {sessionStatus === 'closed' ? (
                    <div className="text-center text-gray-500 py-2">
                      <i className="ri-chat-off-line text-xl mb-1"></i>
                      <p className="text-xs">Bu görüşme kapatılmış</p>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-2xl focus:border-blue-500 focus:outline-none"
                        placeholder="Mesajınızı yazın..."
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                          newMessage.trim()
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <i className="ri-send-plane-line"></i>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}