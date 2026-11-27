import { useCallback, useEffect, useRef, useState } from 'react';
import { readJson, writeJson } from '../../../shared/lib/storage';

const MUTED_KEY = 'rifa:sorteio:mudo';
// Arquivo em apps/frontend/public/sounds/. Sem ele, toca o rufar sintético.
const DRUMROLL_URL = '/sounds/rufar_de_tambores.mp3';
// O mp3 (2,1s) começa com uma batida e termina num decaimento. Depois da primeira passada, repete só
// o miolo da rolagem, para a batida inicial não voltar no meio do suspense. Ajustar se trocar o arquivo.
const DRUMROLL_LOOP_START = 1.0;
const DRUMROLL_LOOP_END = 1.85;
// Volume do rufar sobe de 50% a 100% nesse tempo e depois fica no máximo até parar
const CRESCENDO_SECONDS = 5;
// Rufar sintético: agenda os toques até esse limite (o sorteio para bem antes)
const SYNTH_MAX_SECONDS = 15;
const FADE_OUT_SECONDS = 0.12;

// Ponto de corte do loop num cruzamento por zero (até 5ms de distância), para não estalar
function nearestZeroCrossing(buffer, time) {
  const sampleList = buffer.getChannelData(0);
  const center = Math.round(time * buffer.sampleRate);
  const range = Math.round(0.005 * buffer.sampleRate);
  for (let offset = 0; offset <= range; offset++) {
    for (const i of [center + offset, center - offset]) {
      if (i > 0 && i < sampleList.length && Math.sign(sampleList[i - 1]) !== Math.sign(sampleList[i])) {
        return i / buffer.sampleRate;
      }
    }
  }
  return time;
}

// Ruído curto que decai: base do toque de caixa sintético
function createHitBuffer(ctx) {
  const size = Math.floor(ctx.sampleRate * 0.08);
  const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
  const sampleList = buffer.getChannelData(0);
  for (let i = 0; i < size; i++) sampleList[i] = (Math.random() * 2 - 1) * (1 - i / size);
  return buffer;
}

function playHit(ctx, output, hitBuffer, time, volume) {
  const noise = ctx.createBufferSource();
  noise.buffer = hitBuffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 1200;
  const gain = ctx.createGain();
  gain.gain.value = volume;
  noise.connect(filter).connect(gain).connect(output);
  noise.start(time);
}

// Decodifica num OfflineAudioContext: não precisa de clique do usuário e não gera aviso de autoplay
async function loadDrumroll() {
  const response = await fetch(DRUMROLL_URL);
  if (!response.ok || !response.headers.get('content-type')?.startsWith('audio/')) return null;
  const Offline = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  return new Offline(2, 1, 44100).decodeAudioData(await response.arrayBuffer());
}

const noop = () => {};

/**
 * Sons do sorteio: rufar de tambor (mp3 do projeto ou sintético), "clunk" de rolo parando e fanfarra.
 * `preload()` baixa o mp3 uma vez; se ele não chegar a tempo, o rufar sai sintético.
 */
