import React, { useState } from 'react';
import {
  X,
  Check,
  Crown,
  ShieldCheck,
  Zap,
  Lock,
  Key,
  Flame,
  Tag,
} from 'lucide-react';
import { LicenseStatus, STRIPE_CHECKOUT_URL } from '../types/teleprompter';
import { AppLanguage } from '../utils/i18n';

interface UpgradeProModalProps {
  lang: AppLanguage;
  isOpen: boolean;
  onClose: () => void;
  licenseStatus: LicenseStatus;
  onActivateLicense: (licenseKey: string) => void;
  highlightFeature?: string; // 'download_video' | 'mirror' | 'script_limit' | 'import_docx'
}

export const UpgradeProModal: React.FC<UpgradeProModalProps> = ({
  lang,
  isOpen,
  onClose,
  licenseStatus,
  onActivateLicense,
  highlightFeature,
}) => {
  const isEn = lang === 'en';
  const [licenseInput, setLicenseInput] = useState<string>('');
  const [isProcessingBuy, setIsProcessingBuy] = useState<boolean>(false);
  const [showKeyInput, setShowKeyInput] = useState<boolean>(true);
  const [inputError, setInputError] = useState<string | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSimulatePurchase = () => {
    setIsProcessingBuy(true);
    setTimeout(() => {
      const generatedKey = `PRO-LIFETIME-${Math.random().toString(36).substring(2, 8).toUpperCase()}-LTD`;
      onActivateLicense(generatedKey);
      setIsProcessingBuy(false);
    }, 1000);
  };

  const handleManualActivate = () => {
    const trimmed = licenseInput.trim().toUpperCase();
    if (!trimmed || trimmed.length < 5) {
      setInputError(
        isEn
          ? 'Please enter a valid License Key or Promo Code.'
          : 'Insira uma chave de licença ou código válido.'
      );
      return;
    }

    // Validate license format
    const isValidFormat =
      trimmed.startsWith('PRO-') ||
      trimmed.startsWith('AS-PRO-') ||
      trimmed.startsWith('LTD-') ||
      trimmed.startsWith('VIP-') ||
      trimmed === 'PRO-VITALICIO-97';

    if (!isValidFormat && trimmed.length < 6) {
      setInputError(
        isEn
          ? 'Invalid code format. Enter your license key.'
          : 'Formato inválido. Digite sua chave de licença.'
      );
      return;
    }

    setInputError(null);
    setRedeemSuccess(true);
    onActivateLicense(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden text-neutral-100 flex flex-col max-h-[92vh]">
        {/* Banner de Destaque no Topo */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 px-6 py-2.5 text-center text-xs font-bold text-neutral-950 flex items-center justify-center gap-2 tracking-wide uppercase">
          <Flame className="w-4 h-4 fill-neutral-950" />
          <span>
            {isEn
              ? 'Special Offer: Lifetime Access — Pay Once, Own Forever (No Subscriptions)'
              : 'Oferta Especial: Licença Vitalícia — Sem Mensalidades, Pague Uma Única Vez'}
          </span>
        </div>

        {/* Header */}
        <div className="px-6 sm:px-8 pt-6 pb-4 flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
              <Crown className="w-3.5 h-3.5" />
              <span>
                {isEn
                  ? 'Teleprompter PRO — Lifetime License'
                  : 'Teleprompter PRO — Acesso Vitalício'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {isEn
                ? 'The Ultimate Studio Teleprompter for Creators & Teams'
                : 'A Ferramenta Definitiva para Gravação e Apresentação'}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              {isEn
                ? 'Built for creators, speakers, and studios who want pro features without recurring monthly fees.'
                : 'Desenhado para criadores, palestrantes e profissionais que rejeitam assinaturas mensais.'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Motivo do Bloqueio (Se acionado por recurso específico) */}
        {highlightFeature && (
          <div className="mx-6 sm:mx-8 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-xs text-amber-200">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {highlightFeature === 'download_video' &&
                (isEn
                  ? 'Downloading recorded Full HD video files is an exclusive Lifetime PRO feature.'
                  : 'O download do arquivo de vídeo gravado em Full HD é exclusivo do Pacote PRO Vitalício.')}
              {highlightFeature === 'mirror' &&
                (isEn
                  ? 'Optical horizontal/vertical mirroring for beam-splitter rigs requires Lifetime PRO.'
                  : 'O espelhamento óptico para rigs de teleprompter é um recurso do Pacote PRO Vitalício.')}
              {highlightFeature === 'script_limit' &&
                (isEn
                  ? 'You reached the 3-script limit on the Free tier. Unlock unlimited scripts with PRO.'
                  : 'Você atingiu o limite de 3 roteiros da versão gratuita. Desbloqueie roteiros ilimitados com o PRO.')}
              {highlightFeature === 'import_docx' &&
                (isEn
                  ? 'Importing Microsoft Word (.docx) documents is an exclusive Lifetime PRO feature.'
                  : 'A importação de arquivos .docx (Word) e documentos é exclusiva do Pacote PRO Vitalício.')}
            </span>
          </div>
        )}

        {/* Conteúdo com Comparativo, Preço e Ativação de Chave */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-4 space-y-5">
          {/* Card de Preço em Destaque */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-neutral-800/80 to-neutral-900 border border-amber-500/30 relative overflow-hidden shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-neutral-400">
                  {isEn ? 'Full Perpetual Studio License' : 'Acesso Completo e Perpétuo'}
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white">
                    {isEn ? '$29' : 'R$ 97,00'}
                  </span>
                  <span className="text-xs text-amber-400 font-bold uppercase tracking-wider bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                    {isEn ? 'One-Time Payment' : 'Pagamento Único'}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  {isEn
                    ? 'Zero monthly fees. Unlimited use across desktop, tablet, and mobile PWA.'
                    : 'Sem mensalidades ou surpresas. Use hoje, amanhã e para sempre no seu computador e celular.'}
                </p>
              </div>

              {/* Botão de Compra Principal com Stripe */}
              {licenseStatus.isPro ? (
                <div className="px-6 py-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold text-sm tracking-wide whitespace-nowrap flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{isEn ? 'Lifetime PRO Active' : 'Licença Vitalícia Ativa'}</span>
                </div>
              ) : (
                <a
                  href={STRIPE_CHECKOUT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-extrabold text-sm tracking-wide transition-all shadow-xl shadow-amber-500/20 active:scale-95 cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>{isEn ? 'Buy Lifetime Deal ($29 via Stripe)' : 'Comprar Licença Vitalícia (R$ 97)'}</span>
                </a>
              )}
            </div>
          </div>

          {/* Box Oficial de Ativação / Chave de Licença */}
          <div className="p-4 rounded-2xl bg-neutral-800/50 border border-amber-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {isEn
                    ? 'Have a License Key or Coupon Code? Redeem Here:'
                    : 'Tem uma Chave de Licença ou Cupom? Ative Aqui:'}
                </span>
              </span>
              {licenseStatus.isPro && licenseStatus.licenseKey && (
                <span className="text-[11px] font-mono text-emerald-400">
                  {isEn ? 'Active Key:' : 'Chave Ativa:'} {licenseStatus.licenseKey}
                </span>
              )}
            </div>

            {showKeyInput && (
              <>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={licenseInput}
                    onChange={(e) => setLicenseInput(e.target.value)}
                    placeholder={
                      isEn
                        ? 'Enter License Key (e.g. PRO-VITALICIO-97)'
                        : 'Digite sua chave (ex: PRO-VITALICIO-97)'
                    }
                    className="flex-1 bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500 uppercase"
                  />
                  <button
                    onClick={handleManualActivate}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold text-xs transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {isEn ? 'Activate Key' : 'Ativar Chave'}
                  </button>
                </div>
                {inputError && <p className="text-[11px] text-rose-400">{inputError}</p>}
                {redeemSuccess && (
                  <p className="text-[11px] text-emerald-400 font-semibold">
                    {isEn
                      ? '✓ Lifetime PRO License activated! All studio features are now unlocked.'
                      : '✓ Licença PRO Vitalícia ativada! Todos os recursos estão desbloqueados.'}
                  </p>
                )}
                <p className="text-[10px] text-neutral-400">
                  {isEn ? (
                    <>
                      Enter your activation key or promo code (e.g. <strong>PRO-VITALICIO-97</strong>) for instant lifetime access.
                    </>
                  ) : (
                    <>
                      Digite sua chave de ativação ou código de acesso (ex: <strong>PRO-VITALICIO-97</strong>) para liberação vitalícia imediata.
                    </>
                  )}
                </p>
              </>
            )}
          </div>

          {/* Tabela Comparativa Free vs. PRO */}
          <div>
            <h3 className="text-xs uppercase font-bold text-neutral-400 tracking-wider mb-3">
              {isEn
                ? 'Everything included in the Lifetime PRO Plan:'
                : 'O que você recebe com a Licença PRO Vitalícia:'}
            </h3>

            <div className="rounded-2xl border border-neutral-800 overflow-hidden text-xs">
              <div className="grid grid-cols-12 bg-neutral-800/60 p-3 font-semibold text-neutral-400 text-[11px] uppercase tracking-wider border-b border-neutral-800">
                <span className="col-span-6 sm:col-span-7">{isEn ? 'Feature' : 'Recursos'}</span>
                <span className="col-span-3 sm:col-span-2 text-center">{isEn ? 'Free' : 'Grátis'}</span>
                <span className="col-span-3 text-center text-amber-400 font-bold">
                  {isEn ? 'Lifetime PRO' : 'PRO Vitalício'}
                </span>
              </div>

              <div className="divide-y divide-neutral-800/60 bg-neutral-950/40">
                <div className="grid grid-cols-12 p-3 items-center">
                  <span className="col-span-6 sm:col-span-7 font-medium text-white">
                    {isEn
                      ? 'HD Camera + Audio Recording & Video Download (.webm)'
                      : 'Gravação com Download do Vídeo em HD (.webm/.mp4)'}
                  </span>
                  <span className="col-span-3 sm:col-span-2 text-center text-neutral-500">
                    {isEn ? 'Preview Only' : 'Apenas Prévia'}
                  </span>
                  <span className="col-span-3 text-center font-bold text-emerald-400 flex items-center justify-center gap-1">
                    <Check className="w-4 h-4" />
                    <span>{isEn ? 'Unlimited' : 'Ilimitado'}</span>
                  </span>
                </div>

                <div className="grid grid-cols-12 p-3 items-center">
                  <span className="col-span-6 sm:col-span-7 font-medium text-white">
                    {isEn ? 'Saved Script Library' : 'Biblioteca de Roteiros Salvos'}
                  </span>
                  <span className="col-span-3 sm:col-span-2 text-center text-neutral-400">
                    {isEn ? 'Up to 3 scripts' : 'Até 3 roteiros'}
                  </span>
                  <span className="col-span-3 text-center font-bold text-emerald-400 flex items-center justify-center gap-1">
                    <Check className="w-4 h-4" />
                    <span>{isEn ? 'Unlimited' : 'Ilimitados'}</span>
                  </span>
                </div>

                <div className="grid grid-cols-12 p-3 items-center">
                  <span className="col-span-6 sm:col-span-7 font-medium text-white">
                    {isEn
                      ? 'Optical Mirror Mode (Horizontal & Vertical Flip for Glass Rigs)'
                      : 'Espelhamento Óptico (Flip Horizontal e Vertical)'}
                  </span>
                  <span className="col-span-3 sm:col-span-2 text-center text-neutral-500">—</span>
                  <span className="col-span-3 text-center font-bold text-emerald-400 flex items-center justify-center gap-1">
                    <Check className="w-4 h-4" />
                    <span>{isEn ? 'Included' : 'Liberado'}</span>
                  </span>
                </div>

                <div className="grid grid-cols-12 p-3 items-center">
                  <span className="col-span-6 sm:col-span-7 font-medium text-white">
                    {isEn
                      ? 'Microsoft Word (.docx) & Markdown Script Import'
                      : 'Importação de Arquivos Word (.docx) e Documentos'}
                  </span>
                  <span className="col-span-3 sm:col-span-2 text-center text-neutral-400">
                    {isEn ? '.txt only' : 'Apenas .txt'}
                  </span>
                  <span className="col-span-3 text-center font-bold text-emerald-400 flex items-center justify-center gap-1">
                    <Check className="w-4 h-4" />
                    <span>Word & Docs</span>
                  </span>
                </div>

                <div className="grid grid-cols-12 p-3 items-center">
                  <span className="col-span-6 sm:col-span-7 font-medium text-white">
                    {isEn
                      ? 'Hands-Free Voice Control (English & Portuguese)'
                      : 'Controle por Voz Hands-Free (Inglês e Português)'}
                  </span>
                  <span className="col-span-3 sm:col-span-2 text-center text-neutral-400">
                    {isEn ? 'Basic' : 'Básico'}
                  </span>
                  <span className="col-span-3 text-center font-bold text-emerald-400 flex items-center justify-center gap-1">
                    <Check className="w-4 h-4" />
                    <span>{isEn ? 'Full Studio' : 'Completo'}</span>
                  </span>
                </div>

                <div className="grid grid-cols-12 p-3 items-center">
                  <span className="col-span-6 sm:col-span-7 font-medium text-white">
                    {isEn ? 'All Future Updates & Offline PWA' : 'Atualizações Futuras & Suporte'}
                  </span>
                  <span className="col-span-3 sm:col-span-2 text-center text-neutral-500">—</span>
                  <span className="col-span-3 text-center font-bold text-emerald-400 flex items-center justify-center gap-1">
                    <Check className="w-4 h-4" />
                    <span>{isEn ? 'Lifetime' : 'Vitalício'}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer com Garantia */}
        <div className="px-6 sm:px-8 py-4 border-t border-neutral-800 bg-neutral-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              {isEn
                ? '60-Day Money-Back Guarantee · Instant Activation'
                : 'Garantia de satisfação · Ativação Imediata'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer text-xs font-medium"
            >
              {isEn ? 'Continue with Free Version' : 'Continuar no Gratuito'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
