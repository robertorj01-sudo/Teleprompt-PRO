import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  TeleprompterSettings,
  SavedScript,
  LicenseStatus,
} from './types/teleprompter';
import { DEFAULT_SCRIPTS, DEFAULT_SCRIPTS_EN, getDefaultScripts } from './utils/defaultScripts';
import { AppLanguage, detectInitialLanguage } from './utils/i18n';
import { countWords, estimateReadingTimeSeconds, formatTime } from './utils/textUtils';
import { useSmoothScroll } from './hooks/useSmoothScroll';
import { useVideoRecorder } from './hooks/useVideoRecorder';
import { Navbar } from './components/Navbar';
import { ScriptEditor } from './components/ScriptEditor';
import { PrompterDisplay } from './components/PrompterDisplay';
import { ControlBar } from './components/ControlBar';
import { FloatingHud } from './components/FloatingHud';
import { ScriptLibraryModal } from './components/ScriptLibraryModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { WebcamOverlay } from './components/WebcamOverlay';
import { GooglePlayModal } from './components/GooglePlayModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { useVoiceControl } from './hooks/useVoiceControl';
import { VoiceCommandOverlay } from './components/VoiceCommandOverlay';
import { VoiceCommandsModal } from './components/VoiceCommandsModal';
import { UpgradeProModal } from './components/UpgradeProModal';
import { RecordedVideoModal } from './components/RecordedVideoModal';
import { MobileTestModal } from './components/MobileTestModal';
import { AppSumoModal } from './components/AppSumoModal';

const DEFAULT_SETTINGS: TeleprompterSettings = {
  speed: 28,
  fontSize: 44,
  lineHeight: 1.6,
  letterSpacing: 0,
  horizontalMargin: 15,
  textAlign: 'center',
  fontFamily: 'sans',
  mirrorHorizontal: false,
  mirrorVertical: false,
  colorTheme: 'dark-white',
  cueLine: {
    enabled: true,
    positionPercent: 32,
    style: 'subtle-line',
    color: '#ef4444',
    opacity: 0.85,
  },
  countdownSeconds: 3,
  highlightNotes: true,
  showStatsOverlay: true,
  webcamEnabled: false,
  webcamOpacity: 1,
  videoFilter: 'normal',
};

