import React from 'react';
import { motion } from 'motion/react';
import { ScreenType } from '../types';
import { Language, translate } from '../translations';

interface NavBarProps {
  activeScreen: ScreenType;
  onScreenChange: (screen: ScreenType) => void;
  currentLang: Language;
  unreadNotificationsCount?: number;
}

export default function NavBar({ activeScreen, onScreenChange, currentLang, unreadNotificationsCount = 0 }: NavBarProps) {
  const tabs = [
    { id: 'favorites' as ScreenType, labelKey: 'favorite' as const, icon: 'favorite' },
    { id: 'home' as ScreenType, labelKey: 'home' as const, icon: 'home' },
    { id: 'profile' as ScreenType, labelKey: 'profile' as const, icon: 'person' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-2 bg-[#f8ebe6]/95 backdrop-blur-md z-40 rounded-t-2xl border-t border-[#d7c2b8] shadow-md max-w-lg mx-auto right-0 h-14">
      {tabs.map((tab) => {
        const isActive = activeScreen === tab.id;
        const translatedLabel = translate(currentLang, tab.labelKey);

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onScreenChange(tab.id)}
            className="flex-1 flex justify-center items-center focus:outline-none"
          >
            {isActive ? (
              <motion.div
                layoutId="activeTabIndicator"
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                className="flex flex-col items-center justify-center bg-[#5D3C1E] text-[#F7F3EE] rounded-xl py-1 px-4 shadow-sm w-24 h-11"
              >
                <div className="relative flex items-center justify-center">
                  <span className="material-symbols-outlined fill text-[18px] leading-none">
                    {tab.icon}
                  </span>
                  {tab.id === 'profile' && unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-[#F7F3EE] text-[#5D3C1E] text-[7px] font-bold rounded-full min-w-[13px] h-[13px] flex items-center justify-center px-0.5 border border-[#5D3C1E] animate-pulse">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </div>
                <span className="text-[8px] font-bold mt-0.5 capitalize leading-none tracking-wide">
                  {translatedLabel}
                </span>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center text-[#52443c] hover:text-[#1C1410] transition-colors cursor-pointer w-24 h-11 rounded-xl hover:bg-[#EDE0CE]/35">
                <div className="relative flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px] leading-none">
                    {tab.icon}
                  </span>
                  {tab.id === 'profile' && unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-[#5D3C1E] text-[#F7F3EE] text-[7px] font-bold rounded-full min-w-[13px] h-[13px] flex items-center justify-center px-0.5 border border-[#f8ebe6]">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </div>
                <span className="text-[8px] font-semibold mt-0.5 capitalize leading-none tracking-wide text-[#52443c]/80">
                  {translatedLabel}
                </span>
              </div>
            )}
          </button>
        );
      })}
    </nav>
  );
}
