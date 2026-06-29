import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Artifact } from '../types';
import { Language, translate } from '../translations';

const PRESET_IMAGES = [
  { name: 'Aqal Soomaali', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAputDTt1eNoLZ2juMB78heElx45i9-dCZ5nfQpFn1OP2uDpdCb7NY_C6PGf3EqwS7ECAjEoNkPrfV4xLoEhB5rVc8c4JTvUvzzzTCTa9r_b6PpNhsOfXLJ5vWljXotIS5rlzERb0K2rBMkQp8nGLlsR-TCI1u2FkTk46-LY7NbB6ZPRqnhEbp1ySNpfwgtwe6bUmYHXiysN7Nce2E8PxRbtF2ta2tOgG9tEhSrVHdpLoZU5KHV8GUmsQQ6Rwm7K1cJmXMHypZRF6Q' },
  { name: 'Dhiil', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASjxaFK62sKQuBl2NAxoqkt8-6Pfxb21PFnNX6k8wxmUZNmGgM9UWtTRGF2B2Hv3wStyr1gBRthZMOuES7BzIbsD_r5GG2fsYrnrDsgAjLrENdctSTNV-JeLgTk86h9SjL-oHtUjJra3dB3R6I0MasKOGxdXI6l6SZQVfadJ8A27YBz2j-BCLGmmKc5F4t8lcR8Gsj6Os_CF4g3z8uu8OG-Tt2LqNz2mSiGCxTnxIHRBaF_dyDsXjZWI7L_Nk8KA4iarOFF3Jev-Q' },
  { name: 'Barkin', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBfoL5uBNS5-m-RZXmP4Ik-VuN6yCSyO6qdIvbWOibzaMsPJm6Q5BnJ0YScv4VNOyWYCqEY6MFJco0y4W7OKiPBA--aUYvm7ucNfj7DxhNvMQ48cMG3rpVs5-KvZE3yxAoand_5dFQIwXE1sJzXeT9K3rxRSi3mknKh8o7T4-qELVMatYZSH59QpowK6tjxqVJw68iR_oRUXTNvNk31OT-WLnnKD4vBWupW1Ukor96qP9BxwFH91OhlFrR_9o-PxaiTodYii0X4Nfg' },
  { name: 'Mooye', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDohYD9wdh7B54pXLOb_jP7IH_33lgZgnGLoEF28rHq8SGRQTCZfXeqVameDqI7p3nSwFWExgF5UV2-4wWx016NJRTLAQ8Z_2segLfZfhsIEKQBerIIykXU_mt1OD3gjAeVP4oHyrhTDclXhuYDnxl8xD_W4s-1yH08EEWwXoJ-ADkg3cY25bICRvu4667T81Fg_X8xSU99nzF4UnVUOLHPF9qRR2Uftkp5jdcdvDZ1zi9E3wCYosy6A4Jr5rQqRZZoWfAdsZLj4HU' },
];

interface HomeScreenProps {
  artifacts: Artifact[];
  categories: string[];
  likedIds: string[];
  onToggleLike: (id: string) => void;
  onSelectArtifact: (artifact: Artifact) => void;
  onShowCameraAlert: () => void;
  currentLang: Language;
  onAddArtifact: (data: { name: string; category: string; description: string; long_description: string; image_url: string }) => void;
  isAdmin?: boolean;
  isLoading?: boolean;
}

export default function HomeScreen({
  artifacts,
  categories,
  likedIds,
  onToggleLike,
  onSelectArtifact,
  onShowCameraAlert,
  currentLang,
  onAddArtifact,
  isAdmin = false,
  isLoading = false,
}: HomeScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState(categories[0] || '');
  const [newDesc, setNewDesc] = useState('');
  const [newLongDesc, setNewLongDesc] = useState('');
  const [selectedImageUrl, setSelectedImageUrl] = useState(PRESET_IMAGES[0].url);

  const filteredArtifacts = artifacts.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newDesc.trim() || !newLongDesc.trim()) return;
    onAddArtifact({
      name: newName,
      category: newCategory || categories[0],
      description: newDesc,
      long_description: newLongDesc,
      image_url: selectedImageUrl,
    });
    setNewName(''); setNewDesc(''); setNewLongDesc('');
    setSelectedImageUrl(PRESET_IMAGES[0].url);
    setIsAddOpen(false);
  };

  const allCategories = ['All', ...categories];

  return (
    <div className="w-full max-w-7xl mx-auto px-5 md:px-8 pt-4 pb-28 space-y-8 bg-[#F7F3EE] text-[#1C1410]">
      {/* Search Bar & Camera Button */}
      <div className="sticky top-0 z-20 bg-[#F7F3EE] py-3 -mx-5 px-5 md:-mx-8 md:px-8 border-b border-[#d7c2b8]/30">
        <div className="max-w-3xl mx-auto w-full flex items-center gap-3">
          <div className="flex-1 bg-white rounded-2xl md:rounded-3xl flex items-center px-5 py-3.5 shadow-sm border border-[#d7c2b8] focus-within:border-[#5D3C1E] transition-all">
            <span className="material-symbols-outlined text-[#52443c]/50 mr-3 text-xl">search</span>
            <input
              className="bg-transparent border-none outline-none w-full text-sm text-[#1C1410] placeholder:text-[#52443c]/40 focus:ring-0 p-0 font-medium"
              placeholder={translate(currentLang, 'searchPlaceholder')}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} className="text-[#52443c]/50 hover:text-[#1C1410] p-1 rounded-full">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onShowCameraAlert}
            className="w-12 h-12 bg-[#5D3C1E] rounded-2xl flex items-center justify-center text-[#F7F3EE] hover:bg-[#1C1410] active:scale-95 transition-all flex-shrink-0 shadow-sm"
          >
            <span className="material-symbols-outlined text-xl">photo_camera</span>
          </button>
        </div>
      </div>

      {/* Categories — very sleek, rounded-2xl tabs */}
      <div className="w-full mr-0 ml-0 overflow-x-auto hide-scrollbar py-1">
        <div className="max-w-3xl mx-auto flex flex-nowrap justify-start gap-2 w-full px-1">
          {allCategories.map((cat) => {
            const isActive = selectedCategory === cat;
            const label = cat === 'All' ? translate(currentLang, 'categoryAll') : cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 whitespace-nowrap px-5 py-2.5 rounded-2xl text-xs font-semibold tracking-wide transition-all duration-150 ${
                  isActive ? 'bg-[#5D3C1E] text-[#F7F3EE] shadow-sm' : 'bg-white border border-[#d7c2b8] text-[#52443c] hover:bg-[#f8ebe6]/50'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Admin Add Button */}
      {isAdmin && (
        <div className="max-w-3xl mx-auto w-full">
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="w-full bg-white hover:bg-[#f8ebe6]/40 border border-[#d7c2b8] text-[#5D3C1E] rounded-2xl p-4 flex items-center justify-center gap-2.5 font-bold text-sm transition-all shadow-sm active:scale-[0.99]"
          >
            <span className="material-symbols-outlined text-[#5D3C1E]">add_circle</span>
            {translate(currentLang, 'addArtifact')}
          </button>
        </div>
      )}

      {/* Section Header */}
      <section className="space-y-6">
        <h2 className="text-xs font-bold text-[#52443c] uppercase tracking-widest text-center md:text-left">
          {translate(currentLang, 'subtitle')}
        </h2>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <span className="material-symbols-outlined text-4xl text-[#5D3C1E] animate-spin">progress_activity</span>
            <p className="text-xs font-semibold text-[#52443c]">Fadlan sug...</p>
          </div>
        )}

        {/* Empty */}
        {!isLoading && filteredArtifacts.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#d7c2b8] max-w-md mx-auto">
            <span className="material-symbols-outlined text-5xl text-[#52443c]/40 mb-4">search_off</span>
            <p className="text-sm font-semibold text-[#52443c]">{translate(currentLang, 'noArtifacts')}</p>
          </div>
        )}

        {/* Artifact Cards */}
        {!isLoading && filteredArtifacts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredArtifacts.map((artifact, index) => {
              const isLiked = likedIds.includes(artifact.id);
              return (
                <motion.article
                  key={artifact.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white rounded-3xl overflow-hidden border border-[#d7c2b8] relative group flex flex-col transition-all duration-300 hover:border-[#5D3C1E]/50"
                >
                  {/* Container for the artifact image with exact background set to Light Cream (#f8ebe6) or Accent/Cream (#EDE0CE) */}
                  <div
                    onClick={() => onSelectArtifact(artifact)}
                    className="w-full h-48 bg-[#f8ebe6] flex items-center justify-center cursor-pointer overflow-hidden relative border-b border-[#d7c2b8]"
                  >
                    <img
                      alt={artifact.name}
                      className="w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-105 mix-blend-multiply"
                      src={artifact.image_url}
                    />
                  </div>

                  <div className="p-5 flex flex-col justify-center min-w-0 flex-1 bg-white">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h3
                        onClick={() => onSelectArtifact(artifact)}
                        className="text-[#1C1410] font-bold text-base tracking-tight uppercase hover:text-[#5D3C1E] cursor-pointer truncate flex-1"
                      >
                        {artifact.name}
                      </h3>

                      {/* Global favorites count from DB */}
                      <button
                        type="button"
                        onClick={() => onToggleLike(artifact.id)}
                        className="bg-[#f8ebe6] hover:bg-[#EDE0CE] border border-[#d7c2b8] rounded-full px-2.5 py-1 flex items-center gap-1 transition-colors active:scale-90"
                      >
                        <span className={`material-symbols-outlined text-[10px] ${isLiked ? 'fill text-[#5D3C1E]' : 'text-[#52443c]'}`}>
                          favorite
                        </span>
                        <span className="text-[10px] font-bold text-[#1C1410] leading-none">
                          {typeof artifact.favorites_count === 'number' && !isNaN(artifact.favorites_count) ? artifact.favorites_count : 0}
                        </span>
                      </button>
                    </div>

                    <p className="text-xs leading-relaxed text-[#52443c] font-medium line-clamp-3">
                      {artifact.description}
                    </p>
                    <button
                      type="button"
                      onClick={() => onSelectArtifact(artifact)}
                      className="text-xs font-bold text-[#835331] hover:text-[#5D3C1E] mt-3 hover:underline text-left self-start uppercase tracking-wider"
                    >
                      seemore
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </section>

      {/* Add Artifact Modal */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsAddOpen(false)}
              className="absolute inset-0 bg-[#1C1410]/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 240 }}
              className="bg-white w-full max-w-md rounded-3xl p-6 space-y-5 shadow-xl relative z-50 border border-[#d7c2b8] flex flex-col max-h-[85vh] overflow-y-auto mb-16 text-[#1C1410]"
            >
              <div className="text-center pb-3 border-b border-[#d7c2b8]">
                <h3 className="text-sm font-bold text-[#1C1410] uppercase tracking-wider">{translate(currentLang, 'formTitle')}</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#5D3C1E] uppercase tracking-wider ml-1">{translate(currentLang, 'formName')}</label>
                  <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-[#f8ebe6] border border-[#d7c2b8] rounded-2xl px-4 py-3.5 text-xs font-medium focus:outline-none focus:border-[#5D3C1E] focus:ring-2 focus:ring-[#5D3C1E]/10 text-[#1C1410]"
                    placeholder="e.g. KOORTA"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#5D3C1E] uppercase tracking-wider ml-1">{translate(currentLang, 'formCategory')}</label>
                  <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-[#f8ebe6] border border-[#d7c2b8] rounded-2xl px-4 py-3.5 text-xs font-medium focus:outline-none focus:border-[#5D3C1E] focus:ring-2 focus:ring-[#5D3C1E]/10 text-[#1C1410] appearance-none cursor-pointer"
                  >
                    {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#5D3C1E] uppercase tracking-wider ml-1">{translate(currentLang, 'formShortDesc')}</label>
                  <input type="text" required value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full bg-[#f8ebe6] border border-[#d7c2b8] rounded-2xl px-4 py-3.5 text-xs font-medium focus:outline-none focus:border-[#5D3C1E] focus:ring-2 focus:ring-[#5D3C1E]/10 text-[#1C1410]"
                    placeholder="Brief description..."
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#5D3C1E] uppercase tracking-wider ml-1">{translate(currentLang, 'formLongDesc')}</label>
                  <textarea required rows={3} value={newLongDesc} onChange={(e) => setNewLongDesc(e.target.value)}
                    className="w-full bg-[#f8ebe6] border border-[#d7c2b8] rounded-2xl px-4 py-3.5 text-xs font-medium focus:outline-none focus:border-[#5D3C1E] focus:ring-2 focus:ring-[#5D3C1E]/10 text-[#1C1410] resize-none"
                    placeholder="Complete historical background..."
                  />
                </div>

                <div className="flex flex-col space-y-2">
                  <label className="text-[10px] font-bold text-[#5D3C1E] uppercase tracking-wider ml-1">{translate(currentLang, 'formImage')}</label>
                  <div className="grid grid-cols-4 gap-2">
                    {PRESET_IMAGES.map((img) => (
                      <button key={img.url} type="button" onClick={() => setSelectedImageUrl(img.url)}
                        className={`p-1.5 bg-[#F7F3EE] rounded-2xl border flex flex-col items-center justify-center transition-all ${
                          selectedImageUrl === img.url ? 'border-[#5D3C1E] ring-2 ring-[#5D3C1E]/10' : 'border-transparent hover:border-[#d7c2b8]'
                        }`}
                      >
                        <img src={img.url} alt={img.name} className="w-10 h-10 object-contain mix-blend-multiply" />
                        <span className="text-[8px] font-bold text-[#1C1410] truncate max-w-full text-center mt-1">{img.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3">
                  <button type="button" onClick={() => setIsAddOpen(false)}
                    className="bg-[#f8ebe6] hover:bg-[#EDE0CE] text-[#5D3C1E] border border-[#d7c2b8] font-bold py-3 px-4 rounded-2xl text-xs uppercase tracking-wider transition-all"
                  >
                    {translate(currentLang, 'btnCancel')}
                  </button>
                  <button type="submit"
                    className="bg-[#5D3C1E] hover:bg-[#1C1410] text-[#F7F3EE] font-bold py-3 px-4 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-sm"
                  >
                    {translate(currentLang, 'btnSubmit')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
