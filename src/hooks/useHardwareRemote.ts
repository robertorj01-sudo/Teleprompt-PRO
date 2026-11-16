import { useEffect, useRef, useState } from 'react';
import { HardwareRemoteMode } from '../types/teleprompter';

export interface HardwareSignal {
  source: 'keyboard' | 'gamepad';
  code: string;
  action: string;
  timestamp: number;
}

interface UseHardwareRemoteOptions {
  mode: HardwareRemoteMode;
  enabled?: boolean;
  onTogglePlay: () => void;
  onSpeedDelta: (delta: number) => void;
  onJump: (px: number) => void;
  onRestart: () => void;
  onToggleMirrorH: () => void;
  onToggleMirrorV: () => void;
  onToggleBlackout: () => void;
  onToggleCleanOutput: () => void;
  onFontDelta: (delta: number) => void;
}

export function useHardwareRemote({
  mode,
  enabled = true,
  onTogglePlay,
  onSpeedDelta,
  onJump,
  onRestart,
  onToggleMirrorH,
  onToggleMirrorV,
  onToggleBlackout,
  onToggleCleanOutput,
  onFontDelta,
}: UseHardwareRemoteOptions) {
  const [connectedGamepads, setConnectedGamepads] = useState<string[]>([]);
  const [lastSignal, setLastSignal] = useState<HardwareSignal | null>(null);

  const callbacksRef = useRef({
    onTogglePlay,
    onSpeedDelta,
    onJump,
    onRestart,
    onToggleMirrorH,
    onToggleMirrorV,
    onToggleBlackout,
    onToggleCleanOutput,
    onFontDelta,
  });

  useEffect(() => {
    callbacksRef.current = {
      onTogglePlay,
      onSpeedDelta,
      onJump,
      onRestart,
      onToggleMirrorH,
      onToggleMirrorV,
      onToggleBlackout,
      onToggleCleanOutput,
      onFontDelta,
    };
  }, [
    onTogglePlay,
    onSpeedDelta,
    onJump,
    onRestart,
    onToggleMirrorH,
    onToggleMirrorV,
    onToggleBlackout,
    onToggleCleanOutput,
    onFontDelta,
  ]);

  // Escuta teclas de apresentadores Bluetooth/RF, pedais USB/Bluetooth (AirTurn, PageFlip) e mesas/numpads
  useEffect(() => {
    if (!enabled) return;

    const handleHardwareKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      const cb = callbacksRef.current;

      const emit = (action: string) => {
        setLastSignal({
          source: 'keyboard',
          code: e.code || e.key,
          action,
          timestamp: Date.now(),
        });
      };

      // Atalhos universais de hardware TP Brasil (Blackout, Saída Limpa HDMI, Espelho V)
      if (e.code === 'KeyB') {
        e.preventDefault();
        cb.onToggleBlackout();
        emit('Blackout (B)');
        return;
      }
      if (e.code === 'KeyH') {
        e.preventDefault();
        cb.onToggleCleanOutput();
        emit('Saída Limpa HDMI (H)');
        return;
      }
      if (e.code === 'KeyV') {
        e.preventDefault();
        cb.onToggleMirrorV();
        emit('Espelho Vertical (V)');
        return;
      }
      if (e.code === 'Home') {
        e.preventDefault();
        cb.onRestart();
        emit('Topo do Roteiro (Home)');
        return;
      }

      // Modo Apresentador Bluetooth / Clicker Logitech / Satechi
      if (mode === 'presenter') {
        if (e.code === 'PageDown') {
          e.preventDefault();
          cb.onTogglePlay();
          emit('Play / Pause (PageDown)');
          return;
        }
        if (e.code === 'PageUp') {
          e.preventDefault();
          cb.onJump(-180);
          emit('Retroceder Trecho (PageUp)');
          return;
        }
        if (e.code === 'Period' || e.key === '.') {
          e.preventDefault();
          cb.onToggleBlackout();
          emit('Blackout Palco (.)');
          return;
        }
        if (e.code === 'F5') {
          e.preventDefault();
          cb.onRestart();
          emit('Reiniciar do Topo (F5)');
          return;
        }
      }

      // Modo Pedal Sem Fio (AirTurn / PageFlip / Pedais USB HID)
      if (mode === 'pedal') {
        if (e.code === 'PageDown' || e.code === 'Enter' || e.code === 'NumpadEnter') {
          e.preventDefault();
          cb.onTogglePlay();
          emit(`Pedal Play / Pause (${e.code})`);
          return;
        }
        if (e.code === 'PageUp' || e.code === 'Backspace') {
          e.preventDefault();
          cb.onJump(-180);
          emit(`Pedal Retroceder (${e.code})`);
          return;
        }
      }

      // Modo Operador / Teclado Numérico / Shuttle USB
      if (mode === 'shuttle') {
        if (e.code === 'Numpad0' || e.code === 'NumpadEnter' || e.code === 'Enter') {
          e.preventDefault();
          cb.onTogglePlay();
          emit(`Play / Pause (${e.code})`);
          return;
        }
        if (e.code === 'PageDown') {
          e.preventDefault();
          cb.onJump(220);
          emit('Avançar Bloco (PageDown)');
          return;
        }
        if (e.code === 'PageUp') {
          e.preventDefault();
          cb.onJump(-220);
          emit('Voltar Bloco (PageUp)');
          return;
        }
        if (e.code === 'Numpad8') {
          e.preventDefault();
          cb.onSpeedDelta(2);
          emit('+Velocidade (Numpad 8)');
          return;
        }
        if (e.code === 'Numpad2') {
          e.preventDefault();
          cb.onSpeedDelta(-2);
          emit('-Velocidade (Numpad 2)');
          return;
        }
      }

      // Feedback para teclas já tratadas no App.tsx (para o testador ao vivo no modal)
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyR', 'KeyM'].includes(e.code)) {
        emit(e.code);
      }
    };

    window.addEventListener('keydown', handleHardwareKeyDown);
    return () => {
      window.removeEventListener('keydown', handleHardwareKeyDown);
    };
  }, [enabled, mode]);

  // Suporte nativo a Gamepads / Controles Bluetooth / Mini Remotes (Web Gamepad API)
  useEffect(() => {
    if (!enabled || typeof navigator === 'undefined' || !navigator.getGamepads) return;

    const refreshGamepads = () => {
      const pads = Array.from(navigator.getGamepads()).filter(
        (gp): gp is Gamepad => gp !== null && gp.connected
      );
      setConnectedGamepads(pads.map((p) => p.id));
    };

    window.addEventListener('gamepadconnected', refreshGamepads);
    window.addEventListener('gamepaddisconnected', refreshGamepads);
    refreshGamepads();

    let rafId = 0;
    const prevButtons: Record<number, boolean[]> = {};
    let lastAxisActionAt = 0;

    const pollGamepads = () => {
      const pads = navigator.getGamepads();
      const now = performance.now();
      const cb = callbacksRef.current;

      for (const pad of pads) {
        if (!pad || !pad.connected) continue;

        const prev = prevButtons[pad.index] || [];
        const current = pad.buttons.map((b) => b.pressed);

        const justPressed = (idx: number) => current[idx] && !prev[idx];

        // Botão A (0) / Start (9): Play / Pause
        if (justPressed(0) || justPressed(9)) {
          cb.onTogglePlay();
          setLastSignal({
            source: 'gamepad',
            code: `Button ${justPressed(0) ? 'A (0)' : 'Start (9)'}`,
            action: 'Play / Pause',
            timestamp: Date.now(),
          });
        }
        // Botão B (1): Blackout
        if (justPressed(1)) {
          cb.onToggleBlackout();
          setLastSignal({
            source: 'gamepad',
            code: 'Button B (1)',
            action: 'Blackout',
            timestamp: Date.now(),
          });
        }
        // Botão X (2): Espelho Vertical (vidro beam-splitter)
        if (justPressed(2)) {
          cb.onToggleMirrorV();
          setLastSignal({
            source: 'gamepad',
            code: 'Button X (2)',
            action: 'Espelho Vertical',
            timestamp: Date.now(),
          });
        }
        // Botão Y (3): Reiniciar do topo
        if (justPressed(3)) {
          cb.onRestart();
          setLastSignal({
            source: 'gamepad',
            code: 'Button Y (3)',
            action: 'Reiniciar do Topo',
            timestamp: Date.now(),
          });
        }
        // D-Pad Up (12) / Down (13): Velocidade
        if (justPressed(12)) {
          cb.onSpeedDelta(2);
          setLastSignal({
            source: 'gamepad',
            code: 'D-Pad Up',
            action: '+Velocidade',
            timestamp: Date.now(),
          });
        }
        if (justPressed(13)) {
          cb.onSpeedDelta(-2);
          setLastSignal({
            source: 'gamepad',
            code: 'D-Pad Down',
            action: '-Velocidade',
            timestamp: Date.now(),
          });
        }
        // D-Pad Left (14) / Right (15): Saltar bloco
        if (justPressed(14)) {
          cb.onJump(-160);
          setLastSignal({
            source: 'gamepad',
            code: 'D-Pad Left',
            action: 'Retroceder',
            timestamp: Date.now(),
          });
        }
        if (justPressed(15)) {
          cb.onJump(160);
          setLastSignal({
            source: 'gamepad',
            code: 'D-Pad Right',
            action: 'Avançar',
            timestamp: Date.now(),
          });
        }
        // Bumpers L1 (4) / R1 (5): Fonte -/+
        if (justPressed(4)) {
          cb.onFontDelta(-2);
          setLastSignal({
            source: 'gamepad',
            code: 'LB (4)',
            action: '-Fonte',
            timestamp: Date.now(),
          });
        }
        if (justPressed(5)) {
          cb.onFontDelta(2);
          setLastSignal({
            source: 'gamepad',
            code: 'RB (5)',
            action: '+Fonte',
            timestamp: Date.now(),
          });
        }

        // Analógico vertical (axis 1) para velocidade contínua com debounce de 180ms
        const axisY = pad.axes?.[1] ?? 0;
        if (Math.abs(axisY) > 0.65 && now - lastAxisActionAt > 180) {
          lastAxisActionAt = now;
          const delta = axisY < 0 ? 2 : -2;
          cb.onSpeedDelta(delta);
          setLastSignal({
            source: 'gamepad',
            code: axisY < 0 ? 'Stick Up' : 'Stick Down',
            action: delta > 0 ? '+Velocidade' : '-Velocidade',
            timestamp: Date.now(),
          });
        }

        prevButtons[pad.index] = current;
      }

      rafId = requestAnimationFrame(pollGamepads);
    };

    rafId = requestAnimationFrame(pollGamepads);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('gamepadconnected', refreshGamepads);
      window.removeEventListener('gamepaddisconnected', refreshGamepads);
    };
  }, [enabled]);

  return {
    connectedGamepads,
    lastSignal,
  };
}
