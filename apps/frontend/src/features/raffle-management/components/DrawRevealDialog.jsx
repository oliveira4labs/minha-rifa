import { useEffect, useRef } from 'react';
import { formatDate, padNumber } from '../../../shared/lib/format';
import { Dialog } from '../../../shared/ui/feedback/Dialog';
import { LAST_REEL_STOP_MS, REEL_STOP_MS } from '../hooks/useDrawReveal';
import { SlotMachine } from './SlotMachine';

const EYEBROW = {
  ready: 'Pronto para sortear',
  spinning: 'Sorteando…',
  silence: 'Número sorteado',
  revealed: 'Número sorteado',
};

// Palco escuro em tela cheia: mostra só a rifa e a máquina, nada de valores, pedidos ou WhatsApp
export function DrawRevealDialog({ reveal, raffle, coverUrl }) {
  const { stage, start, close, canvasRef, muted, toggleMute, showName, toggleShowName } = reveal;
  const phase = stage?.phase ?? 'ready';
  const ready = phase === 'ready';
  const revealed = phase === 'revealed';
  const startRef = useRef(null);
  const total = raffle.total_numbers;
  const digitCount = String(total).length;
  const winner = stage?.winner;
  const digitList = winner ? [...padNumber(winner.number, total)].map(Number) : null;

  // O <dialog> foca o primeiro botão ao abrir; o foco certo é o "Sortear"
  useEffect(() => {
    if (stage?.phase === 'ready') startRef.current?.focus();
  }, [stage?.phase]);

  const announcement = revealed
    ? `Número sorteado: ${padNumber(winner.number, total)}${showName ? `, de ${winner.name}` : ''}.`
    : phase === 'spinning' ? 'Sorteando…' : '';

  return (
    <Dialog
      open={reveal.isOpen}
      onClose={close}
      // Esc volta (antes de sortear) ou fecha (depois); no meio do suspense não faz nada
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      className="draw-stage"
      data-phase={phase}
      aria-label={`Sorteio da rifa ${raffle.title}`}
    >
      <div className="draw-spotlights" aria-hidden="true"><i /><i /></div>
      <canvas ref={canvasRef} className="draw-confetti" aria-hidden="true" />

      <div className="draw-stage-bar">
        {ready ? <button type="button" className="draw-chip" onClick={close}>← Voltar</button> : <span />}
        <div className="draw-stage-toggles">
          {/* Escolha feita antes de sortear; some da gravação depois */}
          {ready && (
            <button type="button" className="draw-chip" onClick={toggleShowName} aria-pressed={showName}>
              {showName ? '👤 Mostrar nome do ganhador' : '👤 Só o número do ganhador'}
            </button>
          )}
          <button type="button" className="draw-chip" onClick={toggleMute} aria-pressed={muted}>
            {muted ? '🔇 Som desligado' : '🔊 Som ligado'}
          </button>
        </div>
      </div>

      {stage && (
        <div className="draw-stage-body">
          <div className="draw-heading">
            {coverUrl && <img className="draw-cover" src={coverUrl} alt="" />}
            <h1 className="draw-title">{raffle.title}</h1>
          </div>

          <p className="draw-eyebrow">{EYEBROW[phase]}</p>
          <SlotMachine
            digitList={digitList}
            digitCount={digitCount}
            spinning={phase === 'spinning'}
            stoppedCount={stage.stoppedCount}
            stopMs={REEL_STOP_MS}
            lastStopMs={LAST_REEL_STOP_MS}
            revealed={revealed}
          />
          <p className="sr-only" aria-live="polite">{announcement}</p>

          {!revealed && (
            <p className="draw-pool">
              🎟️ {stage.poolSize} {stage.poolSize === 1 ? 'número concorrendo' : 'números concorrendo'}
            </p>
          )}

          {ready && (
            <div className="draw-controls stack-sm">
              <button ref={startRef} type="button" className="btn draw-start" onClick={start}>Sortear</button>
              <p className="draw-hint">
                Esta tela não mostra valores, pedidos nem contatos. Se for gravar para os participantes, comece agora.
              </p>
            </div>
          )}

          {revealed && (
            <div className="draw-result stack-sm">
              {showName && <p className="draw-name">{winner.name}</p>}
              <p className="draw-when">Sorteado em {formatDate(winner.drawn_at)}</p>
              <div>
                <button type="button" className="btn" onClick={close} autoFocus>Fechar</button>
              </div>
            </div>
          )}
        </div>
      )}
    </Dialog>
  );
}
