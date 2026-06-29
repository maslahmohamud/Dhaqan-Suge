import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Artifact, NotificationItem, UserProfile, ScreenType } from './types';
import { Language } from './translations';
import { supabase } from './supabaseClient';
import AuthScreen from './components/AuthScreen';
import HomeScreen from './components/HomeScreen';
import FavoritesScreen from './components/FavoritesScreen';
import ProfileScreen from './components/ProfileScreen';
import DetailModal from './components/DetailModal';
import NavBar from './components/NavBar';

export default function App() {
  const [currentLang, setCurrentLang] = useState<Language>(() => {
    return (localStorage.getItem('dhaqan_suge_lang') as Language) || 'Somali';
  });

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeScreen, setActiveScreen] = useState<ScreenType>('home');
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryObjects, setCategoryObjects] = useState<{ id: string; name: string }[]>([]);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  const [isLoadingArtifacts, setIsLoadingArtifacts] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // ── Restore session on mount ──────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await loadProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await loadProfile(session.user.id);
      } else {
        setProfile(null);
        setLikedIds([]);
        setNotifications([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    let { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!data) {
      // Add a check to verify if the user exists in public.profiles table and sync the profile data.
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const newProfile = {
          id: userId,
          email: session.user.email || '',
          username: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          avatar_url: '',
          is_admin: false,
        };
        const { data: insertedProfile } = await supabase
          .from('profiles')
          .upsert(newProfile, { onConflict: 'id' })
          .select()
          .single();

        data = insertedProfile || newProfile;
      }
    }

    if (data) setProfile(data as UserProfile);
  };

  // ── Load artifacts + categories ───────────────────────────
  useEffect(() => {
    loadCategories().then(() => {
      loadArtifacts();
    });
  }, []);

  const loadArtifacts = async () => {
    setIsLoadingArtifacts(true);
    console.log('%c[Supabase Query] Loading artifacts...', 'color: #3b82f6; font-weight: bold;');

    // Attempt to join with the categories table using foreign key 'category_id' and get user_favorites count
    const { data, error } = await supabase
      .from('artifacts')
      .select(`
        *,
        categories(id, name),
        user_favorites(count)
      `)
      .order('created_at', { ascending: false });

    // Log the raw result so user can inspect it in the browser console
    console.log('%c[Supabase Response] Artifacts with categories & user_favorites relation:', 'color: #10b981; font-weight: bold;', { data, error });

    if (error) {
      console.warn('[Supabase Warning] Joint select with user_favorites failed, trying simple select:', error.message);
      
      const simpleRes = await supabase
        .from('artifacts')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('%c[Supabase Response] Artifacts simple select:', 'color: #f59e0b; font-weight: bold;', { data: simpleRes.data, error: simpleRes.error });

      if (!simpleRes.error && simpleRes.data) {
        // Map the artifacts to make sure 'category' exists even if the db has 'category_id'
        const mapped = simpleRes.data.map((item: any) => {
          let categoryName = item.category;
          // If category is null or undefined but category_id exists, we can try to find the category name from our loaded category objects
          if (!categoryName && item.category_id && categoryObjects.length > 0) {
            const matchedCat = categoryObjects.find(c => c.id === item.category_id);
            if (matchedCat) {
              categoryName = matchedCat.name;
            }
          }
          return {
            ...item,
            category: categoryName || item.category || 'Other'
          };
        });
        setArtifacts(mapped as Artifact[]);
      }
    } else if (data) {
      const mapped = data.map((item: any) => {
        let categoryName = item.category;
        
        // Handle nested categories relation (if categories is a single object or array)
        if (item.categories && typeof item.categories === 'object') {
          categoryName = Array.isArray(item.categories)
            ? item.categories[0]?.name
            : item.categories.name;
        }

        // Fallback to mapping category_id if nested relation is empty but ID exists
        if (!categoryName && item.category_id && categoryObjects.length > 0) {
          const matchedCat = categoryObjects.find(c => c.id === item.category_id);
          if (matchedCat) {
            categoryName = matchedCat.name;
          }
        }

        // Map the favorites count correctly
        let favCount = item.favorites_count;
        if (item.user_favorites && Array.isArray(item.user_favorites)) {
          favCount = item.user_favorites.length > 0 ? (item.user_favorites[0]?.count ?? 0) : 0;
        }

        return {
          ...item,
          category: categoryName || item.category || 'Other',
          favorites_count: typeof favCount === 'number' && !isNaN(favCount) ? favCount : (item.favorites_count || 0)
        };
      });
      setArtifacts(mapped as Artifact[]);
    }
    setIsLoadingArtifacts(false);
  };

  const loadCategories = async () => {
    console.log('%c[Supabase Query] Loading categories...', 'color: #3b82f6; font-weight: bold;');
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .order('sort_order', { ascending: true });

    console.log('%c[Supabase Response] Categories list:', 'color: #10b981; font-weight: bold;', { data, error });

    if (data) {
      setCategoryObjects(data);
      setCategories(data.map((c: any) => c.name));
    }
  };

  // ── Load user favorites from DB ───────────────────────────
  useEffect(() => {
    if (!profile) return;
    loadFavorites();
  }, [profile]);

  const loadFavorites = async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('user_favorites')
      .select('artifact_id')
      .eq('user_id', profile.id);

    if (data) setLikedIds(data.map((f: any) => f.artifact_id));
  };

  // ── Load notifications ────────────────────────────────────
  useEffect(() => {
    if (!profile) return;
    loadNotifications();
    const unsubscribe = subscribeToNotifications();
    return () => {
      unsubscribe();
    };
  }, [profile]);

  const loadNotifications = async () => {
    if (!profile) return;

    // 1. Get read notification ids for this user
    const { data: reads } = await supabase
      .from('user_notification_reads')
      .select('notification_id')
      .eq('user_id', profile.id);

    const readIdsSet = new Set((reads || []).map((r: any) => r.notification_id));

    // 2. Get all notifications with artifact info
    const { data: notifs } = await supabase
      .from('notifications')
      .select('*, artifact:artifact_id(*)')
      .order('created_at', { ascending: false });

    const mapped: NotificationItem[] = (notifs || []).map((n: any) => ({
      ...n,
      isRead: readIdsSet.has(n.id),
    }));

    setNotifications(mapped);
    setUnreadCount(mapped.filter((n) => !n.isRead).length);
  };

  const subscribeToNotifications = () => {
    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        async (payload) => {
          // Fetch artifact info for the new notification
          const newNotif = payload.new as any;
          let artifact = null;
          if (newNotif.artifact_id) {
            const { data } = await supabase
              .from('artifacts')
              .select('*')
              .eq('id', newNotif.artifact_id)
              .single();
            artifact = data;
          }

          const notifWithArtifact: NotificationItem = {
            ...newNotif,
            artifact,
            isRead: false,
          };

          setNotifications((prev) => [notifWithArtifact, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  // ── Realtime: favorites count sync on artifacts ───────────
  useEffect(() => {
    const channel = supabase
      .channel('artifacts-realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'artifacts' },
        (payload) => {
          setArtifacts((prev) =>
            prev.map((a) => {
              if (a.id !== payload.new.id) return a;
              const val = payload.new.favorites_count;
              const safeCount = typeof val === 'number' && !isNaN(val) ? val : 0;
              return { ...a, favorites_count: safeCount };
            })
          );
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // ── Toggle favorite ───────────────────────────────────────
  const handleToggleLike = async (artifactId: string) => {
    if (!profile) {
      showToast('Fadlan marka hore gal koontadaada.', 'error');
      return;
    }

    const isLiked = likedIds.includes(artifactId);

    // Optimistic update
    setLikedIds((prev) =>
      isLiked ? prev.filter((id) => id !== artifactId) : [...prev, artifactId]
    );
    setArtifacts((prev) =>
      prev.map((a) => {
        if (a.id !== artifactId) return a;
        const currentCount = typeof a.favorites_count === 'number' && !isNaN(a.favorites_count) ? a.favorites_count : 0;
        return {
          ...a,
          favorites_count: isLiked ? Math.max(0, currentCount - 1) : currentCount + 1
        };
      })
    );

    if (isLiked) {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', profile.id)
        .eq('artifact_id', artifactId);

      if (error) {
        // Rollback
        setLikedIds((prev) => [...prev, artifactId]);
        setArtifacts((prev) =>
          prev.map((a) => {
            if (a.id !== artifactId) return a;
            const currentCount = typeof a.favorites_count === 'number' && !isNaN(a.favorites_count) ? a.favorites_count : 0;
            return { ...a, favorites_count: currentCount + 1 };
          })
        );
        showToast('Cilad ayaa dhacday.', 'error');
      } else {
        showToast('Waa laga saaray liiska ku kaydsan.', 'info');
      }
    } else {
      const { error } = await supabase
        .from('user_favorites')
        .insert({ user_id: profile.id, artifact_id: artifactId });

      if (error) {
        // Rollback
        setLikedIds((prev) => prev.filter((id) => id !== artifactId));
        setArtifacts((prev) =>
          prev.map((a) => {
            if (a.id !== artifactId) return a;
            const currentCount = typeof a.favorites_count === 'number' && !isNaN(a.favorites_count) ? a.favorites_count : 0;
            return { ...a, favorites_count: Math.max(0, currentCount - 1) };
          })
        );
        showToast('Cilad ayaa dhacday.', 'error');
      } else {
        showToast('Si guul leh ayaa loogu daray liiska!', 'success');
      }
    }
  };

  // ── Add artifact (admin) ──────────────────────────────────
  const handleAddArtifact = async (newArtData: {
    name: string;
    category: string;
    description: string;
    long_description: string;
    image_url: string;
  }) => {
    if (!profile) return;

    // Dynamically match category name to category ID
    const matchedCategory = categoryObjects.find(
      (c) => c.name.toLowerCase() === newArtData.category.toLowerCase()
    );

    const payload: any = {
      name: newArtData.name.toUpperCase(),
      description: newArtData.description,
      long_description: newArtData.long_description,
      image_url: newArtData.image_url,
      created_by: profile.id,
      // Provide both fields so that whatever schema structure is used, it succeeds!
      category: newArtData.category,
      category_id: matchedCategory ? matchedCategory.id : null,
    };

    console.log('%c[Supabase Query] Inserting new artifact payload:', 'color: #3b82f6; font-weight: bold;', payload);

    const { data, error } = await supabase
      .from('artifacts')
      .insert(payload)
      .select()
      .single();

    console.log('%c[Supabase Response] Insert artifact result:', 'color: #10b981; font-weight: bold;', { data, error });

    if (error) {
      showToast('Cilad: ' + error.message, 'error');
      return;
    }

    // Map categories relation name just in case
    const mappedArtifact = {
      ...data,
      category: newArtData.category
    };

    // Artifact + notification auto-created by DB trigger
    setArtifacts((prev) => [mappedArtifact as Artifact, ...prev]);
    showToast('Qalabka cusub si guul leh ayaa loo daray!', 'success');
  };

  // ── Mark notifications read ───────────────────────────────
  const handleMarkNotificationsRead = async () => {
    if (!profile) return;

    const unread = notifications.filter((n) => !n.isRead);
    if (unread.length === 0) return;

    await supabase.from('user_notification_reads').upsert(
      unread.map((n) => ({ user_id: profile.id, notification_id: n.id })),
      { onConflict: 'user_id,notification_id' }
    );

    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleMarkSingleNotificationRead = async (notificationId: string) => {
    if (!profile) return;

    const notif = notifications.find((n) => n.id === notificationId);
    if (!notif || notif.isRead) return;

    await supabase.from('user_notification_reads').upsert(
      [{ user_id: profile.id, notification_id: notificationId }],
      { onConflict: 'user_id,notification_id' }
    );

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  // ── Auth handlers ─────────────────────────────────────────
  const handleLoginSuccess = (p: UserProfile) => {
    setProfile(p);
    showToast(`Kuu soo dhowow, ${p.username}!`, 'success');
    setActiveScreen('home');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setLikedIds([]);
    setNotifications([]);
    setUnreadCount(0);
    showToast('Si guul leh ayaad uga baxday koontadaada.', 'info');
    setActiveScreen('home');
  };

  const handleUpdateProfile = async (updated: Partial<UserProfile>) => {
    if (!profile) return;
    const { error } = await supabase
      .from('profiles')
      .update(updated)
      .eq('id', profile.id);

    if (!error) {
      setProfile((prev) => prev ? { ...prev, ...updated } : prev);
      showToast('Xogta si guul leh ayaa loo kaydiyay.', 'success');
    }
  };

  // ── Scanner ───────────────────────────────────────────────
  const performVisualSearch = async (imageData: string) => {
    setIsScanning(true);
    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData, artifacts }),
      });
      const result = await response.json();
      setIsScanning(false);
      setIsScannerOpen(false);

      if (result.matched && result.artifactId) {
        const matched = artifacts.find((a) => a.id === result.artifactId);
        if (matched) {
          setSelectedArtifact(matched);
          showToast(`Waa la aqoonsaday: ${matched.name}! (${result.confidence}%)`, 'success');
        }
      } else {
        showToast(result.message || 'Ma aanaan helin shay dhaqan oo sawirkan la mid ah', 'error');
      }
    } catch {
      setIsScanning(false);
      showToast('Cilad farsamo ayaa dhacday.', 'error');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setScannedImage(dataUrl);
        performVisualSearch(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  // ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F5F2EA] text-[#4A3728] font-sans overflow-x-hidden relative flex flex-col justify-between w-full max-w-7xl mx-auto shadow-sm md:shadow-2xl md:border-x border-[#d7c2b8]/20">
      <div className="flex-1 w-full relative z-10">
        <AnimatePresence mode="wait">
          {!profile ? (
            <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
              <AuthScreen onLoginSuccess={handleLoginSuccess} />
            </motion.div>
          ) : (
            <motion.div
              key={activeScreen}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              {activeScreen === 'home' && (
                <HomeScreen
                  artifacts={artifacts}
                  categories={categories}
                  likedIds={likedIds}
                  onToggleLike={handleToggleLike}
                  onSelectArtifact={setSelectedArtifact}
                  onShowCameraAlert={() => setIsScannerOpen(true)}
                  currentLang={currentLang}
                  onAddArtifact={handleAddArtifact}
                  isAdmin={profile.is_admin}
                  isLoading={isLoadingArtifacts}
                />
              )}
              {activeScreen === 'favorites' && (
                <FavoritesScreen
                  artifacts={artifacts}
                  likedIds={likedIds}
                  onToggleLike={handleToggleLike}
                  onSelectArtifact={setSelectedArtifact}
                  onBackToHome={() => setActiveScreen('home')}
                  currentLang={currentLang}
                />
              )}
              {activeScreen === 'profile' && (
                <ProfileScreen
                  profile={profile}
                  likedCount={likedIds.length}
                  onLogout={handleLogout}
                  onBackToHome={() => setActiveScreen('home')}
                  onUpdateProfile={handleUpdateProfile}
                  onSelectArtifact={setSelectedArtifact}
                  currentLang={currentLang}
                  onLanguageChange={(lang) => {
                    setCurrentLang(lang);
                    localStorage.setItem('dhaqan_suge_lang', lang);
                  }}
                  notifications={notifications}
                  onMarkNotificationsRead={handleMarkNotificationsRead}
                  onMarkNotificationRead={handleMarkSingleNotificationRead}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {profile && (
        <NavBar
          activeScreen={activeScreen}
          onScreenChange={setActiveScreen}
          currentLang={currentLang}
          unreadNotificationsCount={unreadCount}
        />
      )}

      <DetailModal
        artifact={selectedArtifact}
        onClose={() => setSelectedArtifact(null)}
        isLiked={selectedArtifact ? likedIds.includes(selectedArtifact.id) : false}
        onToggleLike={handleToggleLike}
        currentLang={currentLang}
      />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 left-4 right-4 z-50 flex justify-center pointer-events-none max-w-sm mx-auto"
          >
            <div className={`pointer-events-auto px-5 py-3.5 rounded-2xl shadow-sm border text-xs font-bold flex items-center gap-2.5 ${
              toast.type === 'success' ? 'bg-[#fef1eb] text-[#5D3C1E] border-[#d7c2b8]'
              : toast.type === 'error' ? 'bg-[#ffdad6] text-[#93000a] border-[#ffdad6]'
              : 'bg-white text-[#1C1410] border-[#d7c2b8]'
            }`}>
              <span className="material-symbols-outlined text-sm">
                {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info'}
              </span>
              <span>{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scanner Modal */}
      <AnimatePresence>
        {isScannerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsScannerOpen(false)}
              className="absolute inset-0 bg-[#1C1410]/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm overflow-hidden shadow-xl relative z-10 border border-[#d7c2b8] text-center text-[#1C1410]"
            >
              <button type="button" onClick={() => setIsScannerOpen(false)} className="absolute top-4 right-4 text-[#52443c]/50 hover:text-[#1C1410] p-1">
                <span className="material-symbols-outlined">close</span>
              </button>
              <span className="material-symbols-outlined text-5xl text-[#5D3C1E] mb-2">center_focus_weak</span>
              <h3 className="text-lg font-bold text-[#1C1410] mb-1">AQOONSIGA QALABKA</h3>
              <p className="text-xs text-[#52443c] leading-relaxed mb-6 font-medium">
                Kamarada ku qabo alaabta hidaha iyo dhaqanka Soomaaliyeed si aaladda AI u aqoonsato.
              </p>

              {isScanning ? (
                <div className="py-6 flex flex-col items-center justify-center space-y-3">
                  <div className="relative w-40 h-40 border-4 border-dashed border-[#5D3C1E] rounded-2xl flex items-center justify-center overflow-hidden">
                    {scannedImage && <img src={scannedImage} alt="Scanning" className="w-full h-full object-cover opacity-50 mix-blend-multiply" />}
                    <motion.div
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      className="absolute left-0 w-full h-1 bg-[#5D3C1E] shadow-[0_0_8px_#5D3C1E]"
                    />
                  </div>
                  <span className="text-xs font-bold text-[#5D3C1E] animate-pulse">Waa la baadhayaa, fadlan sug...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="w-full bg-[#f8ebe6] hover:bg-[#EDE0CE]/40 text-[#5D3C1E] border border-[#d7c2b8] py-3.5 px-4 rounded-2xl flex items-center justify-center gap-3.5 cursor-pointer font-bold text-sm transition-all shadow-sm">
                    <span className="material-symbols-outlined">cloud_upload</span>
                    Soo rar masawir qalab
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                  {artifacts.length > 0 && (
                    <div className="pt-4 border-t border-[#d7c2b8]/30 mt-2">
                      <h4 className="text-[10px] font-bold text-[#52443c]/60 uppercase tracking-wider mb-2">Ama Dooro mid ka mid ah qalabka:</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {artifacts.slice(0, 3).map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => { setScannedImage(item.image_url); performVisualSearch(item.image_url); }}
                            className="bg-[#f8ebe6] hover:bg-[#EDE0CE] p-2 rounded-2xl border border-transparent flex flex-col items-center gap-1 active:scale-95 transition-all"
                          >
                            <img src={item.image_url} alt={item.name} className="w-8 h-8 object-contain mix-blend-multiply" />
                            <span className="text-[9px] font-bold text-[#1C1410] truncate max-w-full">{item.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
