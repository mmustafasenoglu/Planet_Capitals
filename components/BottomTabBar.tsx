
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BottomTabBarProps {
  onOpenLiveChat?: () => void;
}

export default function BottomTabBar({ onOpenLiveChat }: BottomTabBarProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down - hide tab bar
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show tab bar
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleLiveChatClick = () => {
    // Trigger the existing live chat modal
    if (onOpenLiveChat) {
      onOpenLiveChat();
    } else {
      // Fallback: dispatch custom event to open existing live chat
      window.dispatchEvent(new Event('openLiveChat'));
    }
  };

  const tabs = [
    {
      id: 'home',
      name: 'Ana Sayfa',
      icon: 'ri-home-line',
      activeIcon: 'ri-home-fill',
      href: '/',
      action: null
    },
    {
      id: 'launches',
      name: 'Yeni Coinler',
      icon: 'ri-rocket-line',
      activeIcon: 'ri-rocket-fill',
      href: '/launches',
      action: null
    },
    {
      id: 'deposit',
      name: 'Yatırım',
      icon: 'ri-add-circle-line',
      activeIcon: 'ri-add-circle-fill',
      href: '/deposit',
      action: null
    },
    {
      id: 'support',
      name: 'Canlı Destek',
      icon: 'ri-customer-service-line',
      activeIcon: 'ri-customer-service-fill',
      href: null,
      action: handleLiveChatClick
    },
    {
      id: 'dashboard',
      name: 'Hesabım',
      icon: 'ri-user-line',
      activeIcon: 'ri-user-fill',
      href: '/dashboard',
      action: null
    }
  ];

  const isActiveTab = (tab: any) => {
    if (tab.href === '/') {
      return pathname === '/';
    }
    return tab.href && pathname.startsWith(tab.href);
  };

  return (
    <>
      {/* Show/Hide Toggle Arrow - Only visible when tab bar is hidden */}
      {!isVisible && (
        <div className="fixed bottom-4 right-4 z-50 md:hidden">
          <button
            onClick={() => setIsVisible(true)}
            className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-200/50 flex items-center justify-center hover:bg-white/90 transition-all cursor-pointer"
          >
            <i className="ri-arrow-up-line text-xl text-gray-600"></i>
          </button>
        </div>
      )}

      {/* Bottom Tab Bar - Only visible on mobile */}
      <div 
        className={`fixed bottom-3 left-3 right-3 z-40 md:hidden transition-transform duration-300 ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Background with blur effect */}
        <div className="bg-white/75 backdrop-blur-lg border border-gray-200/30 shadow-xl rounded-2xl">
          {/* Tab Navigation */}
          <div className="grid grid-cols-5 gap-1 px-2 py-1.5">
            {tabs.map((tab) => {
              const isActive = isActiveTab(tab);
              
              if (tab.action) {
                // Action button (Live Chat)
                return (
                  <button
                    key={tab.id}
                    onClick={tab.action}
                    className="flex flex-col items-center justify-center py-1.5 px-1 transition-colors cursor-pointer hover:bg-gray-100/50 rounded-xl"
                  >
                    <div className={`w-6 h-6 flex items-center justify-center mb-0.5 ${
                      isActive ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      <i className={`${isActive ? tab.activeIcon : tab.icon} text-lg`}></i>
                    </div>
                    <span className={`text-xs font-medium leading-tight text-center ${
                      isActive ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      {tab.name}
                    </span>
                  </button>
                );
              }
              
              // Link button
              return (
                <Link
                  key={tab.id}
                  href={tab.href || '/'}
                  className="flex flex-col items-center justify-center py-1.5 px-1 transition-colors cursor-pointer hover:bg-gray-100/50 rounded-xl"
                >
                  <div className={`w-6 h-6 flex items-center justify-center mb-0.5 ${
                    isActive ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    <i className={`${isActive ? tab.activeIcon : tab.icon} text-lg`}></i>
                  </div>
                  <span className={`text-xs font-medium leading-tight text-center ${
                    isActive ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {tab.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Safe area padding for content above tab bar on mobile */}
      <div className="h-16 md:hidden"></div>
    </>
  );
}