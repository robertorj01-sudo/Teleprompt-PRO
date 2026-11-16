import {
  HardwareRemoteMode,
  TeleprompterSettings,
  TpBrasilModelId,
} from '../types/teleprompter';

export interface TpBrasilHardwareProfile {
  id: TpBrasilModelId;
  name: string;
  categoryPt: string;
  categoryEn: string;
  screenSpecPt: string;
  screenSpecEn: string;
  glassSpec: string;
  summaryPt: string;
  summaryEn: string;
  recommendedSettings: Partial<TeleprompterSettings>;
  mirrorHorizontal: boolean;
  mirrorVertical: boolean;
  recommendedFontSize: number;
  recommendedMargin: number;
  recommendedCuePosition: number;
  recommendedColorTheme: TeleprompterSettings['colorTheme'];
  recommendedRemoteMode: HardwareRemoteMode;
  recommendedCleanOutput: boolean;
  recommendedBeamBoost: boolean;
}

export const TP_BRASIL_PROFILES: TpBrasilHardwareProfile[] = [
  {
    id: 'tp19xpro',
    name: 'TP19XPRO',
    categoryPt: 'Estúdio 19" Profissional',
    categoryEn: '19" Studio Teleprompter',
    screenSpecPt: 'Monitor 19" + Vidro Cristal Beam-Splitter 70/30 (2mm)',
    screenSpecEn: '19" Monitor + 70/30 Beam-Splitter Crystal Glass (2mm)',
    glassSpec: '70/30 · 2mm',
    summaryPt:
      'Calibrado para câmera de estúdio com monitor 19" na base inferior: ativa Espelhamento Vertical, preto puro #000000 para zero efeito fantasma no vidro e fonte de estúdio (58px).',
    summaryEn:
      'Calibrated for 19" studio beam-splitter rigs: enables Vertical Flip for bottom-tray reflection, pure #000000 black to prevent ghosting, and 58px studio font.',
    mirrorHorizontal: false,
    mirrorVertical: true,
    recommendedFontSize: 58,
    recommendedMargin: 10,
    recommendedCuePosition: 34,
    recommendedColorTheme: 'dark-white',
    recommendedRemoteMode: 'shuttle',
    recommendedCleanOutput: true,
    recommendedBeamBoost: true,
    recommendedSettings: {
      fontFamily: 'lexend',
      lineHeight: 1.55,
      backdropId: 'none',
    },
  },
  {
    id: 'tp20ptz',
    name: 'TP20PTZ Broadcast',
    categoryPt: 'Câmeras PTZ & Broadcast',
    categoryEn: 'PTZ & Broadcast Studio',
    screenSpecPt: 'Monitor LED 19" Integrado + Espelho Amplo p/ PTZ',
    screenSpecEn: 'Built-in 19" LED Monitor + Wide PTZ Mirror',
    glassSpec: '70/30 PTZ',
    summaryPt:
      'Otimizado para câmeras PTZ em estúdios de TV e podcasts: margens largas (12%) para centralizar o olhar na lente PTZ, texto amarelo de alto contraste e saída limpa HDMI.',
    summaryEn:
      'Optimized for PTZ cameras in broadcast studios: balanced margins (12%) aligned to the PTZ lens, high-contrast yellow text, and clean HDMI output.',
    mirrorHorizontal: false,
    mirrorVertical: true,
    recommendedFontSize: 54,
    recommendedMargin: 12,
    recommendedCuePosition: 36,
    recommendedColorTheme: 'dark-yellow',
    recommendedRemoteMode: 'shuttle',
    recommendedCleanOutput: true,
    recommendedBeamBoost: true,
    recommendedSettings: {
      fontFamily: 'lexend',
      lineHeight: 1.5,
      backdropId: 'none',
    },
  },
  {
    id: 'minitp',
    name: 'Mini TP',
    categoryPt: 'Portátil (Tablet / Celular)',
    categoryEn: 'Portable (Tablet / Smartphone)',
    screenSpecPt: 'Bandeja Universal até 210 × 255mm (iPad / Android / DSLR)',
    screenSpecEn: 'Universal Tray up to 210 × 255mm (iPad / Android / DSLR)',
    glassSpec: '70/30 Compact',
    summaryPt:
      'Configuração ideal para iPad, tablet Android ou celular apoiado no Mini TP: ativa Espelho Vertical, fonte nítida de 38px para telas de 8" a 11" e suporte a apresentador/pedal Bluetooth.',
    summaryEn:
      'Ideal setup for iPad, Android tablets or smartphones on Mini TP: enables Vertical Flip, crisp 38px font for 8"-11" displays, and Bluetooth remote/pedal control.',
    mirrorHorizontal: false,
    mirrorVertical: true,
    recommendedFontSize: 38,
    recommendedMargin: 7,
    recommendedCuePosition: 32,
    recommendedColorTheme: 'dark-white',
    recommendedRemoteMode: 'presenter',
    recommendedCleanOutput: false,
    recommendedBeamBoost: true,
    recommendedSettings: {
      fontFamily: 'sans',
      lineHeight: 1.45,
      backdropId: 'none',
    },
  },
  {
    id: 'presidencial',
    name: 'TP Presidencial (Púlpito)',
    categoryPt: 'Palco & Palestras (1 ou 2 Pontos)',
    categoryEn: 'Stage & Keynote (1 or 2 Stands)',
    screenSpecPt: 'Hastes de Alumínio + Espelho Refletor (1 ou 2 Pontos HDMI)',
    screenSpecEn: 'Aluminum Stands + Controlled Reflection Glass (1 or 2 HDMI)',
    glassSpec: 'Stage Reflect',
    summaryPt:
      'Preparado para palcos e eventos ao vivo com duplicação HDMI: texto gigante (64px) de alto contraste contra iluminação de palco, espelhamento vertical e atalho de Blackout (tecla B).',
    summaryEn:
      'Built for live stages and speeches with HDMI splitter: giant high-contrast 64px typography against stage lights, vertical mirror, and instant Blackout shortcut (Key B).',
    mirrorHorizontal: false,
    mirrorVertical: true,
    recommendedFontSize: 64,
    recommendedMargin: 8,
    recommendedCuePosition: 30,
    recommendedColorTheme: 'dark-white',
    recommendedRemoteMode: 'pedal',
    recommendedCleanOutput: true,
    recommendedBeamBoost: true,
    recommendedSettings: {
      fontFamily: 'lexend',
      lineHeight: 1.5,
      backdropId: 'none',
    },
  },
];

