import { VideoFilterId, VideoFilterDef } from '../types/teleprompter';

export const VIDEO_FILTERS: VideoFilterDef[] = [
  {
    id: 'normal',
    namePt: 'Natural (Original)',
    nameEn: 'Natural (Original)',
    cssFilter: 'none',
    descriptionPt: 'Sem alterações, imagem natural da câmera',
    descriptionEn: 'Untouched, natural camera feed',
    accentColor: '#a3a3a3',
  },
  {
    id: 'beauty',
    namePt: 'Suave & Glow',
    nameEn: 'Beauty Glow',
    cssFilter: 'brightness(1.05) contrast(0.96) saturate(1.12)',
    descriptionPt: 'Atenua sombras e confere viço suave à pele',
    descriptionEn: 'Softens skin tones and adds a gentle warm glow',
    accentColor: '#f472b6',
  },
  {
    id: 'cinema-warm',
    namePt: 'Cinema Quente',
    nameEn: 'Cinema Warm',
    cssFilter: 'brightness(1.02) contrast(1.12) sepia(0.22) saturate(1.25)',
    descriptionPt: 'Tom cinematográfico caloroso de grande produção',
    descriptionEn: 'Warm Hollywood cinema aesthetic',
    accentColor: '#f59e0b',
  },
  {
    id: 'bw-studio',
    namePt: 'P&B Estúdio',
    nameEn: 'Studio B&W',
    cssFilter: 'grayscale(1) contrast(1.25) brightness(1.05)',
    descriptionPt: 'Preto e branco refinado com contraste de iluminação de estúdio',
    descriptionEn: 'Crisp studio monochrome with balanced contrast',
    accentColor: '#e5e5e5',
  },
  {
    id: 'vibrant',
    namePt: 'Cores Vivas',
    nameEn: 'Vibrant Pop',
    cssFilter: 'saturate(1.5) contrast(1.1) brightness(1.02)',
    descriptionPt: 'Cores vibrantes e saturadas ideais para Reels e Shorts',
    descriptionEn: 'Eye-catching saturated colors tailored for social clips',
    accentColor: '#ec4899',
  },
  {
    id: 'vintage',
    namePt: 'Filme Retrô',
    nameEn: 'Vintage Film',
    cssFilter: 'sepia(0.38) contrast(1.15) brightness(0.96) saturate(1.1)',
    descriptionPt: 'Grão cromático clássico dos filmes analógicos dos anos 70/80',
    descriptionEn: 'Classic 35mm film stock tones with nostalgic depth',
    accentColor: '#d97706',
  },
  {
    id: 'cool-slate',
    namePt: 'Frio Elegante',
    nameEn: 'Cool Slate',
    cssFilter: 'hue-rotate(180deg) saturate(0.85) contrast(1.08) brightness(1.04)',
    descriptionPt: 'Tons azulados sóbrios perfeitos para conteúdo corporativo e tech',
    descriptionEn: 'Subtle cool blue undertones for tech and business videos',
    accentColor: '#38bdf8',
  },
  {
    id: 'golden-hour',
    namePt: 'Golden Hour (Bronze)',
    nameEn: 'Golden Hour',
    cssFilter: 'sepia(0.42) saturate(1.4) hue-rotate(-12deg) contrast(1.08)',
    descriptionPt: 'Luz dourada do entardecer com realce bronze',
    descriptionEn: 'Warm sunset radiance with rich bronze highlights',
    accentColor: '#fbbf24',
  },
  {
    id: 'high-contrast',
    namePt: 'Alto Contraste',
    nameEn: 'Punchy Contrast',
    cssFilter: 'contrast(1.35) brightness(1.04) saturate(1.15)',
    descriptionPt: 'Pretos profundos e destaques nítidos para máxima definição',
    descriptionEn: 'Deep blacks and sharp clarity for punchy presentation',
    accentColor: '#818cf8',
  },
  {
    id: 'sepia-classic',
    namePt: 'Sépia Clássico',
    nameEn: 'Classic Sepia',
    cssFilter: 'sepia(0.82) contrast(1.08) brightness(0.98)',
    descriptionPt: 'Tom sépia romântico e atemporal estilo documentário histórico',
    descriptionEn: 'Timeless documentary sepia with rich umber depth',
    accentColor: '#b45309',
  },
  {
    id: 'cyber-neon',
    namePt: 'Cyber Neon',
    nameEn: 'Cyber Neon',
    cssFilter: 'contrast(1.28) hue-rotate(285deg) saturate(1.65) brightness(1.04)',
    descriptionPt: 'Estética futurista neon inspirada no universo gamer e sci-fi',
    descriptionEn: 'Futuristic sci-fi aesthetic with electric magenta accents',
    accentColor: '#a855f7',
  },
  {
    id: 'dramatic-shadows',
    namePt: 'Dramático / Noir',
    nameEn: 'Dramatic Noir',
    cssFilter: 'contrast(1.42) brightness(0.88) saturate(0.82)',
    descriptionPt: 'Ambiente soturno com sombras intensas e atmosfera de mistério',
    descriptionEn: 'Moody low-key look with intense shadows and mystery',
    accentColor: '#64748b',
  },
];

export function getVideoFilterCss(filterId?: VideoFilterId): string {
  if (!filterId) return 'none';
  const found = VIDEO_FILTERS.find((f) => f.id === filterId);
  return found ? found.cssFilter : 'none';
}

export function getVideoFilterDef(filterId?: VideoFilterId): VideoFilterDef {
  const found = VIDEO_FILTERS.find((f) => f.id === filterId);
  return found || VIDEO_FILTERS[0];
}
