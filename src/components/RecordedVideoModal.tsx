import React, { useState } from 'react';
import {
  X,
  Download,
  Lock,
  Crown,
  Play,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Check,
} from 'lucide-react';
import { formatTime } from '../utils/textUtils';
import { LicenseStatus, VideoFilterId } from '../types/teleprompter';
import { VIDEO_FILTERS, getVideoFilterCss, getVideoFilterDef } from '../utils/videoFilters';
import { AppLanguage } from '../utils/i18n';

interface RecordedVideoModalProps {
  lang: AppLanguage;
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string | null;
  durationSeconds: number;
  licenseStatus: LicenseStatus;
  initialFilter?: VideoFilterId;
  onDownload: () => void;
  onOpenUpgradeModal: () => void;
  onDiscard: () => void;
}

export const RecordedVideoModal: React.FC<RecordedVideoModalProps> = ({
  lang,
  isOpen,
  onClose,
  videoUrl,
  durationSeconds,
  licenseStatus,
  initialFilter = 'normal',
  onDownload,
  onOpenUpgradeModal,
  onDiscard,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<VideoFilterId>(initialFilter);
  const isEn = lang === 'en';

  if (!isOpen || !videoUrl) return null;

  const activeFilterDef = getVideoFilterDef(selectedFilter);
  const filterCss = getVideoFilterCss(selectedFilter);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden text-neutral-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {isEn ? 'Your Studio Recording is Ready' : 'Sua Gravação Está Pronta'}
              </h3>
              <p className="text-xs text-neutral-400">
                {isEn ? 'Duration: ' : 'Duração: '}
                <span className="font-mono text-amber-400 font-bold">{formatTime(durationSeconds)}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Preview with Live Filters */}
        <div className="p-4 sm:p-6 overflow-y-auto flex flex-col items-center gap-4">
          <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black border border-neutral-800 shadow-inner relative flex items-center justify-center">
            <video
              src={videoUrl}
              controls
              playsInline
              className="w-full h-full object-contain transition-all duration-300"
              style={{ filter: filterCss }}
            />

            {/* Filter Badge inside preview */}
            {selectedFilter !== 'normal' && (
              <div className="absolute top-3 left-3 pointer-events-none z-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-xs font-medium text-amber-300 border border-amber-400/30 shadow-lg">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: activeFilterDef.accentColor }}
                  />
                  <span>{isEn ? activeFilterDef.nameEn : activeFilterDef.namePt}</span>
                </span>
              </div>
            )}
          </div>

          {/* 12 Video Filters Selector Strip */}
          <div className="w-full bg-neutral-950/70 border border-neutral-800 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-neutral-200">
                  {isEn ? '12 Video Color Grading Filters' : '12 Variações de Filtros de Vídeo'}
                </span>
              </div>
              <span className="text-[11px] text-neutral-400 font-mono">
                {isEn ? activeFilterDef.nameEn : activeFilterDef.namePt}
              </span>
            </div>

            {/* Filter Pills Grid / Horizontal Scroll */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 custom-scrollbar">
              {VIDEO_FILTERS.map((f) => {
                const isSelected = selectedFilter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFilter(f.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm font-semibold'
                        : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border-neutral-800'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: f.accentColor }}
                    />
                    <span>{isEn ? f.nameEn : f.namePt}</span>
                    {isSelected && <Check className="w-3 h-3 text-amber-400 ml-0.5" />}
                  </button>
                );
              })}
            </div>

            <p className="text-[11px] text-neutral-400 italic">
              {isEn ? activeFilterDef.descriptionEn : activeFilterDef.descriptionPt}
            </p>
          </div>

          {/* Banner de Condição Grátis vs PRO */}
          {!licenseStatus.isPro ? (
            <div className="w-full p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>
                    {isEn
                      ? 'HD Video Download Requires Lifetime PRO'
                      : 'Download de Vídeo Condicionado à Licença PRO'}
                  </span>
                </div>
                <p className="text-neutral-400 leading-relaxed">
                  {isEn ? (
                    <>
                      You can record and preview your video with all 12 filters on the Free tier. To download the full HD video file, unlock the <strong>Lifetime PRO Deal ($29 One-Time)</strong> or redeem your AppSumo code.
                    </>
                  ) : (
                    <>
                      Na versão gratuita você pode testar todos os 12 filtros e assistir à prévia. Para baixar o arquivo de vídeo original em Full HD, adquira a <strong>Licença Vitalícia (R$ 97,00)</strong> — sem mensalidades.
                    </>
                  )}
                </p>
              </div>

              <button
                onClick={onOpenUpgradeModal}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shrink-0 flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer whitespace-nowrap"
              >
                <Crown className="w-3.5 h-3.5 fill-current" />
                <span>
                  {isEn ? 'Unlock Download ($29)' : 'Desbloquear Download (R$ 97)'}
                </span>
              </button>
            </div>
          ) : (
            <div className="w-full p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {isEn ? (
                  <>
                    Your <strong>Lifetime PRO License</strong> is active. High-definition video download with filters is unlocked.
                  </>
                ) : (
                  <>
                    Você possui a <strong>Licença PRO Vitalícia</strong>. O download do vídeo em alta definição com filtros está liberado.
                  </>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="px-4 sm:px-6 py-3.5 border-t border-neutral-800 bg-neutral-950 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              const msg = isEn
                ? 'Discard this recording and record a new take?'
                : 'Deseja descartar este vídeo e gravar novamente?';
              if (window.confirm(msg)) {
                onDiscard();
                onClose();
              }
            }}
            className="text-xs text-neutral-400 hover:text-red-400 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isEn ? 'Discard & Record Again' : 'Descartar e Gravar Outro'}</span>
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
            >
              {isEn ? 'Close' : 'Fechar'}
            </button>

            {licenseStatus.isPro ? (
              <button
                onClick={onDownload}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{isEn ? 'Download HD Video (.webm)' : 'Baixar Vídeo em HD (.webm)'}</span>
              </button>
            ) : (
              <button
                onClick={onOpenUpgradeModal}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Crown className="w-4 h-4" />
                <span>{isEn ? 'Download Video (Activate PRO)' : 'Baixar Vídeo (Ativar PRO)'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
