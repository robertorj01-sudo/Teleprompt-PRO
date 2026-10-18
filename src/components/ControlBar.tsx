import React, { useState } from 'react';
import {
  TeleprompterSettings,
  ColorTheme,
  FontFamily,
  TextAlign,
  CueLineStyle,
  LicenseStatus,
} from '../types/teleprompter';
import { AppLanguage } from '../utils/i18n';
import {
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Type,
  Maximize2,
  FlipHorizontal,
  FlipVertical,
  Minus,
  Plus,
  Eye,
  Camera,
  Layers,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Mic,
  MicOff,
  Video,
  Square,
  Lock,
  Sparkles,
  Check,
} from 'lucide-react';
import { VIDEO_FILTERS, getVideoFilterDef } from '../utils/videoFilters';

interface ControlBarProps {
  lang: AppLanguage;
  settings: TeleprompterSettings;
  onUpdateSettings: (updater: (prev: TeleprompterSettings) => TeleprompterSettings) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onRestart: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  wordCount: number;
  elapsedSeconds: number;
  estimatedTotalSeconds: number;
  formattedElapsed: string;
  formattedEstimated: string;
  scrollProgress: number;
  isListeningVoice?: boolean;
  onToggleVoice?: () => void;
  onOpenVoiceGuide?: () => void;
  licenseStatus?: LicenseStatus;
  onOpenUpgradeModal?: (feature?: string) => void;
  isRecording?: boolean;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  lang,
  settings,
  onUpdateSettings,
  isPlaying,
  onTogglePlay,
  onRestart,
  onToggleFullscreen,
  isFullscreen,
  wordCount,
  formattedElapsed,
  formattedEstimated,
  scrollProgress,
  isListeningVoice = false,
  onToggleVoice,
  onOpenVoiceGuide,
  licenseStatus,
  onOpenUpgradeModal,
  isRecording = false,
  onStartRecording,
  onStopRecording,
}) => {
  const isEn = lang === 'en';
  const [activeTab, setActiveTab] = useState<'quick' | 'typography' | 'studio' | 'cue'>('quick');

  const updateField = <K extends keyof TeleprompterSettings>(
    field: K,
    val: TeleprompterSettings[K]
  ) => {
    onUpdateSettings((prev) => ({ ...prev, [field]: val }));
  };

  const updateCueLine = (patch: Partial<TeleprompterSettings['cueLine']>) => {
    onUpdateSettings((prev) => ({
      ...prev,
      cueLine: { ...prev.cueLine, ...patch },
    }));
  };

  return (
    <div className="w-full bg-neutral-900 border-t border-neutral-800 text-neutral-200 transition-all select-none">
      {/* Barra de Status e Informações Rápidas */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 border-b border-neutral-800/80 text-xs text-neutral-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="text-neutral-500">{isEn ? 'TIME:' : 'TEMPO:'}</span>
            <span className="text-white font-semibold tabular-nums">{formattedElapsed}</span>
            <span className="text-neutral-600">/</span>
            <span className="text-neutral-400 tabular-nums">{formattedEstimated}</span>
          </div>
          <span className="text-neutral-700" aria-hidden="true">·</span>
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500">{isEn ? 'WORDS:' : 'PALAVRAS:'}</span>
            <span className="text-white font-semibold tabular-nums">{wordCount}</span>
          </div>
          <span className="text-neutral-700 hidden sm:inline" aria-hidden="true">·</span>
          <div className="hidden sm:flex items-center gap-1.5 font-mono">
            <span className="text-neutral-500">{isEn ? 'PROGRESS:' : 'PROGRESSO:'}</span>
            <span className="text-amber-400 font-semibold tabular-nums">{Math.round(scrollProgress)}%</span>
          </div>
        </div>

        {/* Abas secundárias de configuração */}
        <div className="flex items-center gap-1 bg-neutral-800/60 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('quick')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'quick' ? 'bg-neutral-700 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              <span>{isEn ? 'Controls' : 'Controles'}</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('typography')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'typography' ? 'bg-neutral-700 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5" />
              <span>{isEn ? 'Text & Layout' : 'Texto & Layout'}</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('cue')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'cue' ? 'bg-neutral-700 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              <span>{isEn ? 'Cue Line' : 'Linha Guia'}</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('studio')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'studio' ? 'bg-neutral-700 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>{isEn ? 'Studio & Mirror' : 'Estúdio & Espelho'}</span>
            </span>
          </button>
        </div>
      </div>

      {/* Conteúdo da Aba Ativa */}
      <div className="p-4">
        {/* ABA 1: CONTROLES RÁPIDOS */}
        {activeTab === 'quick' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Bloco Primário: Play/Pause e Reiniciar */}
            <div className="md:col-span-4 flex items-center gap-3">
              <button
                onClick={onTogglePlay}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-sm tracking-wide transition-all shadow-md active:scale-95 cursor-pointer ${
                  isPlaying
                    ? 'bg-amber-500 hover:bg-amber-400 text-black'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
                title={isEn ? 'Shortcut: Spacebar' : 'Atalho: Barra de Espaço'}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-5 h-5 fill-current" />
                    <span>{isEn ? 'PAUSE (Space)' : 'PAUSAR (Espaço)'}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                    <span>{isEn ? 'START (Space)' : 'INICIAR (Espaço)'}</span>
                  </>
                )}
              </button>

              <button
                onClick={onRestart}
                className="p-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-neutral-300 hover:text-white border border-neutral-700 transition-colors cursor-pointer"
                title={isEn ? 'Restart from Top (R)' : 'Reiniciar do Topo (Atalho: R)'}
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={onToggleFullscreen}
                className={`p-3 rounded-xl active:scale-95 border transition-colors cursor-pointer ${
                  isFullscreen
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border-neutral-700'
                }`}
                title={isEn ? 'Fullscreen (F)' : 'Tela Cheia (Atalho: F)'}
              >
                <Maximize2 className="w-5 h-5" />
              </button>

              {onToggleVoice && (
                <button
                  onClick={onToggleVoice}
                  className={`p-3 rounded-xl active:scale-95 border transition-colors cursor-pointer ${
                    isListeningVoice
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border-neutral-700'
                  }`}
                  title={
                    isListeningVoice
                      ? isEn
                        ? 'Voice control active'
                        : 'Controle por voz ativo'
                      : isEn
                      ? 'Enable hands-free voice control'
                      : 'Ativar controle por voz hands-free'
                  }
                >
                  {isListeningVoice ? <Mic className="w-5 h-5 text-rose-400" /> : <MicOff className="w-5 h-5" />}
                </button>
              )}

              {onStartRecording && (
                <button
                  onClick={isRecording ? onStopRecording : onStartRecording}
                  className={`p-3 rounded-xl active:scale-95 border transition-all cursor-pointer ${
                    isRecording
                      ? 'bg-rose-600 text-white border-rose-500 animate-pulse shadow-md'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-rose-400 hover:text-rose-300 border-neutral-700'
                  }`}
                  title={
                    isRecording
                      ? isEn
                        ? 'Stop Video Recording'
                        : 'Parar Gravação de Vídeo'
                      : isEn
                      ? 'Record Presentation (Camera + Audio)'
                      : 'Gravar Apresentação (Câmera + Áudio)'
                  }
                >
                  {isRecording ? <Square className="w-5 h-5 fill-current" /> : <Video className="w-5 h-5" />}
                </button>
              )}
            </div>

            {/* Slider de Velocidade */}
            <div className="md:col-span-4 bg-neutral-800/40 p-3 rounded-xl border border-neutral-800">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
                  {isEn ? 'Scroll Speed' : 'Velocidade de Rolagem'}
                </span>
                <span className="font-mono text-amber-400 font-bold tabular-nums">
                  {settings.speed} <span className="text-[10px] text-neutral-500">/ 100</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateField('speed', Math.max(1, settings.speed - 2))}
                  className="p-1 rounded bg-neutral-700 hover:bg-neutral-600 text-neutral-300 cursor-pointer"
                  title={isEn ? 'Decrease speed (Down Arrow)' : 'Diminuir velocidade (Seta Baixo)'}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={settings.speed}
                  onChange={(e) => updateField('speed', Number(e.target.value))}
                  className="flex-1 accent-amber-500 h-1.5 bg-neutral-700 rounded-lg cursor-pointer"
                />
                <button
                  onClick={() => updateField('speed', Math.min(100, settings.speed + 2))}
                  className="p-1 rounded bg-neutral-700 hover:bg-neutral-600 text-neutral-300 cursor-pointer"
                  title={isEn ? 'Increase speed (Up Arrow)' : 'Aumentar velocidade (Seta Cima)'}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Slider de Tamanho da Fonte */}
            <div className="md:col-span-4 bg-neutral-800/40 p-3 rounded-xl border border-neutral-800">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
                  {isEn ? 'Font Size' : 'Tamanho da Fonte'}
                </span>
                <span className="font-mono text-cyan-400 font-bold tabular-nums">
                  {settings.fontSize}px
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateField('fontSize', Math.max(18, settings.fontSize - 2))}
                  className="p-1 rounded bg-neutral-700 hover:bg-neutral-600 text-neutral-300 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="range"
                  min="18"
                  max="100"
                  value={settings.fontSize}
                  onChange={(e) => updateField('fontSize', Number(e.target.value))}
                  className="flex-1 accent-cyan-400 h-1.5 bg-neutral-700 rounded-lg cursor-pointer"
                />
                <button
                  onClick={() => updateField('fontSize', Math.min(100, settings.fontSize + 2))}
                  className="p-1 rounded bg-neutral-700 hover:bg-neutral-600 text-neutral-300 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: TIPOGRAFIA & LAYOUT */}
        {activeTab === 'typography' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Espaçamento Entre Linhas */}
            <div className="bg-neutral-800/40 p-3 rounded-xl border border-neutral-800">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-medium text-neutral-300">
                  {isEn ? 'Line Spacing' : 'Espaço Entre Linhas'}
                </span>
                <span className="font-mono text-neutral-400 tabular-nums">{settings.lineHeight.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="1.2"
                max="2.4"
                step="0.1"
                value={settings.lineHeight}
                onChange={(e) => updateField('lineHeight', Number(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-neutral-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Margens Laterais (Padding) */}
            <div className="bg-neutral-800/40 p-3 rounded-xl border border-neutral-800">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-medium text-neutral-300">
                  {isEn ? 'Side Margins (Eye Span)' : 'Margens Laterais (Foco)'}
                </span>
                <span className="font-mono text-neutral-400 tabular-nums">{settings.horizontalMargin}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="35"
                step="1"
                value={settings.horizontalMargin}
                onChange={(e) => updateField('horizontalMargin', Number(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-neutral-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Alinhamento de Texto */}
            <div className="bg-neutral-800/40 p-3 rounded-xl border border-neutral-800">
              <span className="block text-xs font-medium text-neutral-300 mb-2">
                {isEn ? 'Text Alignment' : 'Alinhamento'}
              </span>
              <div className="flex items-center gap-1">
                {(['left', 'center', 'right'] as TextAlign[]).map((align) => (
                  <button
                    key={align}
                    onClick={() => updateField('textAlign', align)}
                    className={`flex-1 py-1.5 rounded flex items-center justify-center text-xs transition-colors cursor-pointer ${
                      settings.textAlign === align
                        ? 'bg-neutral-700 text-white font-semibold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {align === 'left' && <AlignLeft className="w-4 h-4" />}
                    {align === 'center' && <AlignCenter className="w-4 h-4" />}
                    {align === 'right' && <AlignRight className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Tipo de Fonte */}
            <div className="bg-neutral-800/40 p-3 rounded-xl border border-neutral-800">
              <span className="block text-xs font-medium text-neutral-300 mb-2">
                {isEn ? 'Font Family' : 'Estilo da Fonte'}
              </span>
              <select
                value={settings.fontFamily}
                onChange={(e) => updateField('fontFamily', e.target.value as FontFamily)}
                className="w-full bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="sans">Plus Jakarta (Modern Sans)</option>
                <option value="lexend">Lexend (High Legibility)</option>
                <option value="mono">JetBrains Mono (Monospace)</option>
                <option value="serif">Georgia (Classic Serif)</option>
              </select>
            </div>
          </div>
        )}

        {/* ABA 3: LINHA GUIA DE LEITURA (CUE LINE) */}
        {activeTab === 'cue' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
            {/* Ativar/Desativar */}
            <div className="bg-neutral-800/40 p-3 rounded-xl border border-neutral-800 flex items-center justify-between">
              <div>
                <span className="block text-xs font-semibold text-neutral-200">
                  {isEn ? 'Reading Marker' : 'Marcador de Leitura'}
                </span>
                <span className="text-[11px] text-neutral-400">
                  {isEn ? 'Visual guide at lens height' : 'Guia visual na altura da lente'}
                </span>
              </div>
              <button
                onClick={() => updateCueLine({ enabled: !settings.cueLine.enabled })}
                className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  settings.cueLine.enabled ? 'bg-amber-500' : 'bg-neutral-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    settings.cueLine.enabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Altura da Linha (Posição Vertical) */}
            <div className="bg-neutral-800/40 p-3 rounded-xl border border-neutral-800">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-medium text-neutral-300">
                  {isEn ? 'Vertical Position (Lens)' : 'Posição Vertical (Lente)'}
                </span>
                <span className="font-mono text-amber-400 tabular-nums">{settings.cueLine.positionPercent}%</span>
              </div>
              <input
                type="range"
                min="15"
                max="65"
                step="1"
                disabled={!settings.cueLine.enabled}
                value={settings.cueLine.positionPercent}
                onChange={(e) => updateCueLine({ positionPercent: Number(e.target.value) })}
                className="w-full accent-amber-500 h-1.5 bg-neutral-700 rounded-lg cursor-pointer disabled:opacity-40"
              />
            </div>

            {/* Estilo Visual do Marcador */}
            <div className="bg-neutral-800/40 p-3 rounded-xl border border-neutral-800">
              <span className="block text-xs font-medium text-neutral-300 mb-2">
                {isEn ? 'Marker Style' : 'Estilo do Marcador'}
              </span>
              <div className="grid grid-cols-2 gap-1 text-xs">
                {(
                  [
                    { id: 'subtle-line', label: isEn ? 'Laser Line' : 'Linha Laser' },
                    { id: 'reading-band', label: isEn ? 'Focus Band' : 'Faixa Translúcida' },
                    { id: 'arrow-indicator', label: isEn ? 'Side Arrows' : 'Setas Laterais' },
                    { id: 'vignette', label: isEn ? 'Vignette' : 'Vinheta Foco' },
                  ] as { id: CueLineStyle; label: string }[]
                ).map((st) => (
                  <button
                    key={st.id}
                    disabled={!settings.cueLine.enabled}
                    onClick={() => updateCueLine({ style: st.id })}
                    className={`py-1 px-2 rounded text-[11px] truncate text-center transition-colors cursor-pointer ${
                      settings.cueLine.style === st.id
                        ? 'bg-neutral-700 text-amber-300 font-semibold border border-amber-500/30'
                        : 'text-neutral-400 hover:text-white bg-neutral-800'
                    } disabled:opacity-40`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notas de Orador [PAUSA] */}
            <div className="bg-neutral-800/40 p-3 rounded-xl border border-neutral-800 flex items-center justify-between">
              <div>
                <span className="block text-xs font-semibold text-neutral-200">
                  {isEn ? 'Highlight [Cues]' : 'Destacar [Notas]'}
                </span>
                <span className="text-[11px] text-neutral-400">
                  {isEn ? 'Stage notes like [SMILE]' : 'Instruções como [SORRIR]'}
                </span>
              </div>
              <button
                onClick={() => updateField('highlightNotes', !settings.highlightNotes)}
                className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  settings.highlightNotes ? 'bg-amber-500' : 'bg-neutral-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    settings.highlightNotes ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* ABA 4: ESTÚDIO & ESPELHO */}
        {activeTab === 'studio' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
            {/* Espelhamento Óptico (Flip X / Flip Y) */}
            <div className="bg-neutral-800/40 p-3 rounded-xl border border-neutral-800">
              <div className="flex items-center justify-between mb-2">
                <span className="block text-xs font-semibold text-neutral-200">
                  {isEn ? 'Optical Mirror' : 'Espelhamento (Mirror)'}
                </span>
                {licenseStatus && !licenseStatus.isPro && (
                  <span className="text-[10px] font-bold text-amber-400 flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" /> PRO
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (licenseStatus && !licenseStatus.isPro) {
                      onOpenUpgradeModal?.('mirror');
                      return;
                    }
                    updateField('mirrorHorizontal', !settings.mirrorHorizontal);
                  }}
                  className={`flex-1 py-1.5 px-2 rounded flex items-center justify-center gap-1.5 text-xs font-medium border transition-colors cursor-pointer ${
                    settings.mirrorHorizontal
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
                  }`}
                  title={
                    isEn
                      ? 'Flip horizontally for optical beam-splitter rigs (M)'
                      : 'Inverter horizontalmente para espelhos de teleprompter profissionais (Atalho: M)'
                  }
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Mirror H' : 'Espelho H'}</span>
                </button>

                <button
                  onClick={() => {
                    if (licenseStatus && !licenseStatus.isPro) {
                      onOpenUpgradeModal?.('mirror');
                      return;
                    }
                    updateField('mirrorVertical', !settings.mirrorVertical);
                  }}
                  className={`flex-1 py-1.5 px-2 rounded flex items-center justify-center gap-1.5 text-xs font-medium border transition-colors cursor-pointer ${
                    settings.mirrorVertical
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
                  }`}
                  title={isEn ? 'Flip vertically' : 'Inverter verticalmente'}
                >
                  <FlipVertical className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Mirror V' : 'Espelho V'}</span>
                </button>
              </div>
            </div>

            {/* Tema de Cores / Contraste */}
            <div className="bg-neutral-800/40 p-3 rounded-xl border border-neutral-800">
              <span className="block text-xs font-semibold text-neutral-200 mb-2">
                {isEn ? 'Theme & Contrast' : 'Tema & Contraste'}
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(
                  [
                    { id: 'dark-white', label: isEn ? 'Studio' : 'Estúdio', bg: 'bg-black text-white border-white/20' },
                    { id: 'dark-yellow', label: isEn ? 'Yellow' : 'Amarelo', bg: 'bg-black text-yellow-300 border-yellow-400/40' },
                    { id: 'dark-green', label: isEn ? 'Green' : 'Verde', bg: 'bg-black text-emerald-400 border-emerald-400/40' },
                    { id: 'light-black', label: isEn ? 'Light' : 'Claro', bg: 'bg-white text-black border-neutral-300' },
                    { id: 'sepia', label: isEn ? 'Sepia' : 'Sépia', bg: 'bg-[#f7f1e3] text-[#433422] border-amber-800/30' },
                  ] as { id: ColorTheme; label: string; bg: string }[]
                ).map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => updateField('colorTheme', theme.id)}
                    className={`px-2 py-1 rounded text-[11px] font-medium border cursor-pointer ${theme.bg} ${
                      settings.colorTheme === theme.id ? 'ring-2 ring-amber-400' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {theme.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contagem Regressiva Antes de Começar */}
            <div className="bg-neutral-800/40 p-3 rounded-xl border border-neutral-800">
              <span className="block text-xs font-semibold text-neutral-200 mb-2">
                {isEn ? 'Pre-Start Countdown' : 'Contagem Pré-Início'}
              </span>
              <div className="flex items-center gap-1">
                {[0, 3, 5, 10].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => updateField('countdownSeconds', sec)}
                    className={`flex-1 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                      settings.countdownSeconds === sec
                        ? 'bg-amber-500 text-black font-bold'
                        : 'bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {sec === 0 ? (isEn ? 'Off' : 'Sem') : `${sec}s`}
                  </button>
                ))}
              </div>
            </div>

            {/* Controle por Voz (Web Speech API) */}
            <div className="bg-neutral-800/40 p-3 rounded-xl border border-neutral-800 flex items-center justify-between">
              <div>
                <span className="block text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-rose-400" />
                  <span>{isEn ? 'Voice Commands' : 'Comandos por Voz'}</span>
                </span>
                <button
                  onClick={onOpenVoiceGuide}
                  className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                >
                  {isEn ? 'View commands (Start/Pause)' : 'Ver comandos (Start/Pause)'}
                </button>
              </div>
              {onToggleVoice && (
                <button
                  onClick={onToggleVoice}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    isListeningVoice ? 'bg-rose-500' : 'bg-neutral-700'
                  }`}
                  title={isEn ? 'Toggle voice control' : 'Ativar/Desativar controle por voz'}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      isListeningVoice ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              )}
            </div>

            {/* Câmera / Webcam PiP (Espelho Pessoal) */}
            <div className="bg-neutral-800/40 p-3 rounded-xl border border-neutral-800 flex items-center justify-between">
              <div>
                <span className="block text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  <span>Webcam Preview</span>
                </span>
                <span className="text-[11px] text-neutral-400">
                  {isEn ? 'Live framing monitor' : 'Feedback visual em tempo real'}
                </span>
              </div>
              <button
                onClick={() => updateField('webcamEnabled', !settings.webcamEnabled)}
                className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  settings.webcamEnabled ? 'bg-amber-500' : 'bg-neutral-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    settings.webcamEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Seção dos 12 Filtros de Vídeo */}
          <div className="mt-4 pt-3 border-t border-neutral-800/80">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-neutral-200">
                  {isEn ? '12 Video Color Grading Filters' : '12 Variações de Filtros de Vídeo'}
                </span>
                <span className="text-[11px] text-amber-300 font-mono">
                  {isEn
                    ? getVideoFilterDef(settings.videoFilter).nameEn
                    : getVideoFilterDef(settings.videoFilter).namePt}
                </span>
              </div>
              <span className="text-[11px] text-neutral-400 italic hidden sm:inline">
                {isEn
                  ? getVideoFilterDef(settings.videoFilter).descriptionEn
                  : getVideoFilterDef(settings.videoFilter).descriptionPt}
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 custom-scrollbar">
              {VIDEO_FILTERS.map((f) => {
                const isSelected = (settings.videoFilter || 'normal') === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => updateField('videoFilter', f.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-sm font-semibold ring-1 ring-amber-500/30'
                        : 'bg-neutral-800/60 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border-neutral-700/60'
                    }`}
                    title={isEn ? f.descriptionEn : f.descriptionPt}
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
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
