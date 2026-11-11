export type ColorTheme = 
  | 'dark-white'   // Fundo preto puro, texto branco
  | 'dark-yellow'  // Fundo preto puro, texto amarelo (alto contraste estúdio)
  | 'dark-green'   // Fundo preto, texto verde fluorescente
  | 'dark-cyan'    // Fundo preto, texto ciano
  | 'light-black'  // Fundo branco, texto escuro
  | 'sepia';       // Fundo papel sépia suave

export type FontFamily = 'sans' | 'lexend' | 'mono' | 'serif';

export type TextAlign = 'left' | 'center' | 'right';

export type CueLineStyle = 'subtle-line' | 'reading-band' | 'arrow-indicator' | 'vignette';

export interface CueLineConfig {
  enabled: boolean;
  positionPercent: number; // 15% to 75% da altura da tela (onde fica a câmera)
  style: CueLineStyle;
  color: string; // Hex ou CSS color
  opacity: number;
}

export type VideoFilterId =
  | 'normal'
  | 'beauty'
  | 'cinema-warm'
  | 'bw-studio'
  | 'vibrant'
  | 'vintage'
  | 'cool-slate'
  | 'golden-hour'
  | 'high-contrast'
  | 'sepia-classic'
  | 'cyber-neon'
  | 'dramatic-shadows';

export interface VideoFilterDef {
  id: VideoFilterId;
  namePt: string;
  nameEn: string;
  cssFilter: string;
  descriptionPt: string;
  descriptionEn: string;
  accentColor: string;
}

export type BackdropId =
  | 'none'
  | 'modern-office'
  | 'boardroom'
  | 'classic-library'
  | 'podcast-studio'
  | 'cozy-home-office';

export interface BackdropDef {
  id: BackdropId;
  namePt: string;
  nameEn: string;
  categoryPt: string;
  categoryEn: string;
  descriptionPt: string;
  descriptionEn: string;
  imageUrl: string;
  badge?: string;
  recommendedBlur: number;
  recommendedOverlay: number;
}

export interface TeleprompterSettings {
  speed: number;             // 1 a 100
  fontSize: number;          // 20 a 110 px
  lineHeight: number;        // 1.2 a 2.5
  letterSpacing: number;     // -0.02 a 0.08 em
  horizontalMargin: number;  // 5% a 40% (padding lateral para centralizar leitura)
  textAlign: TextAlign;
  fontFamily: FontFamily;
  mirrorHorizontal: boolean; // Flip X (Espelho físico de teleprompter)
  mirrorVertical: boolean;   // Flip Y
  colorTheme: ColorTheme;
  cueLine: CueLineConfig;
  countdownSeconds: number;  // 0, 3, 5, 10
  highlightNotes: boolean;   // Destacar [NOTAS DE ORADOR]
  showStatsOverlay: boolean;
  webcamEnabled: boolean;
  webcamOpacity: number;
  videoFilter: VideoFilterId; // Filtro de vídeo profissional
  backdropId: BackdropId;     // Pano de fundo virtual / estúdio
  backdropBlur: number;       // 0 a 16 px (efeito bokeh de lente de câmera)
  backdropOverlay: number;    // 0.2 a 0.95 (escurecimento para alto contraste de texto)
}

export interface SavedScript {
  id: string;
  title: string;
  content: string;
  category?: string;
  updatedAt: number;
  wordCount: number;
  estimatedMinutes: number;
}

export type PlanType = 'free' | 'lifetime';

export interface LicenseStatus {
  isPro: boolean;
  planType: PlanType;
  licenseKey?: string;
  activatedAt?: number;
}

export const STRIPE_CHECKOUT_URL = 'https://buy.stripe.com/9B67sK3UFaBVc08cms5J600';

