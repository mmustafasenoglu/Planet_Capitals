
'use client';

import { useState, useEffect, useRef } from 'react';

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
  category?: 'answered' | 'pending' | 'no_response';
  isGuest?: boolean;
}

export default function AdminChatPanel() {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'answered' | 'pending' | 'no_response'>('all');

  useEffect(() => {
    loadChatSessions();
    const interval = setInterval(loadChatSessions, 2000); // Check every 2 seconds
    return () => clearInterval(interval);
  }, []);

  const loadChatSessions = () => {
    try {
      const sessions = JSON.parse(localStorage.getItem('adminChatSessions') || '[]');
      const processedSessions = sessions.map((session: ChatSession) => ({
        ...session,
        startTime: new Date(session.startTime),
        lastActivity: new Date(session.lastActivity),
        messages: (session.messages || []).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })),
        category: determineCategory(session)
      }));
      
      const sortedSessions = processedSessions.sort((a: ChatSession, b: ChatSession) => 
        new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
      );
      
      setChatSessions(sortedSessions);
    } catch (error) {
      console.error('Error loading chat sessions:', error);
    }
  };

  const determineCategory = (session: ChatSession): 'answered' | 'pending' | 'no_response' => {
    if (!session.messages || session.messages.length === 0) return 'no_response';
    
    const lastMessage = session.messages[session.messages.length - 1];
    const userMessages = session.messages.filter(msg => msg.sender === 'user');
    const adminMessages = session.messages.filter(msg => msg.sender === 'admin');
    
    if (userMessages.length === 0) return 'no_response';
    if (adminMessages.length === 0) return 'pending';
    if (lastMessage.sender === 'user') return 'pending';
    
    return 'answered';
  };

  const sendAdminMessage = (sessionId: string) => {
    if (!newMessage.trim()) return;

    setLoading(true);

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      sender: 'admin',
      timestamp: new Date()
    };

    try {
      // Update admin sessions
      const adminSessions = JSON.parse(localStorage.getItem('adminChatSessions') || '[]');
      const adminIndex = adminSessions.findIndex((s: ChatSession) => s.id === sessionId);
      
      if (adminIndex !== -1) {
        adminSessions[adminIndex].messages.push(message);
        adminSessions[adminIndex].lastActivity = new Date();
        localStorage.setItem('adminChatSessions', JSON.stringify(adminSessions));
      }

      // Update user sessions
      const userSessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
      const userIndex = userSessions.findIndex((s: ChatSession) => s.id === sessionId);
      
      if (userIndex !== -1) {
        userSessions[userIndex].messages.push(message);
        userSessions[userIndex].lastActivity = new Date();
        localStorage.setItem('chatSessions', JSON.stringify(userSessions));
      }

      // Update local state
      setChatSessions(prev => prev.map(s => {
        if (s.id === sessionId) {
          const updatedSession = {
            ...s,
            messages: [...s.messages, message],
            lastActivity: new Date(),
            category: 'answered' as const
          };
          return updatedSession;
        }
        return s;
      }));

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
    
    setLoading(false);
  };

  const toggleSessionStatus = (sessionId: string) => {
    try {
      const adminSessions = JSON.parse(localStorage.getItem('adminChatSessions') || '[]');
      const userSessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');

      const adminIndex = adminSessions.findIndex((s: ChatSession) => s.id === sessionId);
      const userIndex = userSessions.findIndex((s: ChatSession) => s.id === sessionId);

      const newStatus = adminSessions[adminIndex]?.status === 'active' ? 'closed' : 'active';

      if (adminIndex !== -1) {
        adminSessions[adminIndex].status = newStatus;
        localStorage.setItem('adminChatSessions', JSON.stringify(adminSessions));
      }

      if (userIndex !== -1) {
        userSessions[userIndex].status = newStatus;
        localStorage.setItem('chatSessions', JSON.stringify(userSessions));
      }

      setChatSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, status: newStatus } : s
      ));
    } catch (error) {
      console.error('Error toggling session status:', error);
    }
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('tr-TR');
  };

  const getLastMessage = (session: ChatSession) => {
    if (!session.messages || session.messages.length === 0) return 'Henüz mesaj yok';
    const lastMsg = session.messages[session.messages.length - 1];
    const senderName = lastMsg.sender === 'user' ? session.userName : 'Admin';
    return `${senderName}: ${lastMsg.text.substring(0, 50)}${lastMsg.text.length > 50 ? '...' : ''}`;
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'answered': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'no_response': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryText = (category?: string) => {
    switch (category) {
      case 'answered': return 'Cevaplanmış';
      case 'pending': return 'Bekleyen Cevap';
      case 'no_response': return 'Cevabı Olmayan';
      default: return '-';
    }
  };

  const getUserDisplayInfo = (session: ChatSession) => {
    if (session.userEmail && session.userEmail.includes('@temp.com')) {
      // Guest user
      return {
        name: session.userName,
        contact: `Tel: ${session.userPhone || 'Bilinmiyor'}`,
        type: 'Misafir'
      };
    } else {
      // Registered user
      return {
        name: session.userName,
        contact: session.userEmail,
        type: 'Üye'
      };
    }
  };

  const filteredSessions = chatSessions.filter(session => {
    if (filter === 'all') return true;
    return session.category === filter;
  });

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center">
            <i className="ri-message-3-line mr-2 text-blue-600"></i>
            Canlı Destek Sohbetleri
          </h3>
          <div className="text-sm text-gray-600">{filteredSessions.length} sohbet</div>
        </div>

        {/* Filter Buttons */}
        <div className="flex space-x-2 overflow-x-auto">
          {[
            { key: 'all', label: 'Tümü', count: chatSessions.length },
            { key: 'pending', label: 'Bekleyen', count: chatSessions.filter(s => s.category === 'pending').length },
            { key: 'answered', label: 'Cevaplanmış', count: chatSessions.filter(s => s.category === 'answered').length },
            { key: 'no_response', label: 'Cevabı Olmayan', count: chatSessions.filter(s => s.category === 'no_response').length }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer whitespace-nowrap ${
                filter === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      </div>

      <div className="max-h-[600px] overflow-y-auto">
        {filteredSessions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <i className="ri-chat-off-line text-3xl mb-2"></i>
            <p>
              {filter === 'all' ? 'Henüz sohbet yok' : `${getCategoryText(filter)} sohbet bulunamadı`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {/* Excel-like Table Header */}
            <div className="bg-gray-50 px-4 py-2 text-xs font-medium text-gray-600 uppercase tracking-wider">
              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-3">Kullanıcı</div>
                <div className="col-span-2">Durum</div>
                <div className="col-span-3">Son Mesaj</div>
                <div className="col-span-2">Tarih/Saat</div>
                <div className="col-span-2">İşlemler</div>
              </div>
            </div>

            {/* Excel-like Table Rows */}
            {filteredSessions.map((session) => {
              const userInfo = getUserDisplayInfo(session);
              return (
                <div key={session.id}>
                  {/* Main Row */}
                  <div 
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-4 border-transparent hover:border-blue-500"
                    onClick={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                  >
                    <div className="grid grid-cols-12 gap-2 items-center text-sm">
                      {/* User Info */}
                      <div className="col-span-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                            {session.userName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-gray-800 truncate">{userInfo.name}</div>
                            <div className="text-xs text-gray-500 truncate">{userInfo.contact}</div>
                            <div className="text-xs text-blue-600">{userInfo.type}</div>
                          </div>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="col-span-2">
                        <div className="flex flex-col space-y-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(session.category)}`}>
                            {getCategoryText(session.category)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            session.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {session.status === 'active' ? 'Açık' : 'Kapalı'}
                          </span>
                        </div>
                      </div>

                      {/* Last Message */}
                      <div className="col-span-3">
                        <div className="text-sm text-gray-700 truncate">
                          {getLastMessage(session)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {session.messages.length} mesaj
                        </div>
                      </div>

                      {/* Date/Time */}
                      <div className="col-span-2">
                        <div className="text-xs text-gray-600">
                          <div>{formatDate(session.lastActivity)}</div>
                          <div>{formatTime(session.lastActivity)}</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="col-span-2">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSessionStatus(session.id);
                            }}
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs cursor-pointer ${
                              session.status === 'active'
                                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                : 'bg-green-100 text-green-600 hover:bg-green-200'
                            }`}
                            title={session.status === 'active' ? 'Görüşmeyi kapat' : 'Görüşmeyi aç'}
                          >
                            <i className={session.status === 'active' ? 'ri-pause-line' : 'ri-play-line'}></i>
                          </button>

                          <div className="text-gray-400">
                            <i className={`ri-arrow-${expandedSession === session.id ? 'up' : 'down'}-s-line`}></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Chat Window */}
                  {expandedSession === session.id && (
                    <div className="bg-gray-50 border-t border-gray-200">
                      {/* Chat Messages */}
                      <div className="h-64 overflow-y-auto p-4 space-y-2 bg-white border-x-4 border-blue-100">
                        {session.messages.length === 0 ? (
                          <div className="text-center text-gray-500 py-4">
                            <i className="ri-chat-off-line text-2xl mb-1"></i>
                            <p className="text-sm">Henüz mesaj yok</p>
                          </div>
                        ) : (
                          session.messages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-xs px-3 py-2 rounded-2xl ${
                                  message.sender === 'admin'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                <p className="text-sm">{message.text}</p>
                                <p className={`text-xs mt-1 ${
                                  message.sender === 'admin' ? 'text-blue-100' : 'text-gray-500'
                                }`}>
                                  {formatTime(message.timestamp)}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Reply Input */}
                      {session.status === 'active' ? (
                        <div className="p-4 bg-white border-t border-gray-200">
                          <div className="flex space-x-3">
                            <input
                              type="text"
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  sendAdminMessage(session.id);
                                }
                              }}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-2xl focus:border-blue-500 focus:outline-none"
                              placeholder="Müşteriye mesajınızı yazın..."
                              disabled={loading}
                            />
                            <button
                              onClick={() => sendAdminMessage(session.id)}
                              disabled={!newMessage.trim() || loading}
                              className={`px-6 py-2 rounded-2xl font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                                newMessage.trim() && !loading
                                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              {loading ? (
                                <div className="flex items-center space-x-2">
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  <span>Gönderiliyor</span>
                                </div>
                              ) : (
                                <>
                                  <i className="ri-send-plane-line mr-2"></i>
                                  Gönder
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-4 bg-gray-100">
                          <i className="ri-chat-off-line text-2xl mb-2"></i>
                          <p className="text-sm">Bu görüşme kapatılmış</p>
                          <button
                            onClick={() => toggleSessionStatus(session.id)}
                            className="mt-2 px-4 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 cursor-pointer"
                          >
                            Görüşmeyi Yeniden Aç
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