export interface HardwareRemoteProfileDef {
  id: HardwareRemoteMode;
  namePt: string;
  nameEn: string;
  subtitlePt: string;
  subtitleEn: string;
  mappingsPt: string[];
  mappingsEn: string[];
}

export const HARDWARE_REMOTE_PROFILES: HardwareRemoteProfileDef[] = [
  {
    id: 'standard',
    namePt: 'Teclado Padrão / Mesa',
    nameEn: 'Standard Keyboard',
    subtitlePt: 'Atalhos clássicos de estúdio',
    subtitleEn: 'Classic studio shortcuts',
    mappingsPt: [
      'Espaço: Iniciar / Pausar',
      'Seta ↑ / ↓: + / - Velocidade',
      'Seta ← / →: Retroceder / Avançar bloco',
      'B: Blackout de palco · H: Saída Limpa HDMI',
    ],
    mappingsEn: [
      'Space: Start / Pause',
      'Arrow ↑ / ↓: Faster / Slower',
      'Arrow ← / →: Jump Back / Forward',
      'B: Stage Blackout · H: Clean HDMI Output',
    ],
  },
  {
    id: 'presenter',
    namePt: 'Apresentador Bluetooth / Logitech / RF',
    nameEn: 'Bluetooth Presenter / Logitech / RF',
    subtitlePt: 'Ideal para Mini TP e apresentador com clicker na mão',
    subtitleEn: 'Ideal for Mini TP and handheld slide clickers',
    mappingsPt: [
      'Avançar Slide (PageDown / →): Iniciar / Pausar rolagem',
      'Voltar Slide (PageUp / ←): Retroceder trecho no texto',
      'Botão F5 / Play: Reiniciar do topo',
      'Botão Tela Preta (. ou B): Blackout instantâneo',
    ],
    mappingsEn: [
      'Next Slide (PageDown / →): Play / Pause scrolling',
      'Prev Slide (PageUp / ←): Jump backward in script',
      'F5 / Start button: Restart from top',
      'Black Screen (. or B): Instant Blackout',
    ],
  },
  {
    id: 'pedal',
    namePt: 'Pedal Sem Fio (AirTurn / PageFlip / USB)',
    nameEn: 'Wireless Foot Pedal (AirTurn / PageFlip / USB)',
    subtitlePt: 'Mãos 100% livres no púlpito ou gravação',
    subtitleEn: '100% hands-free for podium or recording',
    mappingsPt: [
      'Pedal Direito (PageDown / → / Enter): Iniciar / Pausar',
      'Pedal Esquerdo (PageUp / ←): Voltar frase / trecho',
      'Pedais ↑ / ↓: Aumentar / Diminuir velocidade',
      'Suporte nativo a Gamepads / Controles VR Bluetooth',
    ],
    mappingsEn: [
      'Right Pedal (PageDown / → / Enter): Play / Pause',
      'Left Pedal (PageUp / ←): Jump back one phrase',
      'Up / Down Pedals: Increase / Decrease speed',
      'Native Bluetooth Gamepad / VR controller support',
    ],
  },
  {
    id: 'shuttle',
    namePt: 'Operador / Teclado Numérico & Shuttle USB',
    nameEn: 'Operator / Numpad & USB Shuttle',
    subtitlePt: 'Para operador dedicado em TP19XPRO / TP20PTZ',
    subtitleEn: 'For dedicated operator on TP19XPRO / TP20PTZ',
    mappingsPt: [
      'Numpad 0 / Espaço / Enter: Play / Pause imediato',
      'Numpad + / - ou ↑ / ↓: Ajuste fino de velocidade',
      'Home: Voltar ao topo · PageUp/PageDown: Saltar',
      'M: Espelho H · V: Espelho V · B: Blackout',
    ],
    mappingsEn: [
      'Numpad 0 / Space / Enter: Instant Play / Pause',
      'Numpad + / - or ↑ / ↓: Fine speed adjustment',
      'Home: Top of script · PageUp/PageDown: Jump',
      'M: Mirror H · V: Mirror V · B: Blackout',
    ],
  },
];

