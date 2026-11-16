import React, { useEffect, useState, useRef } from 'react';
import { TeleprompterSettings, LicenseStatus } from '../types/teleprompter';
import { AppLanguage } from '../utils/i18n';
import {
  Play,
  Pause,
  RotateCcw,
  Minus,
  Plus,
  FlipHorizontal,
  FlipVertical,
  Eye,
  Maximize2,
  Minimize2,
  Edit3,
  HelpCircle,
  Mic,
  MicOff,
  Video,
  Square,
  Image,
} from 'lucide-react';

interface FloatingHudProps {
  lang: AppLanguage;
  settings: TeleprompterSettings;
  onUpdateSettings: (updater: (prev: TeleprompterSettings) => TeleprompterSettings) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onRestart: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  onExitToEditor: () => void;
  onOpenShortcuts: () => void;
  onOpenBackdropModal?: () => void;
  isListeningVoice?: boolean;
  onToggleVoice?: () => void;
  onOpenVoiceGuide?: () => void;
  isRecording?: boolean;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  licenseStatus?: LicenseStatus;
  onOpenUpgradeModal?: (feature?: string) => void;
  formattedElapsed: string;
  formattedEstimated: string;
}

export const FloatingHud: React.FC<FloatingHudProps> = ({
  lang,
  settings,
  onUpdateSettings,
  isPlaying,
  onTogglePlay,
  onRestart,
  onToggleFullscreen,
  isFullscreen,
  onExitToEditor,
  onOpenShortcuts,
  onOpenBackdropModal,
  isListeningVoice = false,
  onToggleVoice,
  isRecording = false,
  onStartRecording,
  onStopRecording,
  licenseStatus,
  onOpenUpgradeModal,
  formattedElapsed,
  formattedEstimated,
}) => {
  const isEn = lang === 'en';
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-oculta o HUD após 2.5s se estiver em reprodução
  useEffect(() => {
    const handleActivity = () => {
      setIsVisible(true);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      if (isPlaying) {
        hideTimeoutRef.current = setTimeout(() => {
          setIsVisible(false);
        }, 2500);
      }
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('keydown', handleActivity);

    handleActivity();

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  const updateSpeed = (delta: number) => {
    onUpdateSettings((prev) => ({
      ...prev,
      speed: Math.max(1, Math.min(100, prev.speed + delta)),
    }));
  };

  const updateFontSize = (delta: number) => {
    onUpdateSettings((prev) => ({
      ...prev,
      fontSize: Math.max(18, Math.min(100, prev.fontSize + delta)),
    }));
  };

  const toggleMirrorH = () => {
    onUpdateSettings((prev) => ({
      ...prev,
      mirrorHorizontal: !prev.mirrorHorizontal,
    }));
  };

  const toggleMirrorV = () => {
    onUpdateSettings((prev) => ({
      ...prev,
      mirrorVertical: !prev.mirrorVertical,
    }));
  };

  const toggleCue = () => {
    onUpdateSettings((prev) => ({
      ...prev,
      cueLine: {
        ...prev.cueLine,
        enabled: !prev.cueLine.enabled,
      },
    }));
  };

  if (settings.cleanOutputMode) return null;

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 pointer-events-auto ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-8 pointer-events-none'
      }`}
    >
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-neutral-900/90 backdrop-blur-md border border-white/10 shadow-2xl text-white">
        {/* Botão Play / Pause proeminente */}
        <button
          onClick={onTogglePlay}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-md active:scale-95 cursor-pointer ${
            isPlaying
              ? 'bg-amber-500 hover:bg-amber-400 text-black'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
          title={isEn ? 'Spacebar for Play / Pause' : 'Espaço para Play / Pause'}
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span className="hidden sm:inline">{isEn ? 'Pause' : 'Pausar'}</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current ml-0.5" />
              <span className="hidden sm:inline">{isEn ? 'Start' : 'Iniciar'}</span>
            </>
          )}
        </button>

        {/* Reiniciar */}
        <button
          onClick={onRestart}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-neutral-300 hover:text-white transition-colors cursor-pointer"
          title={isEn ? 'Restart (R)' : 'Reiniciar (R)'}
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <div className="h-5 w-px bg-white/15 mx-1" aria-hidden="true" />

        {/* Velocidade */}
        <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-lg border border-white/5">
          <span className="text-[10px] font-mono text-neutral-400 uppercase mr-1 hidden sm:inline">
            {isEn ? 'Spd' : 'Vel'}
          </span>
          <button
            onClick={() => updateSpeed(-2)}
            className="p-1 rounded hover:bg-white/10 text-neutral-300 hover:text-white cursor-pointer"
            title={isEn ? 'Decrease speed (Down Arrow)' : 'Reduzir velocidade (Seta Baixo)'}
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-xs font-mono font-bold text-amber-400 tabular-nums px-1">
            {settings.speed}
          </span>
          <button
            onClick={() => updateSpeed(2)}
            className="p-1 rounded hover:bg-white/10 text-neutral-300 hover:text-white cursor-pointer"
            title={isEn ? 'Increase speed (Up Arrow)' : 'Aumentar velocidade (Seta Cima)'}
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* Tamanho da Fonte */}
        <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-lg border border-white/5">
          <span className="text-[10px] font-mono text-neutral-400 uppercase mr-1 hidden sm:inline">
            {isEn ? 'Font' : 'Fonte'}
          </span>
          <button
            onClick={() => updateFontSize(-2)}
            className="p-1 rounded hover:bg-white/10 text-neutral-300 hover:text-white cursor-pointer"
            title={isEn ? 'Decrease font (-)' : 'Diminuir fonte (-)'}
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-xs font-mono font-bold text-cyan-400 tabular-nums px-1">
            {settings.fontSize}
          </span>
          <button
            onClick={() => updateFontSize(2)}
            className="p-1 rounded hover:bg-white/10 text-neutral-300 hover:text-white cursor-pointer"
            title={isEn ? 'Increase font (+)' : 'Aumentar fonte (+)'}
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* Espelhamento H & V */}
        <button
          onClick={toggleMirrorH}
          className={`p-2 rounded-xl transition-colors cursor-pointer ${
            settings.mirrorHorizontal
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white'
          }`}
          title={isEn ? 'Horizontal Mirror (M)' : 'Espelho Horizontal (M)'}
        >
          <FlipHorizontal className="w-4 h-4" />
        </button>

        <button
          onClick={toggleMirrorV}
          className={`p-2 rounded-xl transition-colors cursor-pointer ${
            settings.mirrorVertical
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white'
          }`}
          title={isEn ? 'Vertical Mirror (V)' : 'Espelho Vertical (V)'}
        >
          <FlipVertical className="w-4 h-4" />
        </button>

        {/* Linha Guia */}
        <button
          onClick={toggleCue}
          className={`p-2 rounded-xl transition-colors cursor-pointer ${
            settings.cueLine.enabled
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white'
          }`}
          title={isEn ? 'Toggle Reading Cue Line' : 'Alternar Linha Guia de Foco'}
        >
          <Eye className="w-4 h-4" />
        </button>

        {/* Pano de Fundo / Cenários */}
        {onOpenBackdropModal && (
          <button
            onClick={onOpenBackdropModal}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              settings.backdropId !== 'none'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white'
            }`}
            title={isEn ? 'Virtual Studio Backdrops (Office, Boardroom, Library)' : 'Cenários & Panos de Fundo (Escritório, Sala de Reunião, Biblioteca)'}
          >
            <Image className="w-4 h-4" />
          </button>
        )}

        {/* Controle por Voz (Hands-Free) */}
        {onToggleVoice && (
          <button
            onClick={onToggleVoice}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isListeningVoice
                ? 'bg-rose-600/30 text-rose-300 border border-rose-500/50 animate-pulse'
                : 'bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white'
            }`}
            title={
              isListeningVoice
                ? isEn
                  ? 'Voice active (Say "Start", "Pause", "Faster", "Slower")'
                  : 'Voz ativa (Diga "Start", "Pause", "Faster", "Slower")'
                : isEn
                ? 'Enable voice control'
                : 'Ativar controle por voz'
            }
          >
            {isListeningVoice ? <Mic className="w-4 h-4 text-rose-400" /> : <MicOff className="w-4 h-4" />}
          </button>
        )}

        {/* Gravação de Vídeo (Câmera + Áudio) */}
        {onStartRecording && (
          <button
            onClick={isRecording ? onStopRecording : onStartRecording}
            className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
              isRecording
                ? 'bg-rose-600 text-white shadow-lg animate-pulse'
                : 'bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white'
            }`}
            title={
              isRecording
                ? isEn
                  ? 'Stop Video Recording'
                  : 'Parar Gravação de Vídeo'
                : isEn
                ? 'Start Camera Video Recording'
                : 'Iniciar Gravação de Vídeo com Câmera'
            }
          >
            {isRecording ? (
              <Square className="w-4 h-4 fill-current text-white" />
            ) : (
              <Video className="w-4 h-4 text-rose-400" />
            )}
          </button>
        )}

        <div className="h-5 w-px bg-white/15 mx-1" aria-hidden="true" />

        {/* Cronômetro */}
        <div className="hidden md:flex items-center gap-1 font-mono text-xs tabular-nums text-neutral-300 px-2 py-1 bg-black/40 rounded-lg">
          <span className="text-white font-semibold">{formattedElapsed}</span>
          <span className="text-neutral-500">/</span>
          <span className="text-neutral-400">{formattedEstimated}</span>
        </div>

        {/* Fullscreen */}
        <button
          onClick={onToggleFullscreen}
          className={`p-2 rounded-xl transition-colors cursor-pointer ${
            isFullscreen
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white'
          }`}
          title={isEn ? 'Toggle Fullscreen (F)' : 'Alternar Tela Cheia (F)'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Ajuda / Atalhos */}
        <button
          onClick={onOpenShortcuts}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white cursor-pointer"
          title={isEn ? 'Keyboard Shortcuts (?)' : 'Atalhos de Teclado (?)'}
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Voltar ao Editor */}
        <button
          onClick={onExitToEditor}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-medium text-white transition-all cursor-pointer"
          title={isEn ? 'Back to Script Editor' : 'Voltar para Modo de Edição'}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isEn ? 'Edit' : 'Editar'}</span>
        </button>
      </div>
    </div>
  );
};
