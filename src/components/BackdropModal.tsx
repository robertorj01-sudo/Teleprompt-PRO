import React, { useState } from 'react';
import { BackdropDef, BackdropId, TeleprompterSettings } from '../types/teleprompter';
import { BACKDROP_THEMES } from '../utils/backdropThemes';
import { AppLanguage } from '../utils/i18n';
import { X, Check, Sliders, Image, Sparkles, Building2, BookOpen, Video, Home, Eye } from 'lucide-react';

interface BackdropModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
  settings: TeleprompterSettings;
  onUpdateSettings: (updater: (prev: TeleprompterSettings) => TeleprompterSettings) => void;
}

export const BackdropModal: React.FC<BackdropModalProps> = ({
  isOpen,
  onClose,
  lang,
  settings,
  onUpdateSettings,
}) => {
  const isEn = lang === 'en';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: isEn ? 'All Backdrops' : 'Todos os Cenários' },
    { id: 'corporate', label: isEn ? 'Corporate' : 'Corporativo' },
    { id: 'library', label: isEn ? 'Library' : 'Biblioteca' },
    { id: 'creator', label: isEn ? 'Studio & Creator' : 'Estúdio & Criador' },
    { id: 'classic', label: isEn ? 'Classic Black' : 'Preto Neutro' },
  ];

  const filteredThemes = BACKDROP_THEMES.filter((theme) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'corporate') return theme.id === 'modern-office' || theme.id === 'boardroom';
    if (selectedCategory === 'library') return theme.id === 'classic-library';
    if (selectedCategory === 'creator') return theme.id === 'podcast-studio' || theme.id === 'cozy-home-office';
    if (selectedCategory === 'classic') return theme.id === 'none';
    return true;
  });

  const handleSelectBackdrop = (theme: BackdropDef) => {
    onUpdateSettings((prev) => ({
      ...prev,
      backdropId: theme.id,
      backdropBlur: theme.recommendedBlur,
      backdropOverlay: theme.recommendedOverlay,
    }));
  };

  const currentTheme = BACKDROP_THEMES.find((t) => t.id === settings.backdropId) || BACKDROP_THEMES[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Image className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>{isEn ? 'Virtual Studio Backdrops' : 'Panos de Fundo & Cenários de Estúdio'}</span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider">
                  {isEn ? 'Immersive' : 'Imersivo'}
                </span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                {isEn
                  ? 'Choose an eye-catching background (Office, Boardroom, Library, Studio) with cinema depth of field.'
                  : 'Escolha um pano de fundo chamativo (Escritório, Sala de Reunião, Biblioteca, Estúdio) com desfoque cinemático.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label={isEn ? 'Close' : 'Fechar'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 bg-neutral-950/40 border-b border-neutral-800/80 overflow-x-auto no-scrollbar shrink-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-black font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Grid of Eye-Catching Backdrops */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredThemes.map((theme) => {
              const isSelected = settings.backdropId === theme.id;
              return (
                <div
                  key={theme.id}
                  onClick={() => handleSelectBackdrop(theme)}
                  className={`group relative flex flex-col rounded-xl overflow-hidden border transition-all duration-200 cursor-pointer text-left bg-neutral-950/60 ${
                    isSelected
                      ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-lg shadow-amber-500/10'
                      : 'border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/40'
                  }`}
                >
                  {/* Thumbnail Preview */}
                  <div className="relative aspect-video w-full overflow-hidden bg-neutral-950">
                    {theme.imageUrl ? (
                      <img
                        src={theme.imageUrl}
                        alt={isEn ? theme.nameEn : theme.namePt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-black text-neutral-500 p-3">
                        <Eye className="w-8 h-8 mb-1.5 opacity-50" />
                        <span className="text-[11px] font-mono uppercase tracking-wider">
                          {isEn ? 'Neutral Pure Black' : 'Preto Neutro Puro'}
                        </span>
                      </div>
                    )}

                    {/* Dark gradient overlay for text readability on card */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                    {/* Badge */}
                    {theme.badge && (
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wide uppercase bg-black/75 backdrop-blur-xs text-amber-300 border border-amber-400/30">
                          {theme.badge}
                        </span>
                      </div>
                    )}

                    {/* Selected Checkmark */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-amber-500 text-black flex items-center justify-center font-bold shadow-md">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}

                    {/* Bottom Title inside image */}
                    <div className="absolute bottom-2 left-3 right-3">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 block">
                        {isEn ? theme.categoryEn : theme.categoryPt}
                      </span>
                      <h3 className="text-sm font-bold text-white truncate drop-shadow-sm">
                        {isEn ? theme.nameEn : theme.namePt}
                      </h3>
                    </div>
                  </div>

                  {/* Card Description */}
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                      {isEn ? theme.descriptionEn : theme.descriptionPt}
                    </p>
                    <div className="mt-2.5 pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[11px]">
                      <span className="text-neutral-500">
                        {theme.id === 'none' ? (isEn ? 'Contrast: 100%' : 'Contraste: 100%') : isEn ? 'Lens Blur: ~4px' : 'Desfoque: ~4px'}
                      </span>
                      <span
                        className={`font-semibold ${
                          isSelected ? 'text-amber-400' : 'text-neutral-400 group-hover:text-white'
                        }`}
                      >
                        {isSelected ? (isEn ? 'Selected' : 'Ativo') : isEn ? 'Select' : 'Escolher'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Fine Tuning Controls (When a backdrop image is active) */}
          {settings.backdropId !== 'none' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {isEn ? 'Lens & Contrast Tuning' : 'Ajustes de Lente e Contraste do Cenário'}
                  </span>
                </div>
                <span className="text-xs text-neutral-400">
                  {isEn ? 'Active:' : 'Ativo:'} <strong className="text-amber-400">{isEn ? currentTheme.nameEn : currentTheme.namePt}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Desfoque Cinemático / Bokeh */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-300 font-medium">
                      {isEn ? 'Cinematic Blur (Depth of Field)' : 'Desfoque Cinemático (Profundidade Bokeh)'}
                    </span>
                    <span className="font-mono text-amber-400 font-bold tabular-nums">
                      {settings.backdropBlur}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="14"
                    step="1"
                    value={settings.backdropBlur}
                    onChange={(e) =>
                      onUpdateSettings((prev) => ({
                        ...prev,
                        backdropBlur: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-amber-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                    <span>{isEn ? '0px (Sharp)' : '0px (Nítido)'}</span>
                    <span>{isEn ? '4px (Natural f/2.8)' : '4px (Lente f/2.8)'}</span>
                    <span>{isEn ? '14px (Soft Bokeh)' : '14px (Bokeh Suave)'}</span>
                  </div>
                </div>

                {/* Escurecimento / Legibilidade */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-300 font-medium">
                      {isEn ? 'Darkness Overlay (Text Readability)' : 'Escurecimento do Fundo (Contraste do Texto)'}
                    </span>
                    <span className="font-mono text-cyan-400 font-bold tabular-nums">
                      {Math.round(settings.backdropOverlay * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="0.9"
                    step="0.05"
                    value={settings.backdropOverlay}
                    onChange={(e) =>
                      onUpdateSettings((prev) => ({
                        ...prev,
                        backdropOverlay: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-cyan-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                    <span>{isEn ? '20% (Vibrant Scene)' : '20% (Cenário Nítido)'}</span>
                    <span>{isEn ? '65% (Balanced)' : '65% (Equilibrado)'}</span>
                    <span>{isEn ? '90% (Maximum Contrast)' : '90% (Contraste Alto)'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-neutral-800 bg-neutral-950/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => {
              onUpdateSettings((prev) => ({
                ...prev,
                backdropId: 'none',
                backdropBlur: 0,
                backdropOverlay: 1.0,
              }));
            }}
            className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            {isEn ? '← Reset to Plain Black' : '← Voltar para Fundo Preto Puro'}
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wide transition-all shadow-md active:scale-95 cursor-pointer"
          >
            {isEn ? 'Apply & Close' : 'Aplicar e Fechar'}
          </button>
        </div>
      </div>
    </div>
  );
};
