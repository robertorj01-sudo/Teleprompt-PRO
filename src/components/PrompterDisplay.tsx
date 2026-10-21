import React, { useMemo } from 'react';
import { TeleprompterSettings } from '../types/teleprompter';
import { parseParagraphSegments, formatTime } from '../utils/textUtils';
import { AppLanguage } from '../utils/i18n';
import { RotateCcw, CheckCircle2, Square } from 'lucide-react';

interface PrompterDisplayProps {
  lang: AppLanguage;
  content: string;
  settings: TeleprompterSettings;
  containerRef: React.RefObject<HTMLDivElement | null>;
  scrollProgress: number;
  isAtEnd: boolean;
  onRestart: () => void;
  onManualScroll: () => void;
  isCountingDown: boolean;
  countdownValue: number;
  onSkipCountdown?: () => void;
  isPlaying?: boolean;
  isRecording?: boolean;
  recordingDuration?: number;
  onStopRecording?: () => void;
}

export const PrompterDisplay: React.FC<PrompterDisplayProps> = ({
  lang,
  content,
  settings,
  containerRef,
  scrollProgress,
  isAtEnd,
  onRestart,
  onManualScroll,
  isCountingDown,
  countdownValue,
  onSkipCountdown,
  isPlaying = false,
  isRecording = false,
  recordingDuration = 0,
  onStopRecording,
}) => {
  const isEn = lang === 'en';

  // Configuração de cores baseada no tema
  const themeStyles = useMemo(() => {
    switch (settings.colorTheme) {
      case 'dark-yellow':
        return {
          bg: 'bg-black',
          textColor: '#facc15',
          secondaryText: 'rgba(250, 204, 21, 0.6)',
          noteBg: 'rgba(250, 204, 21, 0.15)',
          noteBorder: 'rgba(250, 204, 21, 0.35)',
          cueDefaultColor: '#facc15',
        };
      case 'dark-green':
        return {
          bg: 'bg-black',
          textColor: '#4ade80',
          secondaryText: 'rgba(74, 222, 128, 0.6)',
          noteBg: 'rgba(74, 222, 128, 0.15)',
          noteBorder: 'rgba(74, 222, 128, 0.35)',
          cueDefaultColor: '#4ade80',
        };
      case 'dark-cyan':
        return {
          bg: 'bg-black',
          textColor: '#38bdf8',
          secondaryText: 'rgba(56, 189, 248, 0.6)',
          noteBg: 'rgba(56, 189, 248, 0.15)',
          noteBorder: 'rgba(56, 189, 248, 0.35)',
          cueDefaultColor: '#38bdf8',
        };
      case 'light-black':
        return {
          bg: 'bg-white',
          textColor: '#111827',
          secondaryText: '#6b7280',
          noteBg: 'rgba(0, 0, 0, 0.06)',
          noteBorder: 'rgba(0, 0, 0, 0.15)',
          cueDefaultColor: '#ef4444',
        };
      case 'sepia':
        return {
          bg: 'bg-[#f6efe2]',
          textColor: '#332619',
          secondaryText: '#786858',
          noteBg: 'rgba(70, 50, 30, 0.08)',
          noteBorder: 'rgba(70, 50, 30, 0.2)',
          cueDefaultColor: '#b45309',
        };
      case 'dark-white':
      default:
        return {
          bg: 'bg-black',
          textColor: '#ffffff',
          secondaryText: 'rgba(255, 255, 255, 0.6)',
          noteBg: 'rgba(255, 255, 255, 0.12)',
          noteBorder: 'rgba(255, 255, 255, 0.25)',
          cueDefaultColor: '#ef4444',
        };
    }
  }, [settings.colorTheme]);

  // Família da fonte
  const fontFamilyStyle = useMemo(() => {
    switch (settings.fontFamily) {
      case 'lexend':
        return "'Lexend', sans-serif";
      case 'mono':
        return "'JetBrains Mono', monospace";
      case 'serif':
        return "'Georgia', 'Times New Roman', serif";
      case 'sans':
      default:
        return "'Plus Jakarta Sans', system-ui, sans-serif";
    }
  }, [settings.fontFamily]);

  // Espelhamento óptico
  const transformStyle = useMemo(() => {
    const scaleX = settings.mirrorHorizontal ? -1 : 1;
    const scaleY = settings.mirrorVertical ? -1 : 1;
    if (scaleX === 1 && scaleY === 1) return undefined;
    return `scale(${scaleX}, ${scaleY})`;
  }, [settings.mirrorHorizontal, settings.mirrorVertical]);

  // Divide texto em parágrafos preservando quebras vazias
  const paragraphs = useMemo(() => {
    if (!content) {
      return [
        isEn
          ? 'Type or paste your script in the editor to start.'
          : 'Digite ou cole seu roteiro para iniciar.',
      ];
    }
    return content.split('\n');
  }, [content, isEn]);

  const cueColor = settings.cueLine.color || themeStyles.cueDefaultColor;

  return (
    <div
      className={`relative w-full h-full overflow-hidden select-none ${themeStyles.bg}`}
      style={{
        transform: transformStyle,
        transition: 'transform 0.2s ease-in-out',
      }}
    >
      {/* Linha Guia de Leitura (Cue Line / Focus Marker) */}
      {settings.cueLine.enabled && (
        <div
          className="pointer-events-none absolute left-0 right-0 z-30 flex items-center transition-all duration-150"
          style={{
            top: `${settings.cueLine.positionPercent}%`,
            transform: 'translateY(-50%)',
          }}
        >
          {settings.cueLine.style === 'subtle-line' && (
            <>
              {/* Marcador triangular esquerdo */}
              <div
                className="w-0 h-0 border-t-8 border-b-8 border-l-10 border-t-transparent border-b-transparent ml-3 drop-shadow-md"
                style={{ borderLeftColor: cueColor }}
              />
              <div
                className="flex-1 h-0.5 mx-2 shadow-sm"
                style={{
                  backgroundColor: cueColor,
                  opacity: settings.cueLine.opacity,
                  boxShadow: `0 0 10px ${cueColor}88`,
                }}
              />
              {/* Marcador triangular direito */}
              <div
                className="w-0 h-0 border-t-8 border-b-8 border-r-10 border-t-transparent border-b-transparent mr-3 drop-shadow-md"
                style={{ borderRightColor: cueColor }}
              />
            </>
          )}

          {settings.cueLine.style === 'reading-band' && (
            <div
              className="w-full py-4 border-y"
              style={{
                borderColor: `${cueColor}55`,
                backgroundColor: `${cueColor}18`,
                opacity: settings.cueLine.opacity,
              }}
            >
              <div className="flex items-center justify-between px-4">
                <span
                  className="text-[10px] tracking-wider uppercase font-semibold font-mono"
                  style={{ color: cueColor }}
                >
                  {isEn ? 'Lens Eye-Line' : 'Foco da Lente'}
                </span>
                <span
                  className="text-[10px] tracking-wider uppercase font-semibold font-mono"
                  style={{ color: cueColor }}
                >
                  {isEn ? 'Reading Guide' : 'Linha Guia'}
                </span>
              </div>
            </div>
          )}

          {settings.cueLine.style === 'arrow-indicator' && (
            <div className="w-full flex justify-between items-center px-4">
              <div
                className="flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded"
                style={{
                  color: cueColor,
                  backgroundColor: `${cueColor}22`,
                }}
              >
                <span>▶</span>
                <span className="hidden sm:inline text-[10px] uppercase tracking-wider">
                  {isEn ? 'READ' : 'LEITURA'}
                </span>
              </div>
              <div
                className="flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded"
                style={{
                  color: cueColor,
                  backgroundColor: `${cueColor}22`,
                }}
              >
                <span className="hidden sm:inline text-[10px] uppercase tracking-wider">
                  {isEn ? 'READ' : 'LEITURA'}
                </span>
                <span>◀</span>
              </div>
            </div>
          )}

          {settings.cueLine.style === 'vignette' && (
            <div className="w-full">
              <div
                className="h-1 w-full"
                style={{
                  backgroundColor: cueColor,
                  opacity: settings.cueLine.opacity,
                  boxShadow: `0 0 14px ${cueColor}`,
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Gradientes de Vinheta / Suavização Superior e Inferior para conforto visual */}
      {settings.cueLine.style === 'vignette' && settings.cueLine.enabled && (
        <>
          <div
            className="pointer-events-none absolute top-0 left-0 right-0 h-32 z-20"
            style={{
              background: `linear-gradient(to bottom, ${themeStyles.bg === 'bg-black' ? '#000' : '#fff'} 30%, transparent 100%)`,
            }}
          />
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 z-20"
            style={{
              background: `linear-gradient(to top, ${themeStyles.bg === 'bg-black' ? '#000' : '#fff'} 30%, transparent 100%)`,
            }}
          />
        </>
      )}

      {/* Container de Rolagem do Texto - scroll-behavior padrão (auto) para atualização instantânea a 60fps */}
      <div
        ref={containerRef}
        onScroll={onManualScroll}
        tabIndex={0}
        className="w-full h-full overflow-y-scroll overflow-x-hidden no-scrollbar outline-none"
        style={{
          paddingLeft: `${settings.horizontalMargin}%`,
          paddingRight: `${settings.horizontalMargin}%`,
          paddingTop: `${settings.cueLine.positionPercent}vh`,
          paddingBottom: '85vh',
        }}
      >
        <div
          className="w-full max-w-5xl mx-auto"
          style={{
            fontFamily: fontFamilyStyle,
            fontSize: `${settings.fontSize}px`,
            lineHeight: settings.lineHeight,
            letterSpacing: `${settings.letterSpacing}em`,
            textAlign: settings.textAlign,
            color: themeStyles.textColor,
          }}
        >
          {paragraphs.map((p, pIndex) => {
            const trimmed = p.trim();

            if (!trimmed) {
              return (
                <div
                  key={pIndex}
                  style={{ height: `${settings.fontSize * 0.8}px` }}
                  aria-hidden="true"
                />
              );
            }

            const segments = parseParagraphSegments(p);

            return (
              <p
                key={pIndex}
                className="mb-8 font-normal transition-all"
                style={{
                  wordBreak: 'break-word',
                }}
              >
                {segments.map((seg, sIndex) => {
                  if (seg.type === 'heading') {
                    return (
                      <span
                        key={sIndex}
                        className="block font-bold tracking-tight opacity-90 my-3"
                        style={{
                          fontSize: `${settings.fontSize * 1.15}px`,
                          color: cueColor,
                        }}
                      >
                        {seg.content}
                      </span>
                    );
                  }

                  if (seg.type === 'speaker-note') {
                    if (!settings.highlightNotes) {
                      return <span key={sIndex}>[{seg.content}]</span>;
                    }
                    return (
                      <span
                        key={sIndex}
                        className="inline-block mx-1.5 px-3 py-1 rounded-md text-[0.65em] font-medium tracking-normal align-middle uppercase border shadow-sm"
                        style={{
                          backgroundColor: themeStyles.noteBg,
                          borderColor: themeStyles.noteBorder,
                          color: cueColor,
                          lineHeight: 1.4,
                          letterSpacing: '0.04em',
                        }}
                      >
                        {seg.content}
                      </span>
                    );
                  }

                  return <span key={sIndex}>{seg.content}</span>;
                })}
              </p>
            );
          })}

          {/* Indicador de Fim do Roteiro */}
          {isAtEnd && (
            <div className="mt-16 pt-8 border-t border-dashed border-white/20 text-center flex flex-col items-center justify-center gap-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
                <span className="text-xl font-semibold">
                  {isEn ? 'End of Script' : 'Fim do Roteiro'}
                </span>
              </div>
              <p className="text-sm opacity-60 max-w-md">
                {isEn
                  ? 'Great delivery! You have reached the end of your script.'
                  : 'Parabéns pela apresentação! Você completou a leitura do seu script.'}
              </p>
              <button
                onClick={onRestart}
                className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-sm font-medium border border-white/20 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                {isEn ? 'Restart from Top (Key R)' : 'Reiniciar do Topo (Tecla R)'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Contagem Regressiva de Início (3, 2, 1, GO!) - Clicável para iniciar imediatamente */}
      {isCountingDown && (
        <div
          onClick={onSkipCountdown}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm pointer-events-auto cursor-pointer"
          title={isEn ? 'Click to start immediately' : 'Clique para iniciar imediatamente'}
        >
          <div className="flex flex-col items-center animate-pulse text-center select-none">
            <span
              className="text-8xl md:text-9xl font-extrabold tracking-tighter tabular-nums"
              style={{ color: cueColor }}
            >
              {countdownValue > 0 ? countdownValue : 'GO!'}
            </span>
            <span className="mt-4 text-base md:text-lg font-medium text-white/80 tracking-wide uppercase">
              {countdownValue > 0
                ? isEn
                  ? 'Get ready in front of the camera...'
                  : 'Posicione-se frente à câmera...'
                : isEn
                ? 'On Air / Rolling!'
                : 'Gravando / No Ar!'}
            </span>
            <span className="mt-3 text-xs text-neutral-400 bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full border border-white/20 transition-all">
              {isEn ? 'Click anywhere or press Space to roll now' : 'Clique ou pressione Espaço para iniciar agora'}
            </span>
          </div>
        </div>
      )}

      {/* Indicador de Gravação de Vídeo em Andamento (Broadcast REC) */}
      {isRecording && (
        <div className="absolute top-4 right-4 z-40 flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-600/90 border border-rose-400 text-white font-mono text-xs font-bold shadow-lg animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-white" />
            <span>REC {formatTime(recordingDuration)}</span>
          </div>

          {onStopRecording && (
            <button
              onClick={onStopRecording}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900/90 hover:bg-neutral-800 border border-white/20 text-white text-xs font-semibold shadow-lg transition-all cursor-pointer"
              title={isEn ? 'Finish video recording' : 'Finalizar gravação de vídeo'}
            >
              <Square className="w-3 h-3 fill-current text-rose-400" />
              <span>{isEn ? 'Stop' : 'Parar'}</span>
            </button>
          )}
        </div>
      )}

      {/* Barra de Progresso Fina no Topo */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-40">
        <div
          className="h-full transition-all duration-100 ease-out"
          style={{
            width: `${scrollProgress}%`,
            backgroundColor: cueColor,
          }}
        />
      </div>
    </div>
  );
};
