import { useCallback, useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { readJson, writeJson } from '../../../shared/lib/storage';
import { useDrawSounds } from './useDrawSounds';

// Linha do tempo do caça-níquel (≈6s com 3 dígitos)
const MIN_SPIN_MS = 1800; // todos os rolos girando antes do primeiro parar
export const REEL_STOP_MS = 700; // um rolo desacelerando até parar
const REEL_GAP_MS = 120; // respiro entre um rolo parar e o próximo começar a parar
const LAST_REEL_SOLO_MS = 800; // o último rolo gira sozinho um pouco antes de parar
export const LAST_REEL_STOP_MS = 1600; // e desacelera mais devagar
const SILENCE_BEAT_MS = 450; // o "beat" entre o último rolo parar e a festa
const CONFETTI_MS = 3000;
const CONFETTI_COLOR_LIST = ['#f5c84b', '#ffe08a', '#ffffff', '#e2f1ec', '#6fb8a3'];
const SHOW_NAME_KEY = 'rifa:sorteio:mostrar-nome';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Palco do sorteio, em tela cheia e sem dados do painel (dá para gravar a tela e mandar aos participantes).
 *
 * `open()` mostra o palco pronto e resolve ao fechar: `true` se sorteou, `false` se o admin voltou sem sortear;
 * rejeita se o sorteio falhar. `start()` (o botão "Sortear" do palco) gira os rolos com o rufar, para um rolo
 * de cada vez e revela com fanfarra e confete. O ganhador vem do servidor (`fetchWinner`); os rolos são só
 * efeito visual e não influenciam o resultado.
 */
export function useDrawReveal() {
  const sounds = useDrawSounds();
  const { unlock, playDrumroll, playReelStop, playFanfare } = sounds;
  // null | { phase: 'ready' | 'spinning' | 'silence' | 'revealed', poolSize, stoppedCount, winner }
  const [stage, setStage] = useState(null);
  const [showName, setShowName] = useState(() => readJson(SHOW_NAME_KEY, true) !== false);
  const canvasRef = useRef(null);
  const confettiRef = useRef(null);
  const aliveRef = useRef(true);
  // { digitCount, fetchWinner, resolve, reject, status: 'ready' | 'running' | 'done' }
  const sessionRef = useRef(null);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      confettiRef.current?.reset();
    };
  }, []);

  useEffect(() => writeJson(SHOW_NAME_KEY, showName), [showName]);

  const fireConfetti = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    confettiRef.current ??= confetti.create(canvas, { resize: true });
    const fire = confettiRef.current;
    const base = { colors: CONFETTI_COLOR_LIST, disableForReducedMotion: true };
    const end = Date.now() + CONFETTI_MS;

    fire({ ...base, particleCount: 160, spread: 100, startVelocity: 45, origin: { y: 0.55 } });
    (function frame() {
      if (!aliveRef.current || sessionRef.current?.status !== 'done') return;
      fire({ ...base, particleCount: 6, angle: 60, spread: 60, origin: { x: 0 } });
      fire({ ...base, particleCount: 6, angle: 120, spread: 60, origin: { x: 1 } });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, []);

  const finish = useCallback(() => {
    confettiRef.current?.reset();
    sessionRef.current = null;
    setStage(null);
  }, []);

  const open = useCallback(({ poolSize, digitCount, fetchWinner }) => new Promise((resolve, reject) => {
    sessionRef.current = { digitCount, fetchWinner, resolve, reject, status: 'ready' };
    setStage({ phase: 'ready', poolSize, stoppedCount: 0, winner: null });
  }), []);

  const start = useCallback(async () => {
    const session = sessionRef.current;
    if (session?.status !== 'ready') return;
    session.status = 'running';
    unlock(); // dentro do clique em "Sortear", libera o áudio

    let winner = null;
    let failure = null;
    let settled = false;
    session.fetchWinner().then(
      (value) => { winner = value; },
      (error) => { failure = error; },
    ).finally(() => { settled = true; });

    setStage((s) => ({ ...s, phase: 'spinning' }));
    const stopDrumroll = playDrumroll();

    // Todos os rolos girando até o tempo mínimo passar e o servidor responder
    const startedAt = performance.now();
    while (!failure && !(settled && performance.now() - startedAt >= MIN_SPIN_MS)) {
      if (!aliveRef.current) return stopDrumroll();
      await sleep(100);
    }

    if (failure) {
      stopDrumroll();
      finish();
      session.reject(failure);
      return;
    }

    // Para um rolo de cada vez, da esquerda para a direita; o último gira sozinho e para mais devagar
    setStage((s) => ({ ...s, winner }));
    const { digitCount } = session;
    for (let i = 0; i < digitCount; i++) {
      const last = i === digitCount - 1;
      if (last && digitCount > 1) await sleep(LAST_REEL_SOLO_MS);
      if (!aliveRef.current) return stopDrumroll();
      setStage((s) => ({ ...s, stoppedCount: i + 1 }));
      await sleep(last ? LAST_REEL_STOP_MS : REEL_STOP_MS);
      if (!aliveRef.current) return stopDrumroll();
      playReelStop(last);
      if (!last) await sleep(REEL_GAP_MS);
    }
    stopDrumroll();

    // O "beat" de silêncio antes da festa
    setStage((s) => ({ ...s, phase: 'silence' }));
    await sleep(SILENCE_BEAT_MS);
    if (!aliveRef.current) return undefined;

    session.status = 'done';
    setStage((s) => ({ ...s, phase: 'revealed' }));
    playFanfare();
    fireConfetti();
    return undefined;
  }, [unlock, playDrumroll, playReelStop, playFanfare, fireConfetti, finish]);

  // Antes de sortear: volta sem sortear. Depois da revelação: fecha. No meio do suspense: não faz nada.
  const close = useCallback(() => {
    const session = sessionRef.current;
    if (!session || session.status === 'running') return;
    finish();
    session.resolve(session.status === 'done');
  }, [finish]);

  const toggleShowName = useCallback(() => setShowName((value) => !value), []);

  return {
    stage,
    isOpen: stage != null,
    preload: sounds.preload,
    open,
    start,
    close,
    canvasRef,
    muted: sounds.muted,
    toggleMute: sounds.toggleMute,
    showName,
    toggleShowName,
  };
}
