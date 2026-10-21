import { useEffect, useRef, useState, useCallback } from 'react';

interface UseSmoothScrollOptions {
  speed: number; // 1 a 100
  isPlaying: boolean;
  onEndReached?: () => void;
}

export function useSmoothScroll({
  speed,
  isPlaying,
  onEndReached,
}: UseSmoothScrollOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const accumulatedScrollRef = useRef<number>(0);
  const isProgrammaticScrollRef = useRef<boolean>(false);
  const lastProgressPctRef = useRef<number>(-1);
  const lastProgressUpdateRef = useRef<number>(0);

  // Armazena valores mais recentes em refs para não recriar o loop a cada frame ou alteração de velocidade
  const speedRef = useRef<number>(speed);
  speedRef.current = speed;

  const isPlayingRef = useRef<boolean>(isPlaying);
  isPlayingRef.current = isPlaying;

  const onEndReachedRef = useRef<(() => void) | undefined>(onEndReached);
  onEndReachedRef.current = onEndReached;

  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isAtEnd, setIsAtEnd] = useState<boolean>(false);

  // Calcula velocidade em pixels por segundo com curva ergonômica ajustada
  // 1 => ~12 px/s, 25 => ~55 px/s, 50 => ~140 px/s, 100 => ~480 px/s
  const getPixelsPerSecond = useCallback((speedVal: number): number => {
    const normalized = Math.max(1, Math.min(100, speedVal));
    const factor = (normalized - 1) / 99; // 0.0 a 1.0
    // Curva mista (linear + quadrática) para excelente sensibilidade na faixa de fala (20 a 45)
    return 12 + factor * 60 + Math.pow(factor, 2) * 410;
  }, []);

  // Atualiza progresso da rolagem com throttle inteligente para evitar re-renderizar a cada 16ms
  const updateProgressInternal = useCallback(
    (currentScroll: number, maxScroll: number, force = false) => {
      if (maxScroll <= 0) {
        if (lastProgressPctRef.current !== 0) {
          lastProgressPctRef.current = 0;
          setScrollProgress(0);
        }
        return;
      }

      const now = performance.now();
      const pct = Math.min(100, Math.max(0, (currentScroll / maxScroll) * 100));
      const roundedPct = Math.round(pct);

      // Só dispara setState se o percentual inteiro mudar ou se passaram mais de 120ms
      if (
        force ||
        roundedPct !== lastProgressPctRef.current ||
        now - lastProgressUpdateRef.current > 120
      ) {
        lastProgressPctRef.current = roundedPct;
        lastProgressUpdateRef.current = now;
        setScrollProgress(pct);
      }

      if (currentScroll >= maxScroll - 4) {
        setIsAtEnd(true);
      } else if (currentScroll < maxScroll - 15) {
        setIsAtEnd(false);
      }
    },
    []
  );

  // Sincroniza posição interna ao rolar manualmente com mouse, toque ou barra
  const handleManualScroll = useCallback(() => {
    if (isProgrammaticScrollRef.current) {
      // Ignora evento de scroll gerado pelo auto-scroller
      isProgrammaticScrollRef.current = false;
      return;
    }

    const el = containerRef.current;
    if (!el) return;

    // Atualiza o acumulador com a posição exata da rolagem manual do usuário
    accumulatedScrollRef.current = el.scrollTop;
    const maxScroll = el.scrollHeight - el.clientHeight;
    updateProgressInternal(el.scrollTop, maxScroll, true);
  }, [updateProgressInternal]);

  // Loop de animação via requestAnimationFrame
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      lastTimeRef.current = null;
      return;
    }

    const el = containerRef.current;
    if (!el) {
      // Se ainda não montou, agenda uma verificação
      const retryTimer = setTimeout(() => {
        if (containerRef.current && isPlayingRef.current) {
          accumulatedScrollRef.current = containerRef.current.scrollTop;
        }
      }, 50);
      return () => clearTimeout(retryTimer);
    }

    // Se estava no final ou muito próximo (a menos de 6px), reinicia automaticamente do topo
    const currentMax = el.scrollHeight - el.clientHeight;
    if (currentMax > 0 && el.scrollTop >= currentMax - 6) {
      el.scrollTop = 0;
      accumulatedScrollRef.current = 0;
      setIsAtEnd(false);
      updateProgressInternal(0, currentMax, true);
    } else {
      accumulatedScrollRef.current = el.scrollTop;
    }

    lastTimeRef.current = performance.now();

    const step = (currentTime: number) => {
      if (!isPlayingRef.current) return;

      const currentEl = containerRef.current;
      if (!currentEl) {
        animFrameRef.current = requestAnimationFrame(step);
        return;
      }

      const previousTime = lastTimeRef.current ?? currentTime;
      const deltaMs = currentTime - previousTime;
      lastTimeRef.current = currentTime;

      // Limita delta para prevenir saltos se a aba perder foco ou ficar em segundo plano
      const safeDeltaMs = Math.min(Math.max(deltaMs, 0), 64);
      const pxPerSec = getPixelsPerSecond(speedRef.current);
      const pxToScroll = (pxPerSec * safeDeltaMs) / 1000;

      const maxScroll = currentEl.scrollHeight - currentEl.clientHeight;

      if (maxScroll > 0) {
        accumulatedScrollRef.current += pxToScroll;

        if (accumulatedScrollRef.current >= maxScroll) {
          accumulatedScrollRef.current = maxScroll;
          isProgrammaticScrollRef.current = true;
          currentEl.scrollTop = maxScroll;
          updateProgressInternal(maxScroll, maxScroll, true);
          setIsAtEnd(true);
          if (onEndReachedRef.current) {
            onEndReachedRef.current();
          }
          return; // Para o loop ao atingir o fim
        }

        isProgrammaticScrollRef.current = true;
        currentEl.scrollTop = accumulatedScrollRef.current;
        updateProgressInternal(accumulatedScrollRef.current, maxScroll);
      }

      animFrameRef.current = requestAnimationFrame(step);
    };

    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      lastTimeRef.current = null;
    };
  }, [isPlaying, getPixelsPerSecond, updateProgressInternal]);

  // Reinicia para o início do roteiro
  const restart = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    accumulatedScrollRef.current = 0;
    isProgrammaticScrollRef.current = true;
    el.scrollTo({ top: 0, behavior: 'smooth' });
    setIsAtEnd(false);
    lastProgressPctRef.current = 0;
    setScrollProgress(0);
  }, []);

  // Salta para frente ou para trás em pixels
  const jump = useCallback((deltaPx: number) => {
    const el = containerRef.current;
    if (!el) return;
    const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight);
    const target = Math.max(0, Math.min(maxScroll, el.scrollTop + deltaPx));
    accumulatedScrollRef.current = target;
    isProgrammaticScrollRef.current = true;
    el.scrollTo({ top: target, behavior: 'smooth' });
    updateProgressInternal(target, maxScroll, true);
  }, [updateProgressInternal]);

  // Salta para um percentual específico (0 a 100)
  const jumpToPercent = useCallback((pct: number) => {
    const el = containerRef.current;
    if (!el) return;
    const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight);
    const target = (Math.max(0, Math.min(100, pct)) / 100) * maxScroll;
    accumulatedScrollRef.current = target;
    isProgrammaticScrollRef.current = true;
    el.scrollTop = target;
    updateProgressInternal(target, maxScroll, true);
  }, [updateProgressInternal]);

  return {
    containerRef,
    scrollProgress,
    isAtEnd,
    restart,
    jump,
    jumpToPercent,
    handleManualScroll,
  };
}
