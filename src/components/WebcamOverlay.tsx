import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, RefreshCw, Maximize2, Minimize2, Sparkles, Check } from 'lucide-react';
import { VideoFilterId } from '../types/teleprompter';
import { VIDEO_FILTERS, getVideoFilterCss } from '../utils/videoFilters';
import { AppLanguage } from '../utils/i18n';

interface WebcamOverlayProps {
  enabled: boolean;
  onClose: () => void;
  videoFilter?: VideoFilterId;
  onSelectFilter?: (filterId: VideoFilterId) => void;
  lang?: AppLanguage;
}

export const WebcamOverlay: React.FC<WebcamOverlayProps> = ({
  enabled,
  onClose,
  videoFilter = 'normal',
  onSelectFilter,
  lang = 'pt',
}) => {
  const isEn = lang === 'en';
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState<'top-right' | 'top-left' | 'bottom-right'>('top-right');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showFilterPicker, setShowFilterPicker] = useState<boolean>(false);

  useEffect(() => {
    if (!enabled) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      return;
    }

    let isMounted = true;
    setError(null);

    navigator.mediaDevices
      ?.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 } } })
      .then((stream) => {
        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.warn('Erro ao acessar webcam:', err);
        if (isMounted) {
          setError(
            isEn
              ? 'Webcam access unavailable or permission not granted.'
              : 'Acesso à webcam indisponível ou permissão não concedida.'
          );
        }
      });

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [enabled, isEn]);

  if (!enabled) return null;

  const positionClasses = {
    'top-right': 'top-14 sm:top-16 right-3 sm:right-6',
    'top-left': 'top-14 sm:top-16 left-3 sm:left-6',
    'bottom-right': 'bottom-20 sm:bottom-24 right-3 sm:right-6',
  }[position];

  const currentFilterCss = getVideoFilterCss(videoFilter);
  const activeFilterDef = VIDEO_FILTERS.find((f) => f.id === videoFilter) || VIDEO_FILTERS[0];

  return (
    <div
      className={`fixed ${positionClasses} z-40 rounded-2xl overflow-hidden border border-white/20 bg-neutral-900 shadow-2xl transition-all duration-200 select-none ${
        isExpanded ? 'w-72 sm:w-80 h-52 sm:h-60' : 'w-44 sm:w-52 h-32 sm:h-38'
      }`}
    >
      {/* Top mini header */}
      <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/85 via-black/50 to-transparent p-2 flex items-center justify-between text-white z-20">
        <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-wider uppercase text-amber-400">
          <Camera className="w-3 h-3" />
          <span className="hidden sm:inline">Webcam</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Filter toggle button */}
          <button
            onClick={() => setShowFilterPicker(!showFilterPicker)}
            className={`p-1 rounded transition-colors cursor-pointer ${
              videoFilter !== 'normal'
                ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                : 'hover:bg-white/20 text-neutral-300 hover:text-white'
            }`}
            title={isEn ? 'Choose video filter' : 'Escolher filtro de vídeo'}
            aria-label={isEn ? 'Video filters' : 'Filtros de vídeo'}
          >
            <Sparkles className="w-3 h-3" />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded hover:bg-white/20 text-neutral-300 hover:text-white cursor-pointer"
            title={isEn ? 'Toggle size' : 'Alternar tamanho'}
            aria-label={isEn ? 'Resize' : 'Redimensionar'}
          >
            {isExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </button>

          <button
            onClick={() => {
              setPosition((prev) =>
                prev === 'top-right' ? 'top-left' : prev === 'top-left' ? 'bottom-right' : 'top-right'
              );
            }}
            className="p-1 rounded hover:bg-white/20 text-neutral-300 hover:text-white cursor-pointer"
            title={isEn ? 'Change position' : 'Mudar posição'}
            aria-label={isEn ? 'Move' : 'Mover'}
          >
            <RefreshCw className="w-3 h-3" />
          </button>

          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/20 text-neutral-300 hover:text-white cursor-pointer"
            title={isEn ? 'Close webcam' : 'Fechar webcam'}
            aria-label={isEn ? 'Close' : 'Fechar'}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Filter picker popup overlay inside webcam window */}
      {showFilterPicker && (
        <div className="absolute inset-0 bg-neutral-950/95 backdrop-blur-md z-30 p-2.5 flex flex-col text-neutral-100 overflow-hidden">
          <div className="flex items-center justify-between pb-1.5 border-b border-neutral-800 shrink-0">
            <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>{isEn ? '12 Video Filters' : '12 Filtros de Vídeo'}</span>
            </span>
            <button
              onClick={() => setShowFilterPicker(false)}
              className="p-0.5 rounded text-neutral-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-1.5 space-y-1 pr-1 custom-scrollbar">
            {VIDEO_FILTERS.map((f) => {
              const isActive = videoFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => {
                    onSelectFilter?.(f.id);
                    setShowFilterPicker(false);
                  }}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'hover:bg-neutral-800 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: f.accentColor }}
                    />
                    <span className="font-medium truncate text-[11px]">
                      {isEn ? f.nameEn : f.namePt}
                    </span>
                  </div>
                  {isActive && <Check className="w-3 h-3 text-amber-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-neutral-950 text-neutral-400 text-xs">
          <Camera className="w-6 h-6 mb-1 text-neutral-600" />
          <p>{error}</p>
        </div>
      ) : (
        <div className="w-full h-full relative overflow-hidden bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover -scale-x-100 transition-all duration-300"
            style={{ filter: currentFilterCss }}
          />

          {/* Active filter badge at the bottom */}
          {videoFilter !== 'normal' && (
            <div className="absolute bottom-1.5 left-2 pointer-events-none z-10">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[10px] font-mono text-amber-300 border border-amber-400/30">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: activeFilterDef.accentColor }}
                />
                <span className="truncate max-w-[100px]">
                  {isEn ? activeFilterDef.nameEn : activeFilterDef.namePt}
                </span>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
