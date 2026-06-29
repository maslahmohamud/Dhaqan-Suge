import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Artifact } from '../types';
import { Language, translate } from '../translations';

interface DetailModalProps {
  artifact: Artifact | null;
  onClose: () => void;
  isLiked: boolean;
  onToggleLike: (id: string) => void;
  currentLang: Language;
}

export default function DetailModal({ artifact, onClose, isLiked, onToggleLike, currentLang }: DetailModalProps) {
  if (!artifact) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 pointer-events-none md:flex md:items-center md:justify-center md:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#1C1410]/40 backdrop-blur-sm pointer-events-auto cursor-pointer hidden md:block"
        />
        <motion.div 
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 240 }}
          className="fixed inset-0 md:relative z-50 bg-[#F7F3EE] max-w-lg md:max-w-2xl mx-auto w-full h-full md:h-auto md:max-h-[90vh] overflow-y-auto flex flex-col pointer-events-auto md:rounded-3xl md:shadow-2xl border border-[#d7c2b8] text-[#1C1410]"
        >
          {/* Header Image Cover with Light Cream background */}
          <div className="relative w-full h-80 bg-[#f8ebe6] flex items-center justify-center overflow-hidden border-b border-[#d7c2b8] flex-shrink-0">
            <img 
              src={artifact.image_url} 
              alt={artifact.name} 
              className="w-full h-full object-contain p-6 mix-blend-multiply"
            />
            {/* Back/Close Button top-left */}
            <button 
              type="button"
              onClick={onClose}
              className="absolute top-5 left-5 w-11 h-11 rounded-full bg-white border border-[#d7c2b8] text-[#1C1410] flex items-center justify-center shadow-sm transition-all active:scale-95 hover:bg-[#f8ebe6]/50"
              aria-label="Back"
            >
              <span className="material-symbols-outlined font-bold text-xl text-[#5D3C1E]">arrow_back</span>
            </button>

            {/* Favorite toggle top-right */}
            <button 
              type="button"
              onClick={() => onToggleLike(artifact.id)}
              className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white border border-[#d7c2b8] text-[#1C1410] flex items-center justify-center shadow-sm transition-all active:scale-95 hover:bg-[#f8ebe6]/50"
              aria-label="Toggle Favorite"
            >
              <span className={`material-symbols-outlined text-xl ${isLiked ? 'fill text-[#5D3C1E]' : 'text-[#52443c]'}`}>
                favorite
              </span>
            </button>

            {/* Category tag */}
            <span className="absolute bottom-5 left-5 bg-[#5D3C1E] text-[#F7F3EE] text-xs font-bold px-4 py-2.5 rounded-2xl shadow-sm uppercase tracking-wider">
              {artifact.category}
            </span>
          </div>

          {/* Core Content Body */}
          <div className="p-6 flex-1 space-y-6 bg-[#F7F3EE]">
            <div className="flex justify-between items-center gap-4">
              <h2 className="text-2xl font-bold text-[#1C1410] tracking-tight uppercase">
                {artifact.name}
              </h2>
              
              {/* Hearts Count Pill */}
              <div className="bg-[#f8ebe6] border border-[#d7c2b8] rounded-2xl px-3 py-1.5 flex items-center gap-1.5 flex-shrink-0">
                <span className="material-symbols-outlined fill text-sm text-[#5D3C1E]">favorite</span>
                <span className="text-xs font-bold text-[#1C1410]">
                  {typeof artifact.favorites_count === 'number' && !isNaN(artifact.favorites_count) ? artifact.favorites_count : 0}
                </span>
              </div>
            </div>

            <div className="border-t border-[#d7c2b8] pt-5 space-y-3">
              <h4 className="text-xs font-bold uppercase text-[#52443c] tracking-wider">
                {translate(currentLang, 'historyTitle')}
              </h4>
              <p className="text-sm text-[#1C1410] leading-relaxed whitespace-pre-line font-medium pb-8">
                {artifact.long_description}
              </p>
            </div>
          </div>

          {/* Sticky back/close action bottom footer button */}
          <div className="p-5 border-t border-[#d7c2b8] bg-[#F7F3EE] sticky bottom-0 mt-auto flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="w-full bg-[#5D3C1E] hover:bg-[#1C1410] text-[#F7F3EE] py-4 rounded-2xl text-sm font-bold shadow-sm active:scale-[0.98] transition-all text-center uppercase tracking-wide"
            >
              {translate(currentLang, 'backToHome')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
