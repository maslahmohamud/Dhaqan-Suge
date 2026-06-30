import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, Artifact, NotificationItem } from '../types';
import { Language, translate } from '../translations';

interface ProfileScreenProps {
  profile: UserProfile;
  likedCount: number;
  onLogout: () => void;
  onBackToHome: () => void;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onUploadAvatar?: (file: File) => Promise<void>;
  onSelectArtifact: (artifact: Artifact) => void;
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  notifications: NotificationItem[];
  onMarkNotificationsRead: () => void;
  onMarkNotificationRead?: (id: string) => void;
}

type SubView = 'main' | 'settings' | 'notifications';

export default function ProfileScreen({
  profile,
  likedCount,
  onLogout,
  onBackToHome,
  onUpdateProfile,
  onUploadAvatar,
  onSelectArtifact,
  currentLang,
  onLanguageChange,
  notifications,
  onMarkNotificationsRead,
  onMarkNotificationRead,
}: ProfileScreenProps) {
  const [activeSub, setActiveSub] = useState<SubView>('main');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [tempName, setTempName] = useState(profile.username);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleAvatarClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    if (onMarkNotificationRead && !notif.isRead) {
      onMarkNotificationRead(notif.id);
    }
    if (notif.artifact) {
      onSelectArtifact(notif.artifact);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (onUploadAvatar) {
      try {
        setIsUploading(true);
        await onUploadAvatar(file);
      } catch (err) {
        console.error('Failed to upload avatar:', err);
      } finally {
        setIsUploading(false);
      }
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        onUpdateProfile({ avatar_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = () => {
    onUpdateProfile({ username: tempName });
    setSaveSuccess(true);
    setTimeout(() => { setSaveSuccess(false); setActiveSub('main'); }, 1500);
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffHrs < 1) return 'Hadda';
    if (diffHrs < 24) return `${diffHrs} saac ka hor`;
    if (diffDays === 1) return 'Shalay';
    return `${diffDays} maalmood ka hor`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto pb-28 flex flex-col min-h-screen bg-[#F7F3EE] relative overflow-hidden text-[#1C1410]">
      <AnimatePresence mode="wait">

        {/* ── MAIN VIEW ── */}
        {activeSub === 'main' && (
          <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
            <header className="bg-[#F7F3EE] border-b border-[#d7c2b8]/30 pt-10 pb-8 px-6 flex flex-col items-center relative z-10">
              <button
                type="button"
                onClick={onBackToHome}
                className="absolute top-10 left-5 w-10 h-10 rounded-full bg-white border border-[#d7c2b8] flex items-center justify-center hover:bg-[#f8ebe6]/50 transition-all active:scale-90 shadow-sm"
              >
                <span className="material-symbols-outlined text-[#5D3C1E] text-lg font-bold">arrow_back</span>
              </button>

              <h1 className="text-xs font-bold uppercase tracking-widest text-[#52443c] mb-6">{translate(currentLang, 'profileTitle')}</h1>

              <div className="relative group cursor-pointer mb-4" onClick={handleAvatarClick}>
                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center border border-[#d7c2b8] overflow-hidden shadow-sm relative">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.username} className={`w-full h-full object-cover ${isUploading ? 'opacity-40' : ''}`} referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full bg-[#f8ebe6] flex flex-col items-center justify-center text-[#52443c]/60">
                      <span className="material-symbols-outlined text-4xl fill text-[#5D3C1E]">person</span>
                    </div>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-[#F7F3EE]/60 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-[#5D3C1E] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#5D3C1E] text-[#F7F3EE] flex items-center justify-center shadow-sm border border-[#F7F3EE]">
                  <span className="material-symbols-outlined text-sm">edit</span>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              </div>

              <h2 className="text-lg font-bold text-[#1C1410] tracking-tight uppercase">{profile.username}</h2>
            </header>

            <div className="w-full max-w-4xl mx-auto md:grid md:grid-cols-2 md:gap-6 md:items-start px-5 mt-2 mb-6">
              <div>
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-3xl p-5 flex flex-col items-center justify-center text-center border border-[#d7c2b8] shadow-sm">
                    <div className="flex items-center gap-1.5 text-[#5D3C1E] mb-1">
                      <span className="material-symbols-outlined fill text-base">favorite</span>
                      <span className="text-base font-bold text-[#1C1410]">{likedCount}</span>
                    </div>
                    <span className="text-[9px] font-bold text-[#52443c] uppercase tracking-wider">
                      {translate(currentLang, 'statsSaved')}
                    </span>
                  </div>

                  <div className="bg-white rounded-3xl p-5 flex flex-col items-center justify-center text-center border border-[#d7c2b8] shadow-sm">
                    <div className="flex items-center gap-1.5 text-[#5D3C1E] mb-1">
                      <div className="relative flex items-center justify-center">
                        <span className="material-symbols-outlined text-base fill">notifications</span>
                        {unreadCount > 0 && (
                          <span className="absolute -top-1.5 -right-2 bg-[#5D3C1E] text-[#F7F3EE] text-[7px] font-bold rounded-full min-w-[13px] h-[13px] flex items-center justify-center px-0.5 border border-[#F7F3EE] animate-pulse">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <span className="text-base font-bold ml-1.5 text-[#1C1410]">{unreadCount}</span>
                    </div>
                    <span className="text-[9px] font-bold text-[#52443c] uppercase tracking-wider">
                      {translate(currentLang, 'statsNotifications')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-6 md:mt-0">
                {/* Notifications */}
                <button
                  type="button"
                  onClick={() => { setActiveSub('notifications'); }}
                  className="w-full bg-white hover:bg-[#f8ebe6]/40 border border-[#d7c2b8] text-[#1C1410] rounded-3xl p-5 flex items-center justify-between shadow-sm active:scale-[0.99] transition-all group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="relative flex items-center justify-center">
                      <span className="material-symbols-outlined text-xl text-[#5D3C1E]">notifications</span>
                      {unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-2 bg-[#5D3C1E] text-[#F7F3EE] text-[7px] font-bold rounded-full min-w-[13px] h-[13px] flex items-center justify-center px-0.5 border border-white animate-pulse">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold tracking-wide uppercase">{translate(currentLang, 'menuNotifications')}</span>
                  </div>
                  <span className="material-symbols-outlined text-base text-[#52443c] group-hover:translate-x-1 transition-transform">arrow_forward_ios</span>
                </button>

                {/* Settings */}
                <button
                  type="button"
                  onClick={() => setActiveSub('settings')}
                  className="w-full bg-white hover:bg-[#f8ebe6]/40 border border-[#d7c2b8] text-[#1C1410] rounded-3xl p-5 flex items-center justify-between shadow-sm active:scale-[0.99] transition-all group"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="material-symbols-outlined text-xl text-[#5D3C1E]">settings</span>
                    <span className="text-xs font-bold tracking-wide uppercase">{translate(currentLang, 'menuSettings')}</span>
                  </div>
                  <span className="material-symbols-outlined text-base text-[#52443c] group-hover:translate-x-1 transition-transform">arrow_forward_ios</span>
                </button>

                {/* Language */}
                <button
                  type="button"
                  onClick={() => setIsLangOpen(true)}
                  className="w-full bg-white hover:bg-[#f8ebe6]/40 border border-[#d7c2b8] text-[#1C1410] rounded-3xl p-5 flex items-center justify-between shadow-sm active:scale-[0.99] transition-all group"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="material-symbols-outlined text-xl text-[#5D3C1E]">language</span>
                    <div className="flex flex-col items-start">
                      <span className="text-xs font-bold tracking-wide uppercase">{translate(currentLang, 'menuLanguage')}</span>
                      <span className="text-[10px] text-[#52443c] font-semibold capitalize mt-0.5">{currentLang}</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-base text-[#52443c]">expand_more</span>
                </button>

                {/* Sign Out */}
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full bg-white hover:bg-[#f8ebe6]/40 border border-[#d7c2b8] text-[#1C1410] rounded-3xl p-5 flex items-center justify-between shadow-sm active:scale-[0.99] transition-all group"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="material-symbols-outlined text-xl text-[#5D3C1E]">logout</span>
                    <span className="text-xs font-bold tracking-wide uppercase">{translate(currentLang, 'menuSignOut')}</span>
                  </div>
                  <span className="material-symbols-outlined text-base text-[#52443c] group-hover:translate-x-1 transition-transform">arrow_forward_ios</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── SETTINGS VIEW ── */}
        {activeSub === 'settings' && (
          <motion.div key="settings" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 26, stiffness: 240 }} className="flex-1 flex flex-col p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#d7c2b8]">
              <button type="button" onClick={() => setActiveSub('main')} className="w-10 h-10 rounded-full bg-white border border-[#d7c2b8] flex items-center justify-center hover:bg-[#f8ebe6]/50 active:scale-95 shadow-sm">
                <span className="material-symbols-outlined text-[#5D3C1E] text-lg font-bold">arrow_back</span>
              </button>
              <h2 className="text-xs font-bold text-[#1C1410] uppercase tracking-wider">{translate(currentLang, 'settingsTitle')}</h2>
              <div className="w-10 h-10" />
            </div>

            <div className="space-y-4 flex-1">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#5D3C1E] uppercase tracking-wider ml-1">{translate(currentLang, 'labelFullName')}</label>
                <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)}
                  className="w-full bg-[#f8ebe6] border border-[#d7c2b8] rounded-2xl px-4 py-3.5 text-xs font-medium focus:outline-none focus:border-[#5D3C1E] focus:ring-2 focus:ring-[#5D3C1E]/10 text-[#1C1410]"
                  placeholder="Full Name"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#5D3C1E] uppercase tracking-wider ml-1">{translate(currentLang, 'labelEmail')}</label>
                <input type="email" value={profile.email} disabled
                  className="w-full bg-[#f8ebe6]/40 border border-[#d7c2b8] rounded-2xl px-4 py-3.5 text-xs font-medium text-[#52443c]/50 cursor-not-allowed"
                />
              </div>
              {saveSuccess && (
                <div className="bg-[#fef1eb] text-[#5D3C1E] border border-[#d7c2b8] rounded-2xl p-4 text-xs font-bold text-center">
                  {translate(currentLang, 'msgChangesSaved')}
                </div>
              )}
            </div>

            <button type="button" onClick={handleSaveSettings}
              className="w-full bg-[#5D3C1E] hover:bg-[#1C1410] text-[#F7F3EE] py-4 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-sm active:scale-[0.98] transition-all"
            >
              {translate(currentLang, 'btnSaveChanges')}
            </button>
          </motion.div>
        )}

        {/* ── NOTIFICATIONS VIEW ── */}
        {activeSub === 'notifications' && (
          <motion.div key="notifications" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 26, stiffness: 240 }} className="flex-1 flex flex-col p-6 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-[#d7c2b8]">
              <button type="button" onClick={() => setActiveSub('main')} className="w-10 h-10 rounded-full bg-white border border-[#d7c2b8] flex items-center justify-center hover:bg-[#f8ebe6]/50 active:scale-95 shadow-sm">
                <span className="material-symbols-outlined text-[#5D3C1E] text-lg font-bold">arrow_back</span>
              </button>
              <h2 className="text-xs font-bold text-[#1C1410] uppercase tracking-wider">{translate(currentLang, 'notifTitle')}</h2>
              {unreadCount > 0 ? (
                <button
                  type="button"
                  onClick={onMarkNotificationsRead}
                  className="text-[10px] font-bold text-[#835331] hover:text-[#5D3C1E] uppercase tracking-wider transition-colors"
                >
                  Dhamman akhri
                </button>
              ) : (
                <div className="w-10 h-10" />
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-4 text-center p-6">
                <span className="material-symbols-outlined text-5xl text-[#52443c]/40">notifications_none</span>
                <p className="text-sm font-bold text-[#1C1410]">Ogeysiis ma jiro</p>
                <p className="text-xs text-[#52443c] leading-relaxed max-w-xs font-medium">Marka admin qalabyada cusub ku daro, ogeysiisyada ayaa halkan ka muuqan doona.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
                {notifications.map((notif) => {
                  const imageUrl = notif.artifact?.image_url || 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=150';
                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-4 rounded-3xl border flex items-center gap-3.5 relative overflow-hidden bg-white shadow-sm transition-all cursor-pointer hover:border-[#5D3C1E]/50 ${
                        !notif.isRead ? 'border-[#5D3C1E] ring-1 ring-[#5D3C1E]/15' : 'border-[#d7c2b8]/50'
                      }`}
                    >
                      <div
                        className="w-14 h-14 rounded-2xl bg-[#f8ebe6] border border-[#d7c2b8] flex items-center justify-center overflow-hidden flex-shrink-0 group"
                      >
                        <img src={imageUrl} alt={notif.title} className="w-full h-full object-contain p-2 transition-transform group-hover:scale-105 mix-blend-multiply" />
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="text-xs font-bold text-[#1C1410] uppercase leading-snug">{notif.title}</h3>
                          <span className="text-[9px] font-bold text-[#52443c] shrink-0">{formatTime(notif.created_at)}</span>
                        </div>
                        <p className="text-xs leading-relaxed text-[#52443c] font-medium">{notif.body}</p>
                      </div>

                      {!notif.isRead && <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#5D3C1E]" />}
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>

      {/* Language Modal */}
      <AnimatePresence>
        {isLangOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsLangOpen(false)} className="absolute inset-0 bg-[#1C1410]/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 240 }}
              className="bg-white w-full max-w-sm rounded-3xl p-6 space-y-4 shadow-xl relative z-50 border border-[#d7c2b8] max-h-[80vh] overflow-y-auto mb-16"
            >
              <div className="text-center pb-3 border-b border-[#d7c2b8]">
                <h3 className="text-sm font-bold text-[#1C1410] uppercase tracking-wider">{translate(currentLang, 'selectLanguage')}</h3>
              </div>

              <div className="space-y-2.5 pt-2">
                {[
                  { code: 'Somali', native: 'Soomaali', display: 'Somali (Default)' },
                  { code: 'English', native: 'English', display: 'English' },
                  { code: 'Arabic', native: 'العربية', display: 'Arabic' },
                ].map((lang) => {
                  const isSelected = currentLang === lang.code;
                  return (
                    <button key={lang.code} type="button"
                      onClick={() => { onLanguageChange(lang.code as Language); setTimeout(() => setIsLangOpen(false), 200); }}
                      className={`w-full text-left px-5 py-4 rounded-2xl border flex justify-between items-center transition-all ${
                        isSelected ? 'bg-[#f8ebe6] border-[#5D3C1E] text-[#1C1410] font-bold' : 'bg-white border-[#d7c2b8] text-[#52443c] hover:bg-[#f8ebe6]/40 font-medium'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs tracking-wide uppercase">{lang.native}</span>
                        <span className="text-[10px] text-[#52443c] mt-0.5">{lang.display}</span>
                      </div>
                      {isSelected
                        ? <span className="material-symbols-outlined text-[#5D3C1E] text-xl">check_circle</span>
                        : <span className="w-5 h-5 rounded-full border border-[#d7c2b8]" />
                      }
                    </button>
                  );
                })}
              </div>

              <button type="button" onClick={() => setIsLangOpen(false)}
                className="w-full bg-[#f8ebe6] hover:bg-[#EDE0CE] text-[#5D3C1E] border border-[#d7c2b8] py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all mt-4"
              >
                Close / Xidh
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
