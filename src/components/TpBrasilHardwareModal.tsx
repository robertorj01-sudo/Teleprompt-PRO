import React, { useState } from 'react';
import {
  X,
  Monitor,
  Tv,
  Tablet,
  Presentation,
  FlipHorizontal,
  FlipVertical,
  Check,
  Radio,
  Gamepad2,
  ExternalLink,
  Copy,
  EyeOff,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import {
  HardwareRemoteMode,
  TeleprompterSettings,
  TpBrasilModelId,
} from '../types/teleprompter';
import { AppLanguage } from '../utils/i18n';
import {
  applyTpBrasilPreset,
  HARDWARE_REMOTE_PROFILES,
  TP_BRASIL_PROFILES,
} from '../utils/tpBrasilHardware';
import { HardwareSignal } from '../hooks/useHardwareRemote';

interface TpBrasilHardwareModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
  settings: TeleprompterSettings;
  onUpdateSettings: (updater: (prev: TeleprompterSettings) => TeleprompterSettings) => void;
  onLaunchPrompterClean: () => void;
  connectedGamepads: string[];
  lastHardwareSignal: HardwareSignal | null;
}

export const TpBrasilHardwareModal: React.FC<TpBrasilHardwareModalProps> = ({
  isOpen,
  onClose,
  lang,
  settings,
  onUpdateSettings,
  onLaunchPrompterClean,
  connectedGamepads,
  lastHardwareSignal,
}) => {
  const isEn = lang === 'en';
  const [copiedHdmiUrl, setCopiedHdmiUrl] = useState(false);

  if (!isOpen) return null;

  const activeModel = settings.tpBrasilModel || 'none';
  const activeRemote = settings.hardwareRemoteMode || 'standard';

  const hdmiOutputUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}?mode=hdmi`
      : '?mode=hdmi';

  const handleSelectModel = (modelId: TpBrasilModelId) => {
    onUpdateSettings((prev) => applyTpBrasilPreset(prev, modelId));
  };

  const handleSelectRemote = (mode: HardwareRemoteMode) => {
    onUpdateSettings((prev) => ({ ...prev, hardwareRemoteMode: mode }));
  };

  const handleCopyHdmiUrl = async () => {
    try {
      await navigator.clipboard.writeText(hdmiOutputUrl);
      setCopiedHdmiUrl(true);
      setTimeout(() => setCopiedHdmiUrl(false), 2000);
    } catch {
      // Clipboard fallback ignored
    }
  };

  const getModelIcon = (id: TpBrasilModelId) => {
    switch (id) {
      case 'tp19xpro':
        return <Monitor className="w-5 h-5 text-amber-400" />;
      case 'tp20ptz':
        return <Tv className="w-5 h-5 text-amber-400" />;
      case 'minitp':
        return <Tablet className="w-5 h-5 text-amber-400" />;
      case 'presidencial':
        return <Presentation className="w-5 h-5 text-amber-400" />;
      default:
        return <Monitor className="w-5 h-5 text-neutral-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden text-neutral-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center shrink-0">
              <Monitor className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                  {isEn ? 'TP Brasil Hardware Setup' : 'Compatibilidade Hardware TP Brasil'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  tpbrasil.com.br
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                {isEn
                  ? 'Optical presets for 70/30 beam-splitter glass, HDMI clean output, Bluetooth remotes & foot pedals'
                  : 'Calibração óptica para vidro 70/30, saída HDMI estúdio, controles Bluetooth e pedais'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label={isEn ? 'Close' : 'Fechar'}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* 1. Seleção de Modelo TP Brasil */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs uppercase tracking-wider font-bold text-neutral-300">
                {isEn ? '1. Select Your TP Brasil Equipment' : '1. Selecione seu Equipamento TP Brasil'}
              </h3>
              {activeModel !== 'none' && (
                <button
                  onClick={() => handleSelectModel('none')}
                  className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{isEn ? 'Reset to Standard' : 'Voltar ao Padrão'}</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TP_BRASIL_PROFILES.map((profile) => {
                const isSelected = activeModel === profile.id;
                return (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => handleSelectModel(profile.id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-amber-500/12 border-amber-400 ring-1 ring-amber-400/40 shadow-md'
                        : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {getModelIcon(profile.id)}
                        <div>
                          <span className="font-bold text-sm text-white block leading-tight">
                            {profile.name}
                          </span>
                          <span className="text-[11px] text-amber-300 font-medium">
                            {isEn ? profile.categoryEn : profile.categoryPt}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 text-[10px] font-mono">
                          {profile.glassSpec}
                        </span>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-neutral-400 font-medium mt-0.5">
                      {isEn ? profile.screenSpecEn : profile.screenSpecPt}
                    </p>
                    <p className="text-[11px] text-neutral-300 leading-relaxed">
                      {isEn ? profile.summaryEn : profile.summaryPt}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 2. Calibração Óptica & Saída HDMI */}
          <section className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xs uppercase tracking-wider font-bold text-neutral-300">
                {isEn ? '2. Mirror Axis & 70/30 Glass Calibration' : '2. Espelhamento Óptico & Vidro 70/30'}
              </h3>
              <span className="text-[11px] text-neutral-400">
                {isEn
                  ? 'Invert according to monitor/tablet orientation in the rig'
                  : 'Ajuste conforme a posição da tela no suporte do teleprompter'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings((prev) => ({
                    ...prev,
                    mirrorVertical: !prev.mirrorVertical,
                  }))
                }
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                  settings.mirrorVertical
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <FlipVertical className="w-4 h-4" />
                <span>{isEn ? 'Vertical Flip (V)' : 'Espelho Vertical (V)'}</span>
                <span className="text-[10px] opacity-75">
                  {settings.mirrorVertical ? (isEn ? 'Active' : 'Ativo') : isEn ? 'Off' : 'Desligado'}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onUpdateSettings((prev) => ({
                    ...prev,
                    mirrorHorizontal: !prev.mirrorHorizontal,
                  }))
                }
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                  settings.mirrorHorizontal
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <FlipHorizontal className="w-4 h-4" />
                <span>{isEn ? 'Horiz. Flip (M)' : 'Espelho Horiz. (M)'}</span>
                <span className="text-[10px] opacity-75">
                  {settings.mirrorHorizontal ? (isEn ? 'Active' : 'Ativo') : isEn ? 'Off' : 'Desligado'}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onUpdateSettings((prev) => ({
                    ...prev,
                    beamSplitterBoost: !prev.beamSplitterBoost,
                    colorTheme: !prev.beamSplitterBoost ? 'dark-white' : prev.colorTheme,
                    backdropId: !prev.beamSplitterBoost ? 'none' : prev.backdropId,
                  }))
                }
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                  settings.beamSplitterBoost
                    ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>{isEn ? '70/30 Glass Boost' : 'Boost Vidro 70/30'}</span>
                <span className="text-[10px] opacity-75">
                  {settings.beamSplitterBoost ? (isEn ? 'Pure #000' : 'Preto Puro') : isEn ? 'Standard' : 'Normal'}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onUpdateSettings((prev) => ({
                    ...prev,
                    blackoutScreen: !prev.blackoutScreen,
                  }))
                }
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                  settings.blackoutScreen
                    ? 'bg-rose-500/25 border-rose-500 text-rose-200'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <EyeOff className="w-4 h-4" />
                <span>{isEn ? 'Stage Blackout (B)' : 'Blackout Palco (B)'}</span>
                <span className="text-[10px] opacity-75">
                  {settings.blackoutScreen ? (isEn ? 'Screen Black' : 'Tela Preta') : isEn ? 'Off' : 'Normal'}
                </span>
              </button>
            </div>

            {/* Saída HDMI / Monitor Duplo */}
            <div className="pt-3 border-t border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Tv className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {isEn
                      ? 'Dual Monitor / HDMI Splitter Output (TP19XPRO · TP Presidencial)'
                      : 'Saída Monitor Duplo / Divisor HDMI (TP19XPRO · TP Presidencial)'}
                  </span>
                </span>
                <p className="text-[11px] text-neutral-400">
                  {isEn
                    ? 'Open a clean mirrored HDMI window to drag onto your TP Brasil monitor, synced live with your controls.'
                    : 'Abra uma janela espelhada limpa para arrastar para o monitor HDMI da TP Brasil, sincronizada em tempo real.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    onLaunchPrompterClean();
                    onClose();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-colors cursor-pointer"
                >
                  {isEn ? 'Clean Fullscreen Here' : 'Tela Limpa Aqui'}
                </button>

                <a
                  href={hdmiOutputUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white font-semibold text-xs transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isEn ? 'Open 2nd HDMI Screen' : 'Abrir 2ª Tela HDMI'}</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyHdmiUrl}
                  className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  title={isEn ? 'Copy HDMI output URL' : 'Copiar link da saída HDMI'}
                >
                  {copiedHdmiUrl ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* 3. Controles Remotos, Pedais Sem Fio e Bluetooth */}
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xs uppercase tracking-wider font-bold text-neutral-300 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {isEn
                    ? '3. Physical Remote, Foot Pedal & Bluetooth Controller'
                    : '3. Controle Remoto Físico, Pedal e Bluetooth'}
                </span>
              </h3>

              {connectedGamepads.length > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold">
                  <Gamepad2 className="w-3.5 h-3.5" />
                  <span>{connectedGamepads[0].slice(0, 32)}</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {HARDWARE_REMOTE_PROFILES.map((remote) => {
                const isSelected = activeRemote === remote.id;
                const mappings = isEn ? remote.mappingsEn : remote.mappingsPt;
                return (
                  <button
                    key={remote.id}
                    type="button"
                    onClick={() => handleSelectRemote(remote.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-neutral-800 border-amber-400 ring-1 ring-amber-400/30'
                        : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">
                        {isEn ? remote.nameEn : remote.namePt}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-amber-300/90 mb-2">
                      {isEn ? remote.subtitleEn : remote.subtitlePt}
                    </p>
                    <ul className="space-y-0.5 text-[10px] text-neutral-400">
                      {mappings.map((m, i) => (
                        <li key={i}>• {m}</li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>

            {/* Testador de Hardware ao Vivo */}
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-neutral-300">
                <Gamepad2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  {isEn
                    ? 'Hardware Signal Tester: press any button on your remote, pedal, or Bluetooth controller'
                    : 'Testador de Sinal: pressione qualquer botão do controle, pedal ou teclado agora'}
                </span>
              </div>
              {lastHardwareSignal ? (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-[11px]">
                  {lastHardwareSignal.code} → {lastHardwareSignal.action}
                </span>
              ) : (
                <span className="text-[11px] text-neutral-500 font-mono">
                  {isEn ? 'Waiting for input...' : 'Aguardando comando...'}
                </span>
              )}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-neutral-800 bg-neutral-950/60 flex flex-wrap items-center justify-between gap-3">
          <a
            href="https://tpbrasil.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-neutral-400 hover:text-amber-400 inline-flex items-center gap-1 transition-colors"
          >
            <span>{isEn ? 'Official TP Brasil Website' : 'Site Oficial TP Brasil (tpbrasil.com.br)'}</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-colors cursor-pointer"
          >
            {isEn ? 'Apply & Close' : 'Aplicar & Fechar'}
          </button>
        </div>
      </div>
    </div>
  );
};
