import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Maximize2,
  Minimize2,
  FileText,
  Monitor,
  HelpCircle,
  FolderOpen,
  Smartphone,
  Mic,
  MicOff,
  Crown,
  QrCode,
  Tag,
  Globe,
  MoreVertical,
  X,
  Download,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { LicenseStatus } from '../types/teleprompter';
import { AppLanguage } from '../utils/i18n';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface NavbarProps {
  lang: AppLanguage;
  onToggleLang: () => void;
  currentView: 'editor' | 'prompter';
  onSelectView: (view: 'editor' | 'prompter') => void;
  onOpenLibrary: () => void;
  onOpenShortcuts: () => void;
  onOpenGooglePlay: () => void;
  onOpenAppSumo?: () => void;
  onOpenMobileTest?: () => void;
  onOpenVoiceGuide?: () => void;
  isListeningVoice?: boolean;
  onToggleVoice?: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  onTogglePlay: () => void;
  isPlaying: boolean;
  licenseStatus: LicenseStatus;
  onOpenUpgradeModal: (feature?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onToggleLang,
  currentView,
  onSelectView,
  onOpenLibrary,
  onOpenShortcuts,
  onOpenGooglePlay,
  onOpenAppSumo,
  onOpenMobileTest,
  onOpenVoiceGuide,
  isListeningVoice = false,
  onToggleVoice,
  onToggleFullscreen,
  isFullscreen,
  onTogglePlay,
  isPlaying,
  licenseStatus,
  onOpenUpgradeModal,
}) => {
  const isEn = lang === 'en';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Close mobile menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header className="w-full bg-neutral-950 border-b border-neutral-800/80 px-2 sm:px-4 md:px-6 py-1.5 sm:py-2.5 select-none flex items-center justify-between z-40 relative">
        {/* Zone 1: Logo and Main Mode Switcher */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onSelectView('editor');
            }}
            className="text-xs sm:text-base md:text-lg font-bold tracking-tight text-white flex items-center gap-1 sm:gap-1.5 hover:text-amber-400 transition-colors shrink-0"
          >
            <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <span className="hidden sm:inline">Teleprompter Pro</span>
            <span className="sm:hidden font-bold text-xs tracking-tight">TP Pro</span>
          </a>

          {/* Mode Switcher Segmented Control */}
          <div className="flex items-center bg-neutral-900 border border-neutral-800 p-0.5 rounded-lg shrink-0">
            <button
              onClick={() => onSelectView('editor')}
              className={`px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                currentView === 'editor'
                  ? 'bg-neutral-800 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title={isEn ? 'Script Editor' : 'Roteiro & Edição'}
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{isEn ? 'Script' : 'Roteiro'}</span>
            </button>

            <button
              onClick={() => onSelectView('prompter')}
              className={`px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                currentView === 'prompter'
                  ? 'bg-neutral-800 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title={isEn ? 'Studio Reader' : 'Estúdio de Leitura'}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{isEn ? 'Studio' : 'Estúdio'}</span>
            </button>
          </div>
        </div>

        {/* Zone 2: Desktop Navigation Links (hidden on mobile, available in 3-dots menu) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          <button
            onClick={onOpenLibrary}
            className="px-2.5 py-1.5 rounded-lg text-xs md:text-sm font-medium text-neutral-400 hover:text-neutral-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>{isEn ? 'Library' : 'Biblioteca'}</span>
          </button>

          {onOpenVoiceGuide && (
            <button
              onClick={onOpenVoiceGuide}
              className={`px-2.5 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                isListeningVoice
                  ? 'text-rose-300 bg-rose-500/20 border border-rose-500/40 animate-pulse'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title={isEn ? 'Hands-free Voice Control (Web Speech API)' : 'Comandos por voz hands-free (Web Speech API)'}
            >
              {isListeningVoice ? <Mic className="w-3.5 h-3.5 text-rose-400" /> : <MicOff className="w-3.5 h-3.5" />}
              <span>{isEn ? 'Voice' : 'Voz'}</span>
            </button>
          )}

          {onOpenMobileTest && (
            <button
              onClick={onOpenMobileTest}
              className="hidden xl:flex px-2.5 py-1.5 rounded-lg text-xs md:text-sm font-medium text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors items-center gap-1.5 cursor-pointer"
              title={isEn ? 'Open QR Code to test on Mobile (Android / iOS)' : 'Abrir QR Code para testar no celular (Android / iOS)'}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>{isEn ? 'Mobile QR' : 'Celular'}</span>
            </button>
          )}

          {onOpenAppSumo && (
            <button
              onClick={onOpenAppSumo}
              className="px-2.5 py-1.5 rounded-lg text-xs md:text-sm font-medium text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors items-center gap-1.5 cursor-pointer"
              title={isEn ? 'AppSumo Launch Guide & CSV Code Generator' : 'Guia de Lançamento no AppSumo & Gerador de Códigos CSV'}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>AppSumo LTD</span>
            </button>
          )}

          <button
            onClick={onOpenGooglePlay}
            className="hidden 2xl:flex px-2.5 py-1.5 rounded-lg text-xs md:text-sm font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors items-center gap-1.5 cursor-pointer"
            title={isEn ? 'Google Play Store Publishing Guide' : 'Guia e checklist para publicar na Google Play Store'}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Google Play</span>
          </button>

          <button
            onClick={onOpenShortcuts}
            className="px-2.5 py-1.5 rounded-lg text-xs md:text-sm font-medium text-neutral-400 hover:text-neutral-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{isEn ? 'Shortcuts' : 'Atalhos'}</span>
          </button>
        </nav>

        {/* Zone 3: Language, PRO, Fullscreen, Tools & Action Button (100% inside view on all mobile screens) */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Language Switcher */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1 px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 text-[11px] sm:text-xs font-bold transition-colors cursor-pointer shrink-0"
            title={isEn ? 'Switch to Portuguese (PT-BR)' : 'Mudar idioma para Inglês (EN-US)'}
            aria-label={isEn ? 'Switch to Portuguese' : 'Mudar para Inglês'}
          >
            <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
            <span className="font-mono text-[10px] sm:text-xs">{isEn ? 'EN' : 'PT'}</span>
          </button>

          {/* PRO License Badge/Button */}
          {licenseStatus.isPro ? (
            <button
              onClick={() => onOpenUpgradeModal()}
              className="flex items-center gap-1 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-[11px] sm:text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
              title={isEn ? 'Lifetime PRO License Active' : 'Licença Vitalícia Ativa (Clique para ver detalhes)'}
            >
              <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current text-amber-400 shrink-0" />
              <span className="hidden md:inline">{isEn ? 'PRO' : 'PRO'}</span>
            </button>
          ) : (
            <button
              onClick={() => onOpenUpgradeModal()}
              className="flex items-center gap-1 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-neutral-950 text-[11px] sm:text-xs font-extrabold shadow-sm active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0"
              title={isEn ? 'Get Lifetime PRO ($29)' : 'Seja PRO Vitalício (R$ 97)'}
            >
              <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current shrink-0" />
              <span className="hidden md:inline">{isEn ? 'PRO ($29)' : 'PRO (R$ 97)'}</span>
              <span className="md:hidden font-bold text-[10px]">PRO</span>
            </button>
          )}

          {/* PWA Install Button (Displayed on tablets/desktops; on mobile phones accessible in the 3-dots menu) */}
          <div className="hidden sm:block shrink-0">
            <PWAInstallButton lang={lang} />
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={onToggleFullscreen}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors cursor-pointer shrink-0 ${
              isFullscreen
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800'
            }`}
            title={isEn ? 'Toggle Fullscreen (F)' : 'Alternar Tela Cheia (F)'}
            aria-label={isEn ? 'Toggle Fullscreen' : 'Alternar Tela Cheia'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" /> : <Maximize2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" />}
          </button>

          {/* Mobile Overflow Menu Button (for tools) */}
          <div className="relative lg:hidden" ref={mobileMenuRef}>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors cursor-pointer shrink-0 ${
                mobileMenuOpen
                  ? 'bg-neutral-800 text-white border border-neutral-700'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
              title={isEn ? 'More tools' : 'Mais ferramentas'}
              aria-label={isEn ? 'Open tools menu' : 'Abrir menu de ferramentas'}
            >
              {mobileMenuOpen ? <X className="w-3.5 sm:w-4 h-3.5 sm:h-4" /> : <MoreVertical className="w-3.5 sm:w-4 h-3.5 sm:h-4" />}
            </button>

            {/* Mobile Popover Menu */}
            {mobileMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Fullscreen toggle inside menu for easy mobile access */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onToggleFullscreen();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-neutral-200 hover:bg-neutral-800 transition-colors text-left"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4 text-amber-400" /> : <Maximize2 className="w-4 h-4 text-amber-400" />}
                  <span>{isFullscreen ? (isEn ? 'Exit Fullscreen' : 'Sair da Tela Cheia') : (isEn ? 'Fullscreen' : 'Tela Cheia')}</span>
                </button>

                {/* PWA Install options on mobile */}
                {!isInstalled && isInstallable && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      install();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-amber-300 hover:bg-neutral-800 transition-colors text-left"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>{isEn ? 'Install App (PWA)' : 'Instalar Aplicativo (PWA)'}</span>
                  </button>
                )}

                {!isInstalled && isIOS && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setShowIOSGuide(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-neutral-200 hover:bg-neutral-800 transition-colors text-left"
                  >
                    <Smartphone className="w-4 h-4 text-amber-400" />
                    <span>{isEn ? 'Install on iPhone / iPad' : 'Instalar no iPhone / iPad'}</span>
                  </button>
                )}

                <div className="my-1 border-t border-neutral-800/80" />

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenLibrary();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-neutral-200 hover:bg-neutral-800 transition-colors text-left"
                >
                  <FolderOpen className="w-4 h-4 text-amber-400" />
                  <span>{isEn ? 'Script Library' : 'Biblioteca de Roteiros'}</span>
                </button>

                {onOpenVoiceGuide && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenVoiceGuide();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-neutral-200 hover:bg-neutral-800 transition-colors text-left"
                  >
                    <Mic className="w-4 h-4 text-rose-400" />
                    <span>{isEn ? 'Voice Commands' : 'Comandos de Voz'}</span>
                  </button>
                )}

                {onToggleVoice && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onToggleVoice();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-neutral-200 hover:bg-neutral-800 transition-colors text-left"
                  >
                    {isListeningVoice ? <Mic className="w-4 h-4 text-rose-400" /> : <MicOff className="w-4 h-4 text-neutral-500" />}
                    <span>{isListeningVoice ? (isEn ? 'Turn Voice Off' : 'Desativar Voz') : (isEn ? 'Turn Voice On' : 'Ativar Voz')}</span>
                  </button>
                )}

                {onOpenMobileTest && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenMobileTest();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-neutral-200 hover:bg-neutral-800 transition-colors text-left"
                  >
                    <QrCode className="w-4 h-4 text-amber-400" />
                    <span>{isEn ? 'Test on Mobile (QR)' : 'Testar no Celular (QR)'}</span>
                  </button>
                )}

                {onOpenAppSumo && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAppSumo();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-neutral-200 hover:bg-neutral-800 transition-colors text-left"
                  >
                    <Tag className="w-4 h-4 text-amber-400" />
                    <span>AppSumo LTD</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenGooglePlay();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-neutral-200 hover:bg-neutral-800 transition-colors text-left"
                >
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Google Play Guide</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenShortcuts();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-neutral-200 hover:bg-neutral-800 transition-colors text-left border-t border-neutral-800/80 mt-1 pt-2"
                >
                  <HelpCircle className="w-4 h-4 text-neutral-400" />
                  <span>{isEn ? 'Keyboard Shortcuts' : 'Atalhos de Teclado'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Primary Play / Launch Action Button */}
          {currentView === 'prompter' ? (
            <button
              onClick={onTogglePlay}
              className={`px-2 sm:px-3.5 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-bold tracking-wide transition-all shadow-md active:scale-95 flex items-center gap-1 sm:gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                isPlaying
                  ? 'bg-amber-500 hover:bg-amber-400 text-black'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
              title={isPlaying ? (isEn ? 'Pause' : 'Pausar') : (isEn ? 'Start' : 'Iniciar')}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span className="hidden min-[480px]:inline">{isEn ? 'Pause' : 'Pausar'}</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  <span className="hidden min-[480px]:inline">{isEn ? 'Start' : 'Iniciar'}</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => onSelectView('prompter')}
              className="px-2 sm:px-3.5 py-1 sm:py-2 text-xs sm:text-sm font-bold text-neutral-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-all shadow-md active:scale-95 flex items-center gap-1 sm:gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              title={isEn ? 'Launch Prompter' : 'Iniciar Prompter'}
            >
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              <span className="hidden min-[480px]:inline">{isEn ? 'Prompter' : 'Prompter'}</span>
            </button>
          )}
        </div>
      </header>

      {/* iOS Safari PWA Installation Modal Guide */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl text-neutral-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  {isEn ? 'Install on iPhone / iPad' : 'Instalar no iPhone / iPad'}
                </h3>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-neutral-300 mb-4 leading-relaxed">
              {isEn
                ? 'To install this Web App on iOS without the App Store:'
                : 'Para instalar o aplicativo no iOS sem precisar da App Store:'}
            </p>
            <ol className="text-xs text-neutral-300 space-y-2 list-decimal list-inside bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 mb-4">
              <li>
                {isEn ? (
                  <>Tap the <strong>Share</strong> button (box with arrow) in Safari.</>
                ) : (
                  <>Toque no botão <strong>Compartilhar</strong> (quadrado com seta para cima) no Safari.</>
                )}
              </li>
              <li>
                {isEn ? (
                  <>Scroll down and tap <strong>Add to Home Screen</strong>.</>
                ) : (
                  <>Role para baixo e toque em <strong>Adicionar à Tela de Início</strong>.</>
                )}
              </li>
              <li>
                {isEn ? (
                  <>Tap <strong>Add</strong> at the top right.</>
                ) : (
                  <>Toque em <strong>Adicionar</strong> no canto superior direito.</>
                )}
              </li>
            </ol>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-colors cursor-pointer"
            >
              {isEn ? 'Got it!' : 'Entendi!'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