export default function App() {
  // Idioma do Aplicativo ('en' internacional / 'pt' Brasil)
  const [lang, setLang] = useState<AppLanguage>(() => detectInitialLanguage());

  // Estado do Roteiro Ativo
  const [title, setTitle] = useState<string>(() => {
    const saved = localStorage.getItem('teleprompter_active_title');
    if (saved) return saved;
    const initialLang = detectInitialLanguage();
    return getDefaultScripts(initialLang)[0].title;
  });

  const [content, setContent] = useState<string>(() => {
    const saved = localStorage.getItem('teleprompter_active_content');
    if (saved !== null) return saved;
    const initialLang = detectInitialLanguage();
    return getDefaultScripts(initialLang)[0].content;
  });

  // Biblioteca de Roteiros
  const [savedScripts, setSavedScripts] = useState<SavedScript[]>(() => {
    const saved = localStorage.getItem('teleprompter_saved_scripts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Erro ao ler biblioteca de roteiros:', e);
      }
    }
    return getDefaultScripts(detectInitialLanguage());
  });

  // Configurações do Prompter
  const [settings, setSettings] = useState<TeleprompterSettings>(() => {
    const saved = localStorage.getItem('teleprompter_settings');
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Erro ao ler configurações:', e);
      }
    }
    return DEFAULT_SETTINGS;
  });

  // Modos de Visualização & Apresentação
  const [currentView, setCurrentView] = useState<'editor' | 'prompter'>('editor');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Contagem Regressiva
  const [isCountingDown, setIsCountingDown] = useState<boolean>(false);
  const [countdownValue, setCountdownValue] = useState<number>(3);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cronômetro
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Status da Licença PRO (Vitalícia / AppSumo LTD vs Grátis)
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus>(() => {
    const saved = localStorage.getItem('teleprompter_license');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Erro ao ler licença:', e);
      }
    }
    return { isPro: false, planType: 'free' };
  });

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);
  const [upgradeHighlight, setUpgradeHighlight] = useState<string | undefined>(undefined);
  const [isRecordedVideoModalOpen, setIsRecordedVideoModalOpen] = useState<boolean>(false);
  const [isMobileTestOpen, setIsMobileTestOpen] = useState<boolean>(false);
  const [isAppSumoOpen, setIsAppSumoOpen] = useState<boolean>(false);

  const openUpgradeModal = (feature?: string) => {
    setUpgradeHighlight(feature);
    setIsUpgradeModalOpen(true);
  };

  const handleActivateLicense = (licenseKey: string) => {
    const updated: LicenseStatus = {
      isPro: true,
      planType: 'lifetime',
      licenseKey,
      activatedAt: Date.now(),
    };
    setLicenseStatus(updated);
    localStorage.setItem('teleprompter_license', JSON.stringify(updated));
  };

  // Gravador de Vídeo e Áudio Integrado (MediaRecorder API)
  const videoRecorder = useVideoRecorder();

  const handleStartRecording = () => {
    setSettings((prev) => ({ ...prev, webcamEnabled: true }));
    videoRecorder.startRecording();
  };

  const handleStopRecording = () => {
    videoRecorder.stopRecording();
    setIsRecordedVideoModalOpen(true);
  };

  // Modais
  const [isLibraryOpen, setIsLibraryOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isGooglePlayOpen, setIsGooglePlayOpen] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);

  // Salva no LocalStorage sempre que houver alterações
  useEffect(() => {
    localStorage.setItem('teleprompter_active_title', title);
  }, [title]);

  useEffect(() => {
    localStorage.setItem('teleprompter_active_content', content);
  }, [content]);

  useEffect(() => {
    localStorage.setItem('teleprompter_saved_scripts', JSON.stringify(savedScripts));
  }, [savedScripts]);

  useEffect(() => {
    localStorage.setItem('teleprompter_settings', JSON.stringify(settings));
  }, [settings]);

  // Hook de Rolagem Suave
  const {
    containerRef,
    scrollProgress,
    isAtEnd,
    restart: restartScroll,
    jump,
    handleManualScroll,
  } = useSmoothScroll({
    speed: settings.speed,
    isPlaying: isPlaying && !isCountingDown,
    onEndReached: () => {
      setIsPlaying(false);
    },
  });

  // Métricas do texto
  const wordCount = countWords(content);
  const estimatedTotalSeconds = estimateReadingTimeSeconds(wordCount);

  // Cronômetro de leitura
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying && !isCountingDown) {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, isCountingDown]);

  // Monitoramento de Fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Alternar Fullscreen
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Erro ao alternar tela cheia:', err);
    }
  }, []);

  // Iniciar / Pausar com suporte a contagem regressiva
  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
      setIsCountingDown(false);
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
      return;
    }

    if (settings.countdownSeconds > 0) {
      setIsCountingDown(true);
      setCountdownValue(settings.countdownSeconds);

      let current = settings.countdownSeconds;
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

      countdownTimerRef.current = setInterval(() => {
        current -= 1;
        setCountdownValue(current);
        if (current <= 0) {
          if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
          setIsCountingDown(false);
          setIsPlaying(true);
        }
      }, 1000);
    } else {
      setIsPlaying(true);
    }
  }, [isPlaying, settings.countdownSeconds]);

  // Reiniciar do topo
  const handleRestart = useCallback(() => {
    restartScroll();
    setElapsedSeconds(0);
  }, [restartScroll]);

  // Controle por Voz Hands-Free (Web Speech API)
  const voiceControl = useVoiceControl({
    onPlay: () => {
      setCurrentView('prompter');
      setIsPlaying(true);
      setIsCountingDown(false);
    },
    onPause: () => {
      setIsPlaying(false);
      setIsCountingDown(false);
    },
    onFaster: () => {
      setSettings((prev) => ({
        ...prev,
        speed: Math.min(100, prev.speed + 4),
      }));
    },
    onSlower: () => {
      setSettings((prev) => ({
        ...prev,
        speed: Math.max(1, prev.speed - 4),
      }));
    },
    onRestart: () => {
      handleRestart();
    },
    onToggleMirror: () => {
      if (!licenseStatus.isPro) {
        openUpgradeModal('mirror');
        return;
      }
      setSettings((prev) => ({
        ...prev,
        mirrorHorizontal: !prev.mirrorHorizontal,
      }));
    },
    onToggleCue: () => {
      setSettings((prev) => ({
        ...prev,
        cueLine: {
          ...prev.cueLine,
          enabled: !prev.cueLine.enabled,
        },
      }));
    },
    onBiggerFont: () => {
      setSettings((prev) => ({
        ...prev,
        fontSize: Math.min(100, prev.fontSize + 4),
      }));
    },
    onSmallerFont: () => {
      setSettings((prev) => ({
        ...prev,
        fontSize: Math.max(18, prev.fontSize - 4),
      }));
    },
    onToggleFullscreen: () => {
      toggleFullscreen();
    },
  });

  // Sincroniza o idioma do reconhecimento de voz com o idioma do app
  useEffect(() => {
    voiceControl.setLanguage(lang === 'en' ? 'en-US' : 'pt-BR');
  }, [lang]);

  // Alternar entre Português e Inglês (incluindo roteiro de exemplo se não foi alterado)
  const handleToggleLanguage = () => {
    const nextLang: AppLanguage = lang === 'en' ? 'pt' : 'en';
    setLang(nextLang);
    localStorage.setItem('teleprompter_app_lang', nextLang);

    // Se o roteiro atual for o exemplo padrão de fábrica, troca o exemplo para o novo idioma
    const allDefaultTitles = [
      ...DEFAULT_SCRIPTS.map((s) => s.title),
      ...DEFAULT_SCRIPTS_EN.map((s) => s.title),
    ];
    if (allDefaultTitles.includes(title)) {
      const nextDefaults = getDefaultScripts(nextLang);
      setTitle(nextDefaults[0].title);
      setContent(nextDefaults[0].content);
      setSavedScripts(nextDefaults);
    }
  };

  // Iniciar modo de apresentação a partir do editor
  const handleStartPrompterFromEditor = () => {
    setCurrentView('prompter');
    handleTogglePlay();
  };

  // Gerenciamento de biblioteca
  const handleSaveCurrentScript = (customTitle?: string) => {
    const defaultTitle = lang === 'en' ? 'Untitled Script' : 'Roteiro Sem Título';
    const finalTitle = customTitle || title || defaultTitle;
    const words = countWords(content);
    const newScript: SavedScript = {
      id: `script-${Date.now()}`,
      title: finalTitle,
      content,
      updatedAt: Date.now(),
      wordCount: words,
      estimatedMinutes: Math.ceil(estimateReadingTimeSeconds(words) / 60),
    };

    setSavedScripts((prev) => [newScript, ...prev.filter((s) => s.title !== finalTitle)]);
    setTitle(finalTitle);
  };

  const handleSelectScript = (script: SavedScript) => {
    setTitle(script.title);
    setContent(script.content);
    setIsPlaying(false);
    handleRestart();
  };

  const handleDeleteScript = (id: string) => {
    setSavedScripts((prev) => prev.filter((s) => s.id !== id));
  };

  const handleDuplicateScript = (script: SavedScript) => {
    const copySuffix = lang === 'en' ? '(Copy)' : '(Cópia)';
    const duplicate: SavedScript = {
      ...script,
      id: `script-${Date.now()}`,
      title: `${script.title} ${copySuffix}`,
      updatedAt: Date.now(),
    };
    setSavedScripts((prev) => [duplicate, ...prev]);
  };

  const handleResetToDefaults = () => {
    const msg =
      lang === 'en'
        ? 'Reload the default studio sample scripts?'
        : 'Deseja recarregar os roteiros padrão de estúdio?';
    if (window.confirm(msg)) {
      const defaults = getDefaultScripts(lang);
      setSavedScripts(defaults);
      setTitle(defaults[0].title);
      setContent(defaults[0].content);
    }
  };

  // Atalhos Globais de Teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          handleTogglePlay();
          break;

        case 'ArrowUp':
          e.preventDefault();
          setSettings((prev) => ({
            ...prev,
            speed: Math.min(100, prev.speed + 2),
          }));
          break;

        case 'ArrowDown':
          e.preventDefault();
          setSettings((prev) => ({
            ...prev,
            speed: Math.max(1, prev.speed - 2),
          }));
          break;

        case 'ArrowLeft':
          e.preventDefault();
          jump(-140);
          break;

        case 'ArrowRight':
          e.preventDefault();
          jump(140);
          break;

        case 'KeyR':
          e.preventDefault();
          handleRestart();
          break;

        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;

        case 'KeyM':
          e.preventDefault();
          if (!licenseStatus.isPro) {
            openUpgradeModal('mirror');
            break;
          }
          setSettings((prev) => ({
            ...prev,
            mirrorHorizontal: !prev.mirrorHorizontal,
          }));
          break;

        case 'KeyC':
          e.preventDefault();
          setSettings((prev) => ({
            ...prev,
            cueLine: {
              ...prev.cueLine,
              enabled: !prev.cueLine.enabled,
            },
          }));
          break;

        case 'Equal':
        case 'NumpadAdd':
          e.preventDefault();
          setSettings((prev) => ({
            ...prev,
            fontSize: Math.min(100, prev.fontSize + 2),
          }));
          break;

        case 'Minus':
        case 'NumpadSubtract':
          e.preventDefault();
          setSettings((prev) => ({
            ...prev,
            fontSize: Math.max(18, prev.fontSize - 2),
          }));
          break;

        case 'Slash':
          if (e.shiftKey) {
            e.preventDefault();
            setIsShortcutsOpen(true);
          }
          break;

        case 'Escape':
          if (isPlaying) {
            setIsPlaying(false);
          }
          if (isLibraryOpen) setIsLibraryOpen(false);
          if (isShortcutsOpen) setIsShortcutsOpen(false);
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    handleTogglePlay,
    jump,
    handleRestart,
    toggleFullscreen,
    isPlaying,
    isLibraryOpen,
    isShortcutsOpen,
    licenseStatus.isPro,
  ]);

  const formattedElapsed = formatTime(elapsedSeconds);
  const formattedEstimated = formatTime(estimatedTotalSeconds);

  return (
    <div className="flex flex-col h-screen w-screen bg-black text-neutral-100 overflow-hidden font-sans">
      {/* Indicador de Conexão Offline */}
      <OfflineIndicator lang={lang} />

      {/* Barra de Navegação Superior (ocultada se em tela cheia no modo apresentação) */}
      {!isFullscreen && (
        <Navbar
          lang={lang}
          onToggleLang={handleToggleLanguage}
          currentView={currentView}
          onSelectView={setCurrentView}
          onOpenLibrary={() => setIsLibraryOpen(true)}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
          onOpenGooglePlay={() => setIsGooglePlayOpen(true)}
          onOpenAppSumo={() => setIsAppSumoOpen(true)}
          onOpenMobileTest={() => setIsMobileTestOpen(true)}
          onOpenVoiceGuide={() => setIsVoiceModalOpen(true)}
          isListeningVoice={voiceControl.isListening}
          onToggleVoice={voiceControl.toggleListening}
          onToggleFullscreen={toggleFullscreen}
          isFullscreen={isFullscreen}
          onTogglePlay={handleTogglePlay}
          isPlaying={isPlaying}
          licenseStatus={licenseStatus}
          onOpenUpgradeModal={openUpgradeModal}
        />
      )}

      {/* Área Central: Alterna entre Editor e Prompter */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {currentView === 'editor' ? (
          <div className="flex-1 overflow-y-auto bg-neutral-950">
            <ScriptEditor
              lang={lang}
              title={title}
              onChangeTitle={setTitle}
              content={content}
              onChangeContent={setContent}
              onOpenLibrary={() => setIsLibraryOpen(true)}
              onStartPrompter={handleStartPrompterFromEditor}
              onOpenShortcuts={() => setIsShortcutsOpen(true)}
              licenseStatus={licenseStatus}
              onOpenUpgradeModal={openUpgradeModal}
            />
          </div>
        ) : (
          <div className="flex-1 relative w-full h-full flex flex-col overflow-hidden">
            {/* Display do Teleprompter */}
            <div className="flex-1 relative w-full h-full overflow-hidden">
              <PrompterDisplay
                lang={lang}
                content={content}
                settings={settings}
                containerRef={containerRef}
                scrollProgress={scrollProgress}
                isAtEnd={isAtEnd}
                onRestart={handleRestart}
                onManualScroll={handleManualScroll}
                isCountingDown={isCountingDown}
                countdownValue={countdownValue}
                isRecording={videoRecorder.isRecording}
                recordingDuration={videoRecorder.recordingDuration}
                onStopRecording={handleStopRecording}
              />

              {/* Overlay de Status e Feedback de Comandos por Voz */}
              <VoiceCommandOverlay
                lang={lang}
                isListening={voiceControl.isListening}
                onToggleListening={voiceControl.toggleListening}
                language={voiceControl.language}
                onToggleLanguage={() =>
                  voiceControl.setLanguage(voiceControl.language === 'pt-BR' ? 'en-US' : 'pt-BR')
                }
                lastCommand={voiceControl.lastCommand}
                interimTranscript={voiceControl.interimTranscript}
                onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
                isFullscreen={isFullscreen}
              />

              {/* HUD Flutuante Auto-Ocultável (visível no modo Prompter) */}
              <FloatingHud
                lang={lang}
                settings={settings}
                onUpdateSettings={setSettings}
                isPlaying={isPlaying}
                onTogglePlay={handleTogglePlay}
                onRestart={handleRestart}
                onToggleFullscreen={toggleFullscreen}
                isFullscreen={isFullscreen}
                onExitToEditor={() => {
                  setIsPlaying(false);
                  setCurrentView('editor');
                }}
                onOpenShortcuts={() => setIsShortcutsOpen(true)}
                isListeningVoice={voiceControl.isListening}
                onToggleVoice={voiceControl.toggleListening}
                onOpenVoiceGuide={() => setIsVoiceModalOpen(true)}
                isRecording={videoRecorder.isRecording}
                onStartRecording={handleStartRecording}
                onStopRecording={handleStopRecording}
                licenseStatus={licenseStatus}
                onOpenUpgradeModal={openUpgradeModal}
                formattedElapsed={formattedElapsed}
                formattedEstimated={formattedEstimated}
              />

              {/* Webcam Picture-in-Picture */}
              <WebcamOverlay
                enabled={settings.webcamEnabled}
                onClose={() =>
                  setSettings((prev) => ({ ...prev, webcamEnabled: false }))
                }
              />
            </div>

            {/* Barra de Ajustes Inferior (apenas se NÃO estiver em Fullscreen) */}
            {!isFullscreen && (
              <ControlBar
                lang={lang}
                settings={settings}
                onUpdateSettings={setSettings}
                isPlaying={isPlaying}
                onTogglePlay={handleTogglePlay}
                onRestart={handleRestart}
                onToggleFullscreen={toggleFullscreen}
                isFullscreen={isFullscreen}
                wordCount={wordCount}
                elapsedSeconds={elapsedSeconds}
                estimatedTotalSeconds={estimatedTotalSeconds}
                formattedElapsed={formattedElapsed}
                formattedEstimated={formattedEstimated}
                scrollProgress={scrollProgress}
                isListeningVoice={voiceControl.isListening}
                onToggleVoice={voiceControl.toggleListening}
                onOpenVoiceGuide={() => setIsVoiceModalOpen(true)}
                isRecording={videoRecorder.isRecording}
                onStartRecording={handleStartRecording}
                onStopRecording={handleStopRecording}
                licenseStatus={licenseStatus}
                onOpenUpgradeModal={openUpgradeModal}
              />
            )}
          </div>
        )}
      </main>

      {/* Modais de Suporte */}
      <ScriptLibraryModal
        lang={lang}
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        savedScripts={savedScripts}
        onSelectScript={handleSelectScript}
        onSaveCurrentScript={handleSaveCurrentScript}
        onDeleteScript={handleDeleteScript}
        onDuplicateScript={handleDuplicateScript}
        onResetToDefaults={handleResetToDefaults}
        currentTitle={title}
        licenseStatus={licenseStatus}
        onOpenUpgradeModal={openUpgradeModal}
      />

      <KeyboardShortcutsModal
        lang={lang}
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <GooglePlayModal
        isOpen={isGooglePlayOpen}
        onClose={() => setIsGooglePlayOpen(false)}
      />

      <MobileTestModal
        isOpen={isMobileTestOpen}
        onClose={() => setIsMobileTestOpen(false)}
      />

      <AppSumoModal
        isOpen={isAppSumoOpen}
        onClose={() => setIsAppSumoOpen(false)}
      />

      <VoiceCommandsModal
        lang={lang}
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        isListening={voiceControl.isListening}
        isSupported={voiceControl.isSupported}
        onToggleListening={voiceControl.toggleListening}
        language={voiceControl.language}
        onSelectLanguage={voiceControl.setLanguage}
        lastCommand={voiceControl.lastCommand}
        interimTranscript={voiceControl.interimTranscript}
      />

      {/* Modal de Upgrade / Ativação da Licença PRO Vitalícia & AppSumo LTD */}
      <UpgradeProModal
        lang={lang}
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        licenseStatus={licenseStatus}
        onActivateLicense={handleActivateLicense}
        highlightFeature={upgradeHighlight}
      />

      {/* Modal de Prévia e Download do Vídeo Gravado */}
      <RecordedVideoModal
        lang={lang}
        isOpen={isRecordedVideoModalOpen}
        onClose={() => setIsRecordedVideoModalOpen(false)}
        videoUrl={videoRecorder.recordedVideoUrl}
        durationSeconds={videoRecorder.recordingDuration}
        licenseStatus={licenseStatus}
        onDownload={() =>
          videoRecorder.downloadRecording(
            `${lang === 'en' ? 'presentation' : 'apresentacao'}-${title || 'teleprompter'}.webm`
          )
        }
        onOpenUpgradeModal={() => {
          setIsRecordedVideoModalOpen(false);
          openUpgradeModal('download_video');
        }}
        onDiscard={() => {
          videoRecorder.resetRecording();
          setIsRecordedVideoModalOpen(false);
        }}
      />
    </div>
  );
}
