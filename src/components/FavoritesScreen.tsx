import React from 'react';
import { motion } from 'motion/react';
import { Artifact } from '../types';
import { Language, translate } from '../translations';

interface FavoritesScreenProps {
  artifacts: Artifact[];
  likedIds: string[];
  onToggleLike: (id: string) => void;
  onSelectArtifact: (artifact: Artifact) => void;
  onBackToHome: () => void;
  currentLang: Language;
}

export default function FavoritesScreen({
  artifacts,
  likedIds,
  onToggleLike,
  onSelectArtifact,
  onBackToHome,
  currentLang,
}: FavoritesScreenProps) {
  const favoriteArtifacts = artifacts.filter((item) => likedIds.includes(item.id));

  return (
    <div className="w-full max-w-7xl mx-auto pb-28 flex flex-col min-h-screen bg-[#F7F3EE] text-[#1C1410]">
      <header className="bg-[#F7F3EE] border-b border-[#d7c2b8]/30 pt-8 pb-4 px-5 flex justify-between items-center text-[#1C1410] relative z-10 w-full mx-auto">
        <button
          type="button"
          onClick={onBackToHome}
          className="w-10 h-10 rounded-full bg-white border border-[#d7c2b8] flex items-center justify-center hover:bg-[#f8ebe6]/50 transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined text-[#5D3C1E] text-lg font-bold">arrow_back</span>
        </button>
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined fill text-[#5D3C1E] text-[18px]">favorite</span>
          <span className="text-xs font-bold uppercase tracking-wider text-[#1C1410]">{translate(currentLang, 'savedTitle')}</span>
        </div>
        <div className="w-10 h-10" />
      </header>

      <main className="flex-1 px-5 pt-6 flex flex-col gap-6">
        {/* Stats bar */}
        <div className="flex justify-between items-center border-b border-[#d7c2b8]/30 pb-4">
          <h2 className="text-xs font-bold text-[#52443c] uppercase tracking-wider">
            {translate(currentLang, 'savedSubtitle')}
          </h2>
          <div className="flex items-center gap-1 bg-[#f8ebe6] text-[#5D3C1E] border border-[#d7c2b8] rounded-2xl py-1 px-3 text-[10px] font-bold">
            <span>{translate(currentLang, 'savedBadge')}</span>
            <span className="bg-[#5D3C1E] text-[#F7F3EE] text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center ml-1">
              {likedIds.length}
            </span>
          </div>
        </div>

        {favoriteArtifacts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#d7c2b8] max-w-md mx-auto mt-6">
            <span className="material-symbols-outlined text-5xl text-[#52443c]/40 mb-4">favorite_border</span>
            <h3 className="text-sm font-bold text-[#1C1410] mb-1">{translate(currentLang, 'savedTitle')}</h3>
            <p className="text-xs text-[#52443c] leading-relaxed max-w-[220px] mx-auto font-medium mb-6">
              {translate(currentLang, 'emptySaved')}
            </p>
            <button
              type="button"
              onClick={onBackToHome}
              className="w-full bg-[#5D3C1E] hover:bg-[#1C1410] text-[#F7F3EE] text-xs font-bold py-3.5 px-6 rounded-2xl shadow-sm active:scale-95 transition-all uppercase tracking-wide"
            >
              {translate(currentLang, 'home')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favoriteArtifacts.map((artifact, index) => (
              <motion.article
                key={artifact.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white rounded-3xl overflow-hidden border border-[#d7c2b8] relative group flex flex-col transition-all duration-300 hover:border-[#5D3C1E]/50"
              >
                {/* Image container styled with #f8ebe6 for seamless blending */}
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

                    {/* Global favorites_count */}
                    <button
                      type="button"
                      onClick={() => onToggleLike(artifact.id)}
                      className="bg-[#f8ebe6] hover:bg-[#EDE0CE] border border-[#d7c2b8] rounded-full px-2.5 py-1 flex items-center gap-1 transition-colors active:scale-90"
                    >
                      <span className="material-symbols-outlined fill text-[#5D3C1E] text-[10px]">favorite</span>
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
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