export function useDrawSounds() {
  const ctxRef = useRef(null);
  const masterRef = useRef(null);
  const drumrollRef = useRef(null);
  const loadingRef = useRef(null);
  const [muted, setMuted] = useState(() => readJson(MUTED_KEY, false) === true);
  const mutedRef = useRef(muted);

  useEffect(() => {
    mutedRef.current = muted;
    writeJson(MUTED_KEY, muted);
    // Mudo no meio do rufar corta o som na hora
    const master = masterRef.current;
    if (master) master.gain.setValueAtTime(muted ? 0 : 1, master.context.currentTime);
  }, [muted]);

  const preload = useCallback(() => {
    loadingRef.current ??= loadDrumroll()
      .then((buffer) => { drumrollRef.current = buffer; })
      .catch(() => {}); // sem mp3: fica o rufar sintético
  }, []);

  // Fecha o AudioContext ao desmontar (zerando as refs por causa do StrictMode)
  useEffect(() => () => {
    ctxRef.current?.close().catch(() => {});
    ctxRef.current = null;
    masterRef.current = null;
  }, []);

  const getOutput = useCallback(() => {
    if (!ctxRef.current) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const master = ctx.createGain();
      master.gain.value = mutedRef.current ? 0 : 1;
      master.connect(ctx.destination);
      ctxRef.current = ctx;
      masterRef.current = master;
    }
    return { ctx: ctxRef.current, output: masterRef.current };
  }, []);

  // Chamar dentro do clique do usuário (política de autoplay dos navegadores)
  const unlock = useCallback(() => {
    try {
      getOutput().ctx.resume().catch(() => {});
    } catch {
      /* navegador sem Web Audio: segue sem som */
    }
  }, [getOutput]);

  // Rufar em crescendo até chamar o `stop()` devolvido (quando o último rolo para).
  // Com o mp3: primeira passada inteira e depois o miolo em loop. Sem ele: toques de 180ms caindo para 40ms.
  const playDrumroll = useCallback(() => {
    try {
      const { ctx, output } = getOutput();
      const now = ctx.currentTime;
      const roll = ctx.createGain();
      roll.gain.setValueAtTime(0.5, now);
      roll.gain.linearRampToValueAtTime(1, now + CRESCENDO_SECONDS);
      roll.connect(output);

      let source = null;
      const buffer = drumrollRef.current;
      if (buffer) {
        source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        if (buffer.duration > DRUMROLL_LOOP_END) {
          source.loopStart = nearestZeroCrossing(buffer, DRUMROLL_LOOP_START);
          source.loopEnd = nearestZeroCrossing(buffer, DRUMROLL_LOOP_END);
        }
        source.connect(roll);
        source.start(now);
      } else {
        const hitBuffer = createHitBuffer(ctx);
        for (let t = 0; t < SYNTH_MAX_SECONDS;) {
          const progress = Math.min(t / CRESCENDO_SECONDS, 1);
          playHit(ctx, roll, hitBuffer, now + 0.05 + t, 0.15 + 0.5 * progress);
          t += 0.18 - 0.14 * progress;
        }
      }

      return () => {
        const end = ctx.currentTime;
        roll.gain.cancelScheduledValues(end);
        roll.gain.setValueAtTime(roll.gain.value, end);
        roll.gain.linearRampToValueAtTime(0, end + FADE_OUT_SECONDS); // fim sem estalo
        source?.stop(end + FADE_OUT_SECONDS);
        setTimeout(() => roll.disconnect(), (FADE_OUT_SECONDS + 0.05) * 1000);
      };
    } catch {
      return noop; // sem áudio
    }
  }, [getOutput]);

  // "Clunk" de rolo parando: tom grave que cai rápido
  const playReelStop = useCallback((strong = false) => {
    try {
      const { ctx, output } = getOutput();
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(strong ? 260 : 220, t);
      osc.frequency.exponentialRampToValueAtTime(70, t + 0.12);
      gain.gain.setValueAtTime(strong ? 0.55 : 0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
      osc.connect(gain).connect(output);
      osc.start(t);
      osc.stop(t + 0.2);
    } catch {
      /* sem áudio */
    }
  }, [getOutput]);

  // Fanfarra: arpejo de dó maior
  const playFanfare = useCallback(() => {
    try {
      const { ctx, output } = getOutput();
      const frequencyList = [523.25, 659.25, 783.99, 1046.5];
      frequencyList.forEach((frequency, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = ctx.currentTime + i * 0.12;
        const last = i === frequencyList.length - 1;
        osc.type = 'triangle';
        osc.frequency.value = frequency;
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + (last ? 1.2 : 0.3));
        osc.connect(gain).connect(output);
        osc.start(t);
        osc.stop(t + 1.3);
      });
    } catch {
      /* sem áudio */
    }
  }, [getOutput]);

  const toggleMute = useCallback(() => setMuted((value) => !value), []);

  return { preload, unlock, playDrumroll, playReelStop, playFanfare, muted, toggleMute };
}
