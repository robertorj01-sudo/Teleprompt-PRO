import React from 'react';
import { X, Keyboard } from 'lucide-react';
import { AppLanguage } from '../utils/i18n';

interface KeyboardShortcutsModalProps {
  lang: AppLanguage;
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  lang,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const isEn = lang === 'en';

  const shortcuts = isEn
    ? [
        { key: 'Space', desc: 'Start or Pause automatic scrolling' },
        { key: '↑ / ↓', desc: 'Increase or Decrease scroll speed' },
        { key: '← / →', desc: 'Jump backward or forward in the script' },
        { key: 'PageUp / PageDown', desc: 'Bluetooth Presenter / Foot Pedal control' },
        { key: 'R / F5', desc: 'Restart reading from the very top' },
        { key: 'F', desc: 'Toggle Fullscreen Studio Mode' },
        { key: 'Esc', desc: 'Exit fullscreen, clean HDMI, or pause scrolling' },
        { key: 'M', desc: 'Toggle Horizontal Mirror (Flip X for glass rigs)' },
        { key: 'V', desc: 'Toggle Vertical Mirror (Flip Y for TP Brasil tray)' },
        { key: 'B / .', desc: 'Instant Stage Blackout (TP Presidencial / Pause)' },
        { key: 'H', desc: 'Toggle Clean HDMI Output Mode (Hide UI Chrome)' },
        { key: '+ / -', desc: 'Increase or Decrease font size' },
        { key: 'C', desc: 'Enable / Disable Reading Cue Line' },
        { key: '?', desc: 'Open this keyboard shortcuts guide' },
      ]
    : [
        { key: 'Espaço', desc: 'Iniciar ou Pausar a rolagem automática' },
        { key: '↑ / ↓', desc: 'Aumentar ou Diminuir a velocidade de rolagem' },
        { key: '← / →', desc: 'Voltar ou Avançar rapidamente no texto' },
        { key: 'PageUp / PageDown', desc: 'Controle por Apresentador Bluetooth ou Pedal' },
        { key: 'R / F5', desc: 'Reiniciar a leitura do início (topo)' },
        { key: 'F', desc: 'Alternar modo Tela Cheia (Fullscreen)' },
        { key: 'Esc', desc: 'Sair da tela cheia / saída limpa ou pausar' },
        { key: 'M', desc: 'Espelhamento Horizontal (Flip X)' },
        { key: 'V', desc: 'Espelhamento Vertical (Flip Y para vidro TP Brasil)' },
        { key: 'B / .', desc: 'Blackout Instantâneo de Palco (TP Presidencial)' },
        { key: 'H', desc: 'Modo Saída Limpa HDMI (Ocultar barras e HUD)' },
        { key: '+ / -', desc: 'Aumentar ou Diminuir o tamanho da fonte' },
        { key: 'C', desc: 'Ativar / Desativar a Linha Guia de leitura' },
        { key: '?', desc: 'Abrir este painel de atalhos' },
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden text-neutral-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isEn ? 'Keyboard Shortcuts' : 'Atalhos de Teclado'}
              </h2>
              <p className="text-xs text-neutral-400">
                {isEn
                  ? 'Full hands-on control without touching your mouse while recording'
                  : 'Controle total sem tocar no mouse durante a gravação'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-2.5 max-h-[60vh] overflow-y-auto">
          {shortcuts.map((sc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-2 border-b border-neutral-800/60 last:border-0"
            >
              <span className="text-xs text-neutral-300 font-medium">{sc.desc}</span>
              <kbd className="px-2.5 py-1 text-xs font-mono font-bold bg-neutral-800 text-amber-400 border border-neutral-700 rounded-md shadow-xs">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-colors cursor-pointer"
          >
            {isEn ? 'Got it' : 'Entendido'}
          </button>
        </div>
      </div>
    </div>
  );
};