export function getTpBrasilProfile(id?: TpBrasilModelId): TpBrasilHardwareProfile | undefined {
  if (!id || id === 'none') return undefined;
  return TP_BRASIL_PROFILES.find((p) => p.id === id);
}

export function applyTpBrasilPreset(
  prev: TeleprompterSettings,
  modelId: TpBrasilModelId
): TeleprompterSettings {
  if (modelId === 'none') {
    return {
      ...prev,
      tpBrasilModel: 'none',
      cleanOutputMode: false,
      beamSplitterBoost: false,
      blackoutScreen: false,
    };
  }

  const profile = getTpBrasilProfile(modelId);
  if (!profile) return prev;

  return {
    ...prev,
    ...profile.recommendedSettings,
    tpBrasilModel: profile.id,
    mirrorHorizontal: profile.mirrorHorizontal,
    mirrorVertical: profile.mirrorVertical,
    fontSize: profile.recommendedFontSize,
    horizontalMargin: profile.recommendedMargin,
    colorTheme: profile.recommendedColorTheme,
    hardwareRemoteMode: profile.recommendedRemoteMode,
    cleanOutputMode: profile.recommendedCleanOutput,
    beamSplitterBoost: profile.recommendedBeamBoost,
    blackoutScreen: false,
    cueLine: {
      ...prev.cueLine,
      enabled: true,
      positionPercent: profile.recommendedCuePosition,
    },
  };
}
