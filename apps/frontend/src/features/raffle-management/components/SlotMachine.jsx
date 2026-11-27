import { useEffect, useRef } from 'react';

// Cada rolo é uma fita com 0–9 repetido; mostra o dígito do centro e um pedaço dos vizinhos
const CYCLE_LIST = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const STRIP_LIST = [...CYCLE_LIST, ...CYCLE_LIST, ...CYCLE_LIST, ...CYCLE_LIST];
const SPIN_CYCLE_MS = 420;
// Quanto da célula de cima aparece na janela (a janela tem 1,6 célula de altura)
const PEEK = 0.3;
// Desacelera e passa um pouquinho do ponto antes de assentar: o "tranco" do rolo
const STOP_EASING = 'cubic-bezier(.16, .84, .3, 1.08)';
const LAST_STOP_EASING = 'cubic-bezier(.12, .9, .2, 1.04)';

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const cellHeight = (strip) => strip.firstElementChild.getBoundingClientRect().height;

function Reel({ spinning, digit, stopMs, last }) {
  const stripRef = useRef(null);
  const spinRef = useRef(null);
  const reduced = useRef(prefersReducedMotion()).current;

  // Cancela as animações só ao desmontar (no stop a animação de giro ainda é lida)
  useEffect(() => () => {
    spinRef.current?.cancel();
    spinRef.current = null;
  }, []);

  useEffect(() => {
    const strip = stripRef.current;
    if (reduced || !strip) return;

    if (spinning) {
      if (spinRef.current) return;
      const cell = cellHeight(strip);
      const top = PEEK * cell;
      const spin = strip.animate(
        [{ transform: `translateY(${top}px)` }, { transform: `translateY(${top - 10 * cell}px)` }],
        { duration: SPIN_CYCLE_MS, iterations: Infinity, easing: 'linear' },
      );
      spin.currentTime = Math.random() * SPIN_CYCLE_MS; // cada rolo numa posição diferente
      spinRef.current = spin;
      return;
    }

    const spin = spinRef.current;
    if (digit == null || !spin) return;
    // Parte de onde o giro está e anda até o dígito sorteado (mais voltas no último rolo)
    const cell = cellHeight(strip);
    const top = PEEK * cell;
    const fromCells = ((spin.currentTime % SPIN_CYCLE_MS) / SPIN_CYCLE_MS) * 10;
    let toCells = (last ? 20 : 10) + digit;
    if (toCells - fromCells < 8) toCells += 10;
    spin.cancel();
    spinRef.current = null;

    const to = `translateY(${top - toCells * cell}px)`;
    const stop = strip.animate(
      [{ transform: `translateY(${top - fromCells * cell}px)` }, { transform: to }],
      { duration: stopMs, easing: last ? LAST_STOP_EASING : STOP_EASING, fill: 'forwards' },
    );
    stop.finished.then(() => {
      strip.style.transform = to;
      stop.cancel();
    }).catch(() => {});
  }, [spinning, digit, stopMs, last, reduced]);

  const stopped = !spinning && digit != null;
  const className = `reel${spinning ? ' spinning' : ''}${stopped ? ' stopped' : ''}${last ? ' last' : ''}`;

  // Sem giro (antes de sortear ou com movimento reduzido): só o "?" ou o dígito
  if (reduced || (!spinning && digit == null)) {
    return (
      <div className={className}>
        <span className="reel-static" key={stopped ? 'digit' : 'unknown'}>{stopped ? digit : '?'}</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="reel-strip" ref={stripRef}>
        {STRIP_LIST.map((value, i) => <span key={i}>{value}</span>)}
      </div>
    </div>
  );
}

/**
 * Máquina de caça-níquel: um rolo por dígito do número (com zeros à esquerda).
 * Os rolos giram enquanto `spinning` e param, da esquerda para a direita, conforme `stoppedCount` aumenta.
 */
export function SlotMachine({ digitList, digitCount, spinning, stoppedCount, stopMs, lastStopMs, revealed }) {
  return (
    <div className={`slot${spinning ? ' slot-spinning' : ''}${revealed ? ' slot-revealed' : ''}`} style={{ '--digits': digitCount }}>
      <span className="slot-bulbs" aria-hidden="true">{Array.from({ length: 11 }, (_, i) => <i key={i} />)}</span>
      <div className="slot-reels" aria-hidden="true">
        {Array.from({ length: digitCount }, (_, i) => {
          const last = i === digitCount - 1;
          return (
            <Reel
              key={i}
              spinning={spinning && i >= stoppedCount}
              digit={i < stoppedCount ? digitList?.[i] : null}
              stopMs={last ? lastStopMs : stopMs}
              last={last}
            />
          );
        })}
      </div>
      <span className="slot-bulbs" aria-hidden="true">{Array.from({ length: 11 }, (_, i) => <i key={i} />)}</span>
    </div>
  );
}
